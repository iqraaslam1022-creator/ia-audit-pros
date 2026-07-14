export default async function competitorRoutes(fastify) {

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
      csp: !!headers['content-security-policy'],
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
      return {
        performance: Math.round((cats.performance?.score || 0) * 100),
        seo: Math.round((cats.seo?.score || 0) * 100),
        accessibility: Math.round((cats.accessibility?.score || 0) * 100),
        bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
      }
    } catch (e) {
      return null
    }
  }

  // ─── Helper: Score a Site (SEO / Performance / Security / Bugs) ─────────────
  function scoreSite(seo, security, ps) {
    let seoScore = 100
    if (!seo.title) seoScore -= 20
    else if (seo.title.length < 30 || seo.title.length > 60) seoScore -= 10
    if (!seo.metaDesc) seoScore -= 20
    if (seo.h1Count === 0) seoScore -= 20
    else if (seo.h1Count > 1) seoScore -= 10
    if (seo.imgNoAlt > 0) seoScore -= 10
    if (!seo.canonical) seoScore -= 10
    if (!seo.hasOG) seoScore -= 5
    seoScore = Math.max(0, Math.min(100, seoScore))
    if (ps) seoScore = Math.round((seoScore + ps.seo) / 2)

    const perfScore = ps ? ps.performance : 50

    let secScore = 100
    if (!security.https) secScore -= 30
    if (!security.hsts) secScore -= 15
    if (!security.xframe) secScore -= 15
    if (!security.xcontent) secScore -= 15
    if (!security.csp) secScore -= 15
    secScore = Math.max(0, Math.min(100, secScore))

    let bugScore = 100
    if (!seo.metaViewport) bugScore -= 25
    if (!seo.hasSchema) bugScore -= 10
    if (!seo.hasSitemap) bugScore -= 10
    if (seo.brokenLinks > 0) bugScore -= 15
    bugScore = Math.max(0, Math.min(100, bugScore))

    return { seo: seoScore, performance: perfScore, security: secScore, bugs: bugScore }
  }

  function buildStrengthsWeaknesses(seo, security, ps) {
    const strengths = []
    const weaknesses = []

    if (seo.title && seo.title.length >= 30 && seo.title.length <= 60) strengths.push('Well optimized title tag')
    else weaknesses.push('Title tag missing or poorly sized')

    if (seo.metaDesc) strengths.push('Has a meta description')
    else weaknesses.push('Missing meta description')

    if (seo.h1Count === 1) strengths.push('Exactly one H1 tag')
    else weaknesses.push(seo.h1Count === 0 ? 'No H1 tag found' : 'Multiple H1 tags found')

    if (seo.imgNoAlt === 0 && seo.imgTotal > 0) strengths.push('All images have alt text')
    else if (seo.imgNoAlt > 0) weaknesses.push(`${seo.imgNoAlt} images missing alt text`)

    if (security.https) strengths.push('Uses HTTPS')
    else weaknesses.push('Not using HTTPS')

    if (security.csp) strengths.push('Has a Content Security Policy')
    else weaknesses.push('Missing Content Security Policy header')

    if (seo.hasSchema) strengths.push('Has structured data (Schema.org)')
    else weaknesses.push('No structured data found')

    if (ps && ps.performance >= 80) strengths.push('Strong PageSpeed performance score')
    else if (ps && ps.performance < 50) weaknesses.push('Poor PageSpeed performance score')

    return { strengths: strengths.slice(0, 5), weaknesses: weaknesses.slice(0, 5) }
  }

  // ─── Competitor Analysis ──────────────────────────────────────────────────────
  fastify.post('/analyze', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { url, competitor_url } = req.body
    const userId = req.user.id
    if (!url || !competitor_url) return reply.code(400).send({ message: 'Both URLs are required' })

    const gate = await fastify.requirePaidPlan(userId, 'Competitor Analysis')
    if (gate) return reply.code(403).send(gate)

    try {
      const [myData, compData, myPS, compPS] = await Promise.all([
        fetchWebsiteData(url),
        fetchWebsiteData(competitor_url),
        getPageSpeed(url),
        getPageSpeed(competitor_url)
      ])

      const mySEO = parseHTML(myData.html, url)
      const compSEO = parseHTML(compData.html, competitor_url)
      const mySec = checkSecurity(myData.headers, mySEO.isHTTPS)
      const compSec = checkSecurity(compData.headers, compSEO.isHTTPS)

      const myScores = scoreSite(mySEO, mySec, myPS)
      const compScores = scoreSite(compSEO, compSec, compPS)

      const my = { url, scores: myScores, ...buildStrengthsWeaknesses(mySEO, mySec, myPS) }
      const competitor = { url: competitor_url, scores: compScores, ...buildStrengthsWeaknesses(compSEO, compSec, compPS) }

      const myOverall = Math.round(Object.values(myScores).reduce((a, b) => a + b, 0) / 4)
      const compOverall = Math.round(Object.values(compScores).reduce((a, b) => a + b, 0) / 4)

      let verdict = myOverall >= compOverall
        ? `${url} outperforms ${competitor_url} overall (${myOverall} vs ${compOverall}), but check individual categories below for areas to keep improving.`
        : `${competitor_url} currently outperforms ${url} overall (${compOverall} vs ${myOverall}). Focus on the weaknesses below to close the gap.`

      const recommendations = [...my.weaknesses.slice(0, 3), ...competitor.strengths.filter(s => !my.strengths.includes(s)).slice(0, 2)]

      // Optional: refine verdict/recommendations with AI if key is available
      try {
        if (process.env.GROQ_API_KEY) {
          const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              max_tokens: 500,
              messages: [
                { role: 'system', content: 'You are a website audit expert. Reply ONLY with valid JSON: {"verdict": string, "recommendations": string[]}. Keep verdict to 2 sentences and give up to 5 short, actionable recommendations.' },
                { role: 'user', content: `My site (${url}) scores: ${JSON.stringify(myScores)}. Competitor (${competitor_url}) scores: ${JSON.stringify(compScores)}. My strengths: ${my.strengths.join(', ')}. My weaknesses: ${my.weaknesses.join(', ')}. Competitor strengths: ${competitor.strengths.join(', ')}.` }
              ]
            })
          })
          const aiData = await aiRes.json()
          const parsed = JSON.parse(aiData.choices[0].message.content)
          if (parsed.verdict) verdict = parsed.verdict
          if (Array.isArray(parsed.recommendations) && parsed.recommendations.length) recommendations.splice(0, recommendations.length, ...parsed.recommendations.slice(0, 5))
        }
      } catch (aiErr) {
        fastify.log.warn('Competitor AI verdict generation skipped: ' + aiErr.message)
      }

      return {
        comparison: {
          my_site: my,
          competitor,
          verdict,
          recommendations
        }
      }
    } catch (e) {
      fastify.log.error(e)
      return reply.code(500).send({ message: e.message })
    }
  })
}




