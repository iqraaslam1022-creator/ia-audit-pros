import dns from 'node:dns/promises'
import net from 'node:net'

// Yeh function backend ko SSRF (Server-Side Request Forgery) se bachata hai —
// warna koi user "audit" URL field mein internal/private address daal kar
// server ko apne internal network ya cloud metadata endpoint tak pohanchne
// pe majboor kar sakta tha.

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain', 'ip6-localhost', 'metadata.google.internal'])

const INVALID_URL_MESSAGE = 'Please enter a complete, valid URL starting with https:// (e.g. https://yourwebsite.com)'
const BLOCKED_TARGET_MESSAGE = 'This URL points to a private or internal address and cannot be audited.'

function isPrivateIPv4(ip) {
    const parts = ip.split('.').map(Number)
    if (parts.length !== 4 || parts.some(Number.isNaN)) return true
    const [a, b] = parts
    if (a === 10) return true                          // 10.0.0.0/8
    if (a === 127) return true                          // loopback
    if (a === 0) return true                             // "this network"
    if (a === 169 && b === 254) return true              // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true      // 172.16.0.0/12
    if (a === 192 && b === 168) return true               // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true      // carrier-grade NAT
    return false
}

function isPrivateIP(ip) {
    const type = net.isIP(ip)
    if (type === 4) return isPrivateIPv4(ip)
    if (type === 6) {
        const lower = ip.toLowerCase()
        if (lower === '::1') return true                    // loopback
        if (lower.startsWith('fe80:')) return true            // link-local
        if (lower.startsWith('fc') || lower.startsWith('fd')) return true // unique local
        if (lower.startsWith('::ffff:')) return isPrivateIPv4(lower.split(':').pop()) // IPv4-mapped
        return false
    }
    return true // unknown/unparseable -> treat as unsafe
}

// Validates that `rawUrl` is a well-formed https:// URL AND that it does not
// resolve to a private/internal/loopback address. Throws with a user-facing
// message on failure. Returns the normalized URL string on success.
export async function assertSafeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') throw new Error(INVALID_URL_MESSAGE)

    let parsed
    try {
        parsed = new URL(rawUrl)
    } catch {
        throw new Error(INVALID_URL_MESSAGE)
    }

    if (parsed.protocol !== 'https:') throw new Error(INVALID_URL_MESSAGE)

    const hostname = parsed.hostname.toLowerCase()
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(hostname)) throw new Error(INVALID_URL_MESSAGE)

    if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
        throw new Error(BLOCKED_TARGET_MESSAGE)
    }

    // Hostname is itself a raw IP address
    if (net.isIP(hostname)) {
        if (isPrivateIP(hostname)) throw new Error(BLOCKED_TARGET_MESSAGE)
        return parsed.toString()
    }

    // Resolve DNS and block if ANY resolved address is private
    // (stops attackers pointing a public domain at an internal IP)
    let addresses
    try {
        addresses = await dns.lookup(hostname, { all: true })
    } catch {
        throw new Error('Could not resolve this URL. Please check it and try again.')
    }

    if (addresses.length === 0 || addresses.some(a => isPrivateIP(a.address))) {
        throw new Error(BLOCKED_TARGET_MESSAGE)
    }

    return parsed.toString()
}