export default async function auditRoutes(fastify) {

  // ─── Helper: Fetch Real Website Data ─────────────────────────────────────────
  async function fetchWebsiteData(url) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IAuditBot/1.0)' },
        signal: AbortSignal.timeout(10000)
      })
      const html = await res.text()
      const headers = Object.fromEntries(res.headers.entries())
      return { html, headers, status: res.status, ok: res.ok }
    } catch (e) {
      return { html: '', headers: {}, status: 0, ok: false, error: e.message }
    }
  }

  // ─── Helper: Parse HTML for SEO Data ─────────────────────────────────────────
  function parseHTML(html, url) {
    const get = (regex) => { const m = html.match(regex); return m ? m[1] : null }
    const getAll = (regex) => { const m = html.match(regex); return m || [] }

    const title = get(/<title[^>]*>([^<]+)<\/title>/i)
    const metaDesc = get(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const metaViewport = get(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i)
    const canonical = get(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    const h1Tags = getAll(/<h1[^>]*>[^<]+<\/h1>/gi)
    const h2Tags = getAll(/<h2[^>]*>[^<]+<\/h2>/gi)
    const imgTags = getAll(/<img[^>]+>/gi)
    const imgNoAlt = imgTags.filter(img => !img.match(/alt=["'][^"']+["']/i))
    const links = getAll(/href=["']([^"'#]+)["']/gi)
    const brokenLinks = links.filter(l => l.includes('undefined') || l.includes('null'))
    const hasRobots = html.includes('robots') || html.includes('noindex')
    const hasSitemap = html.includes('sitemap')
    const hasSchema = html.includes('application/ld+json') || html.includes('schema.org')
    const hasOG = html.includes('og:title') || html.includes('og:description')
    const isHTTPS = url.startsWith('https')

    return {
      title, metaDesc, metaViewport, canonical,
      h1Count: h1Tags.length, h2Count: h2Tags.length,
      imgTotal: imgTags.length, imgNoAlt: imgNoAlt.length,
      hasRobots, hasSitemap, hasSchema, hasOG, isHTTPS,
      brokenLinks: brokenLinks.length
    }
  }

  // ─── Helper: Check Security Headers ──────────────────────────────────────────
  function checkSecurity(headers, isHTTPS) {
    return {
      https: isHTTPS,
      hsts: !!headers['strict-transport-security'],
      xframe: !!headers['x-frame-options'],
      xcontent: !!headers['x-content-type-options'],
      xss: !!headers['x-xss-protection'],
      csp: !!headers['content-security-policy'],
      referrer: !!headers['referrer-policy'],
    }
  }

  // ─── Helper: Get PageSpeed Data ───────────────────────────────────────────────
  async function getPageSpeed(url) {
    try {
      const apiKey = process.env.PAGESPEED_API_KEY
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices`
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) })
      const data = await res.json()
      if (data.error) return null

      const cats = data.lighthouseResult?.categories || {}
      const audits = data.lighthouseResult?.audits || {}

      return {
        performance: Math.round((cats.performance?.score || 0) * 100),
        seo: Math.round((cats.seo?.score || 0) * 100),
        accessibility: Math.round((cats.accessibility?.score || 0) * 100),
        bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
        fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
        lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
        tbt: audits['total-blocking-time']?.displayValue || 'N/A',
        cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
        speedIndex: audits['speed-index']?.displayValue || 'N/A',
        renderBlocking: audits['render-blocking-resources']?.score === 0,
        imageOptimization: audits['uses-optimized-images']?.score === 0,
        unusedCSS: audits['unused-css-rules']?.score === 0,
        unusedJS: audits['unused-javascript']?.score === 0,
      }
    } catch (e) {
      return null
    }
  }

  // ─── Helper: Build Real Audit Results ────────────────────────────────────────
  function buildAuditResult(seo, security, ps, url) {
    const seoIssues = []
    const performanceIssues = []
    const securityIssues = []
    const bugIssues = []

    // ── SEO Issues ──
    if (!seo.title) {
      seoIssues.push({ type: 'critical', title: 'Missing Title Tag', desc: 'Your page has no title tag which is critical for SEO.', fix: 'Add <title>Your Page Title</title> in the <head> section.' })
    } else if (seo.title.length < 30) {
      seoIssues.push({ type: 'warning', title: 'Title Tag Too Short', desc: `Title is only ${seo.title.length} chars. Ideal is 50-60.`, fix: 'Expand your title tag to be more descriptive (50-60 characters).' })
    } else if (seo.title.length > 60) {
      seoIssues.push({ type: 'warning', title: 'Title Tag Too Long', desc: `Title is ${seo.title.length} chars. Google truncates after 60.`, fix: 'Shorten your title tag to under 60 characters.' })
    } else {
      seoIssues.push({ type: 'pass', title: 'Title Tag Optimized', desc: `Title: "${seo.title}" — length is perfect.`, fix: 'None needed.' })
    }

    if (!seo.metaDesc) {
      seoIssues.push({ type: 'critical', title: 'Missing Meta Description', desc: 'No meta description found. This affects click-through rates.', fix: 'Add <meta name="description" content="Your description here"> in <head>.' })
    } else if (seo.metaDesc.length < 100) {
      seoIssues.push({ type: 'warning', title: 'Meta Description Too Short', desc: `Only ${seo.metaDesc.length} chars. Ideal is 150-160.`, fix: 'Expand meta description to 150-160 characters.' })
    } else {
      seoIssues.push({ type: 'pass', title: 'Meta Description Present', desc: 'Good meta description found.', fix: 'None needed.' })
    }

    if (seo.h1Count === 0) {
      seoIssues.push({ type: 'critical', title: 'No H1 Tag Found', desc: 'Missing H1 tag. Every page needs exactly one H1.', fix: 'Add one <h1> tag with your main keyword.' })
    } else if (seo.h1Count > 1) {
      seoIssues.push({ type: 'warning', title: 'Multiple H1 Tags', desc: `Found ${seo.h1Count} H1 tags. Only one is recommended.`, fix: 'Keep only one H1 tag per page.' })
    } else {
      seoIssues.push({ type: 'pass', title: 'H1 Tag Correct', desc: 'Exactly one H1 tag found.', fix: 'None needed.' })
    }

    if (seo.imgNoAlt > 0) {
      seoIssues.push({ type: 'warning', title: `${seo.imgNoAlt} Images Missing Alt Text`, desc: `${seo.imgNoAlt} out of ${seo.imgTotal} images have no alt attribute.`, fix: 'Add descriptive alt text to all images for accessibility and SEO.' })
    } else if (seo.imgTotal > 0) {
      seoIssues.push({ type: 'pass', title: 'All Images Have Alt Text', desc: `All ${seo.imgTotal} images have alt attributes.`, fix: 'None needed.' })
    }

    if (!seo.canonical) {
      seoIssues.push({ type: 'warning', title: 'No Canonical Tag', desc: 'Missing canonical URL tag which can cause duplicate content issues.', fix: 'Add <link rel="canonical" href="your-url"> in <head>.' })
    } else {
      seoIssues.push({ type: 'pass', title: 'Canonical Tag Present', desc: 'Canonical URL is properly set.', fix: 'None needed.' })
    }

    if (!seo.hasOG) {
      seoIssues.push({ type: 'info', title: 'Missing Open Graph Tags', desc: 'No OG tags found. These improve social media sharing appearance.', fix: 'Add og:title, og:description, og:image meta tags.' })
    } else {
      seoIssues.push({ type: 'pass', title: 'Open Graph Tags Present', desc: 'OG tags found for social sharing.', fix: 'None needed.' })
    }

    // ── Performance Issues ──
    if (ps) {
      if (ps.performance < 50) {
        performanceIssues.push({ type: 'critical', title: 'Very Poor Performance Score', desc: `PageSpeed score is ${ps.performance}/100. Major issues detected.`, fix: 'Optimize images, remove unused CSS/JS, enable caching.' })
      } else if (ps.performance < 80) {
        performanceIssues.push({ type: 'warning', title: 'Performance Needs Improvement', desc: `PageSpeed score is ${ps.performance}/100.`, fix: 'Optimize resources to reach 90+ score.' })
      } else {
        performanceIssues.push({ type: 'pass', title: 'Good Performance Score', desc: `PageSpeed score is ${ps.performance}/100.`, fix: 'None needed.' })
      }

      performanceIssues.push({ type: ps.lcp === 'N/A' ? 'info' : parseFloat(ps.lcp) > 2.5 ? 'warning' : 'pass', title: 'Largest Contentful Paint (LCP)', desc: `LCP is ${ps.lcp}. Good LCP is under 2.5s.`, fix: 'Optimize hero images and server response time.' })
      performanceIssues.push({ type: ps.fcp === 'N/A' ? 'info' : parseFloat(ps.fcp) > 1.8 ? 'warning' : 'pass', title: 'First Contentful Paint (FCP)', desc: `FCP is ${ps.fcp}. Good FCP is under 1.8s.`, fix: 'Remove render-blocking resources and optimize critical CSS.' })
      performanceIssues.push({ type: ps.cls === 'N/A' ? 'info' : parseFloat(ps.cls) > 0.1 ? 'warning' : 'pass', title: 'Cumulative Layout Shift (CLS)', desc: `CLS is ${ps.cls}. Good CLS is under 0.1.`, fix: 'Set explicit width/height on images and embeds.' })

      if (ps.renderBlocking) {
        performanceIssues.push({ type: 'warning', title: 'Render Blocking Resources', desc: 'CSS or JS files are blocking page render.', fix: 'Add defer/async to scripts. Move CSS to avoid render blocking.' })
      }
      if (ps.unusedCSS) {
        performanceIssues.push({ type: 'warning', title: 'Unused CSS Detected', desc: 'Unused CSS is increasing page weight.', fix: 'Remove unused CSS rules using PurgeCSS or similar tools.' })
      }
      if (ps.unusedJS) {
        performanceIssues.push({ type: 'warning', title: 'Unused JavaScript Detected', desc: 'Unused JS is slowing down page load.', fix: 'Use code splitting and tree shaking to remove unused JS.' })
      }
      if (ps.imageOptimization) {
        performanceIssues.push({ type: 'warning', title: 'Images Not Optimized', desc: 'Images can be compressed further.', fix: 'Use WebP format and compress images with tools like Squoosh.' })
      }
    } else {
      performanceIssues.push({ type: 'info', title: 'PageSpeed Data Unavailable', desc: 'Could not fetch real PageSpeed data for this URL.', fix: 'Make sure the website is publicly accessible.' })
    }

    // ── Security Issues ──
    if (!security.https) {
      securityIssues.push({ type: 'critical', title: 'No HTTPS', desc: 'Website is not using HTTPS. Data is transmitted insecurely.', fix: 'Install an SSL certificate. Use Let\'s Encrypt for free SSL.' })
    } else {
      securityIssues.push({ type: 'pass', title: 'HTTPS Enabled', desc: 'Website uses HTTPS encryption.', fix: 'None needed.' })
    }

    if (!security.hsts) {
      securityIssues.push({ type: 'warning', title: 'Missing HSTS Header', desc: 'Strict-Transport-Security header not found.', fix: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains' })
    } else {
      securityIssues.push({ type: 'pass', title: 'HSTS Header Present', desc: 'HSTS is properly configured.', fix: 'None needed.' })
    }

    if (!security.xframe) {
      securityIssues.push({ type: 'warning', title: 'Missing X-Frame-Options', desc: 'Site may be vulnerable to clickjacking attacks.', fix: 'Add header: X-Frame-Options: SAMEORIGIN' })
    } else {
      securityIssues.push({ type: 'pass', title: 'X-Frame-Options Set', desc: 'Clickjacking protection is enabled.', fix: 'None needed.' })
    }

    if (!security.xcontent) {
      securityIssues.push({ type: 'warning', title: 'Missing X-Content-Type-Options', desc: 'MIME type sniffing attacks possible.', fix: 'Add header: X-Content-Type-Options: nosniff' })
    } else {
      securityIssues.push({ type: 'pass', title: 'X-Content-Type-Options Set', desc: 'MIME sniffing protection enabled.', fix: 'None needed.' })
    }

    if (!security.csp) {
      securityIssues.push({ type: 'warning', title: 'No Content Security Policy', desc: 'Missing CSP header leaves site vulnerable to XSS attacks.', fix: 'Add Content-Security-Policy header to restrict resource loading.' })
    } else {
      securityIssues.push({ type: 'pass', title: 'Content Security Policy Set', desc: 'CSP header is configured.', fix: 'None needed.' })
    }

    // ── Bug Issues ──
    if (!seo.metaViewport) {
      bugIssues.push({ type: 'critical', title: 'Missing Viewport Meta Tag', desc: 'No viewport meta tag. Site may not be mobile responsive.', fix: 'Add: <meta name="viewport" content="width=device-width, initial-scale=1.0">' })
    } else {
      bugIssues.push({ type: 'pass', title: 'Viewport Meta Tag Present', desc: 'Mobile viewport is properly configured.', fix: 'None needed.' })
    }

    if (!seo.hasSchema) {
      bugIssues.push({ type: 'info', title: 'No Structured Data', desc: 'No Schema.org markup found. Structured data helps search engines understand your content.', fix: 'Add JSON-LD structured data for your content type.' })
    } else {
      bugIssues.push({ type: 'pass', title: 'Structured Data Found', desc: 'Schema.org markup is implemented.', fix: 'None needed.' })
    }

    if (!seo.hasSitemap) {
      bugIssues.push({ type: 'warning', title: 'No Sitemap Reference', desc: 'No sitemap reference found on the page.', fix: 'Create sitemap.xml and submit to Google Search Console.' })
    } else {
      bugIssues.push({ type: 'pass', title: 'Sitemap Reference Found', desc: 'Sitemap is referenced on the page.', fix: 'None needed.' })
    }

    if (seo.brokenLinks > 0) {
      bugIssues.push({ type: 'warning', title: `${seo.brokenLinks} Potentially Broken Links`, desc: `Found ${seo.brokenLinks} links that may be broken.`, fix: 'Check and fix all broken links on the page.' })
    } else {
      bugIssues.push({ type: 'pass', title: 'No Broken Links Detected', desc: 'All links appear to be valid.', fix: 'None needed.' })
    }

    // ── Calculate Scores ──
    const calcScore = (issues) => {
      let score = 100
      issues.forEach(i => {
        if (i.type === 'critical') score -= 20
        else if (i.type === 'warning') score -= 10
        else if (i.type === 'info') score -= 3
      })
      return Math.max(0, Math.min(100, score))
    }

    const seoScore = ps ? Math.round((calcScore(seoIssues) + ps.seo) / 2) : calcScore(seoIssues)
    const perfScore = ps ? ps.performance : calcScore(performanceIssues)
    const secScore = calcScore(securityIssues)
    const bugScore = calcScore(bugIssues)

    return {
      scores: { seo: seoScore, performance: perfScore, security: secScore, bugs: bugScore },
      seo: seoIssues.slice(0, 6),
      performance: performanceIssues.slice(0, 6),
      security: securityIssues.slice(0, 6),
      bugs: bugIssues.slice(0, 6),
      summary: `${url} scored ${seoScore} in SEO, ${perfScore} in Performance, ${secScore} in Security, and ${bugScore} in Bugs. ${seoScore < 70 ? 'SEO needs significant improvement. ' : ''}${perfScore < 70 ? 'Performance optimization is recommended. ' : ''}${secScore < 70 ? 'Security headers need to be configured. ' : ''}Overall the site ${(seoScore + perfScore + secScore + bugScore) / 4 >= 70 ? 'is in good shape with some improvements needed.' : 'needs significant work across multiple areas.'}`
    }
  }

  // ─── Run Audit ───────────────────────────────────────────────────────────────
  fastify.post('/run', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { url } = req.body
    const userId = req.user.id
    if (!url) return reply.code(400).send({ message: 'URL is required' })

    // Free plan wale users ko 3 audits/month tak limit karo
    const plan = await fastify.getUserPlan(userId)
    if (plan === 'free') {
      const usedThisMonth = await fastify.getAuditsThisMonth(userId)
      if (usedThisMonth >= fastify.FREE_AUDIT_LIMIT_PER_MONTH) {
        return reply.code(403).send({
          message: `You've used all ${fastify.FREE_AUDIT_LIMIT_PER_MONTH} free audits this month. Upgrade to Pro or Agency for unlimited audits.`,
          upgradeRequired: true
        })
      }
    }

    try {
      // Fetch real data in parallel
      const [websiteData, pageSpeedData] = await Promise.all([
        fetchWebsiteData(url),
        getPageSpeed(url)
      ])

      const seoData = parseHTML(websiteData.html, url)
      const securityData = checkSecurity(websiteData.headers, seoData.isHTTPS)
      const auditResult = buildAuditResult(seoData, securityData, pageSpeedData, url)

      auditResult.url = url
      auditResult.date = new Date().toISOString()

      const { data, error } = await fastify.supabase
        .from('audits')
        .insert({
          user_id: userId,
          url,
          scores: auditResult.scores,
          seo: auditResult.seo,
          performance: auditResult.performance,
          security: auditResult.security,
          bugs: auditResult.bugs,
          summary: auditResult.summary,
        })
        .select()
        .single()

      if (error) throw new Error('Supabase error: ' + error.message)
      return { audit: { ...auditResult, id: data.id } }
    } catch (e) {
      fastify.log.error(e)
      return reply.code(500).send({ message: e.message })
    }
  })

  // ─── AI Chat ─────────────────────────────────────────────────────────────────
  fastify.post('/ask', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { question, history } = req.body
    const userId = req.user.id

    const gate = await fastify.requirePaidPlan(userId, 'AI Chat')
    if (gate) return reply.code(403).send(gate)

    try {
      const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: 'You are a helpful website audit expert. Answer concisely and helpfully.' },
            ...history
          ]
        })
      })
      const data = await aiRes.json()
      return { reply: data.choices[0].message.content }
    } catch (e) {
      return reply.code(500).send({ message: e.message })
    }
  })

  // ─── Competitor Analysis ──────────────────────────────────────────────────────
  fastify.post('/compare', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { myUrl, competitorUrl } = req.body
    if (!myUrl || !competitorUrl) return reply.code(400).send({ message: 'Both URLs are required' })

    try {
      const [myData, compData, myPS, compPS] = await Promise.all([
        fetchWebsiteData(myUrl),
        fetchWebsiteData(competitorUrl),
        getPageSpeed(myUrl),
        getPageSpeed(competitorUrl)
      ])

      const mySEO = parseHTML(myData.html, myUrl)
      const compSEO = parseHTML(compData.html, competitorUrl)
      const mySec = checkSecurity(myData.headers, mySEO.isHTTPS)
      const compSec = checkSecurity(compData.headers, compSEO.isHTTPS)

      const myAudit = buildAuditResult(mySEO, mySec, myPS, myUrl)
      const compAudit = buildAuditResult(compSEO, compSec, compPS, competitorUrl)

      const myOverall = Math.round(Object.values(myAudit.scores).reduce((a, b) => a + b, 0) / 4)
      const compOverall = Math.round(Object.values(compAudit.scores).reduce((a, b) => a + b, 0) / 4)

      const advantages = []
      const weaknesses = []

      Object.entries(myAudit.scores).forEach(([key, val]) => {
        const compVal = compAudit.scores[key]
        if (val > compVal) advantages.push(`Better ${key} score (${val} vs ${compVal})`)
        else if (val < compVal) weaknesses.push(`Lower ${key} score (${val} vs ${compVal})`)
      })

      if (mySEO.title && !compSEO.title) advantages.push('Has proper title tag')
      if (!mySEO.title && compSEO.title) weaknesses.push('Missing title tag (competitor has one)')
      if (mySEO.metaDesc && !compSEO.metaDesc) advantages.push('Has meta description')
      if (!mySEO.metaDesc && compSEO.metaDesc) weaknesses.push('Missing meta description')
      if (mySec.https && !compSec.https) advantages.push('Uses HTTPS (competitor does not)')
      if (!mySec.https && compSec.https) weaknesses.push('Not using HTTPS (competitor does)')
      if (mySEO.hasSchema && !compSEO.hasSchema) advantages.push('Has structured data markup')
      if (!mySEO.hasSchema && compSEO.hasSchema) weaknesses.push('Missing structured data')

      return {
        comparison: {
          my: { scores: myAudit.scores, overall: myOverall },
          competitor: { scores: compAudit.scores, overall: compOverall },
          winner: myOverall >= compOverall ? 'my' : 'competitor',
          advantages: advantages.slice(0, 5),
          weaknesses: weaknesses.slice(0, 5)
        }
      }
    } catch (e) {
      fastify.log.error(e)
      return reply.code(500).send({ message: e.message })
    }
  })

  // ─── Auto Fix ────────────────────────────────────────────────────────────────
  fastify.post('/fix', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { title, desc, fix } = req.body
    if (!title) return reply.code(400).send({ message: 'Issue title is required' })
    const prompt = `You are a web developer. A website has this issue:
Issue: ${title}
Description: ${desc}
Suggested fix: ${fix}
Provide ONLY the ready-to-use code fix (HTML/CSS/JS) with a brief one-line comment. No explanation, just code.`
    try {
      const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
      })
      const aiData = await aiRes.json()
      if (!aiData.choices || !aiData.choices[0]) throw new Error('AI error')
      return { code: aiData.choices[0].message.content.trim() }
    } catch (e) {
      fastify.log.error(e)
      return reply.code(500).send({ message: e.message })
    }
  })
}
