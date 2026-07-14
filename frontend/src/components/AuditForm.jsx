import { useState } from 'react'

function isValidUrl(value) {
  // Must start with https:// (full URL required, no auto-fixing)
  if (!/^https:\/\//i.test(value)) return false
  try {
    const u = new URL(value)
    if (u.protocol !== 'https:') return false
    // Hostname must look like a real domain: at least one dot and a valid TLD
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)) return false
    return true
  } catch {
    return false
  }
}

export default function AuditForm({ onAudit, loading }) {
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const url = e.target.url.value.trim()
    if (!url) return

    if (!isValidUrl(url)) {
      setError('Please enter a complete, valid URL starting with https:// (e.g. https://yourwebsite.com)')
      return
    }

    setError('')
    onAudit(url)
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <form onSubmit={handleSubmit} className="audit-form" style={{ display: 'flex', gap: 8 }}>
        <input name="url" type="text" placeholder="https://yourwebsite.com" disabled={loading}
          style={{ flex: 1, minWidth: 0, padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--card)', color: 'var(--text)', outline: 'none' }} />
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flexShrink: 0 }}>
          {loading ? 'Analyzing...' : '⚡ Run Audit'}
        </button>
      </form>
      {error && (
        <p style={{ color: '#e5484d', fontSize: 13, marginTop: 8 }}>⚠️ {error}</p>
      )}
    </div>
  )
}

