export default async function auditRoutes(fastify) {

  // ─── Run Audit ───────────────────────────────────────────────────────────────
  fastify.post('/run', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { url } = req.body
    const userId = req.user.id
    if (!url) return reply.code(400).send({ message: 'URL zaroori hai' })
    const prompt = `You are a professional website SEO and technical auditor. Analyze: ${url}
Return ONLY raw JSON (no markdown, no backticks, just pure JSON):
{
  "scores": {"seo": 72, "performance": 58, "security": 65, "bugs": 80},
  "seo": [{"type": "warning", "title": "Example issue", "desc": "Description here", "fix": "How to fix"}],
  "performance": [{"type": "warning", "title": "Example issue", "desc": "Description here", "fix": "How to fix"}],
  "security": [{"type": "warning", "title": "Example issue", "desc": "Description here", "fix": "How to fix"}],
  "bugs": [{"type": "info", "title": "Example issue", "desc": "Description here", "fix": "How to fix"}],
  "summary": "2-3 sentence overview of the website health."
}
Include 4-6 real items per category based on ${url}. Use types: critical, warning, info, pass. Scores 0-100.`
    try {
      const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] })
      })
      const aiData = await aiRes.json()
      if (!aiData.choices || !aiData.choices[0]) throw new Error('AI response invalid: ' + JSON.stringify(aiData))
      const raw = aiData.choices[0].message.content.trim()
      const clean = raw.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim()
      const auditResult = JSON.parse(clean)
      if (!auditResult.scores || !auditResult.seo || !auditResult.performance ||
        !auditResult.security || !auditResult.bugs || !auditResult.summary) {
        throw new Error('AI response missing required fields')
      }
      auditResult.url = url
      auditResult.date = new Date().toISOString()
      const { data, error } = await fastify.supabase.from('audits').insert({
        user_id: userId, url,
        scores: auditResult.scores,
        seo: auditResult.seo,
        performance: auditResult.performance,
        security: auditResult.security,
        bugs: auditResult.bugs,
        summary: auditResult.summary,
      }).select().single()
      if (error) throw new Error('Supabase error: ' + error.message)
      // ✅ Audit Complete Email
try {
  await sendAuditEmail(req.user.email, url, auditResult.scores, auditResult.summary)
} catch (e) {
  fastify.log.error('Email error:', e)
}
 return { audit: { ...auditResult, id: data.id } }
    } catch (e) {
      fastify.log.error(e)
      return reply.code(500).send({ message: e.message })
    }
  })

  // ─── AI Chat ─────────────────────────────────────────────────────────────────
  fastify.post('/ask', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { question, history } = req.body
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
    if (!myUrl || !competitorUrl) return reply.code(400).send({ message: 'Dono URLs zaroori hain' })
    const prompt = `You are a professional website auditor. Compare these two websites:
My website: ${myUrl}
Competitor website: ${competitorUrl}
Return ONLY raw JSON (no markdown, no backticks):
{"my":{"scores":{"seo":75,"performance":60,"security":80,"bugs":70},"overall":71},"competitor":{"scores":{"seo":65,"performance":70,"security":75,"bugs":80},"overall":72},"winner":"my","advantages":["advantage 1","advantage 2"],"weaknesses":["weakness 1","weakness 2"]}
winner should be "my" or "competitor". Include 3-5 advantages and weaknesses.`
    try {
      const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
      })
      const aiData = await aiRes.json()
      if (!aiData.choices || !aiData.choices[0]) throw new Error('AI response invalid: ' + JSON.stringify(aiData))
      const raw = aiData.choices[0].message.content.trim()
      const clean = raw.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim()
      const comparison = JSON.parse(clean)
      return { comparison }
    } catch (e) {
      fastify.log.error(e)
      return reply.code(500).send({ message: e.message })
    }
  })

  // ─── Auto Fix ────────────────────────────────────────────────────────────────
  fastify.post('/fix', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { title, desc, fix } = req.body
    if (!title) return reply.code(400).send({ message: 'Issue title zaroori hai' })
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
  // ─── Audit Complete Email ─────────────────────────────────────────────────────
async function sendAuditEmail(email, url, scores, summary) {
  function scoreColor(v) { return v >= 80 ? '#2D7A56' : v >= 50 ? '#9A6B1A' : '#8A2020' }
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'IA Audit Pro <onboarding@resend.dev>',
      to: email,
      subject: `Audit Complete: ${url}`,
      html: `
        <div style="font-family: 'Montserrat', sans-serif; max-width: 560px; margin: 0 auto; background: #F8F6F1; border-radius: 16px; overflow: hidden;">
          <div style="background: #006039; padding: 32px; text-align: center;">
            <h1 style="color: white; font-size: 24px; letter-spacing: 3px; margin: 0; text-transform: uppercase;">IA Audit Pro</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: 2px; margin-top: 6px;">AUDIT COMPLETE</p>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #1A1A14; font-size: 20px; margin-bottom: 6px;">Your audit is ready! 📊</h2>
            <p style="color: #8A8A78; font-size: 13px; margin-bottom: 24px;">${url}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px;">
              ${['seo','performance','security','bugs'].map(k => `
                <div style="background: white; border-radius: 10px; padding: 16px; text-align: center; border: 1px solid #E5DFD3;">
                  <p style="color: #8A8A78; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">${k}</p>
                  <p style="color: ${scoreColor(scores[k])}; font-size: 32px; font-weight: 700; margin: 0;">${scores[k]}</p>
                  <p style="color: #8A8A78; font-size: 11px;">/100</p>
                </div>
              `).join('')}
            </div>

            <div style="background: #E8F2EC; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #006039; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">AI Summary</p>
              <p style="color: #4A4A3E; font-size: 13px; line-height: 1.8; margin: 0;">${summary}</p>
            </div>

            <a href="${process.env.FRONTEND_URL}/audit"
               style="display: block; background: #006039; color: white; text-align: center; padding: 14px; border-radius: 8px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-decoration: none; text-transform: uppercase;">
              View Full Report →
            </a>
          </div>
          <div style="padding: 20px 32px; border-top: 1px solid #E5DFD3; text-align: center;">
            <p style="color: #8A8A78; font-size: 11px; letter-spacing: 1px;">IA AUDIT PRO · POWERED BY GROQ AI</p>
          </div>
        </div>
      `
    })
  })
}
}
 
 
      
