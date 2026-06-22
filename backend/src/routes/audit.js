export default async function auditRoutes(fastify) {

  fastify.post('/run', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { url } = req.body
    const userId = req.user.id

    if (!url) return reply.code(400).send({ message: 'URL zaroori hai' })

    const prompt = `You are a professional website SEO and technical auditor. Analyze this website: ${url}

IMPORTANT: Return ONLY a valid JSON object. No markdown, no backticks, no explanation. Just pure JSON.

The JSON must have exactly these keys:
{
  "scores": {
    "seo": 70,
    "performance": 60,
    "security": 65,
    "bugs": 80
  },
  "seo": [
    {"type": "warning", "title": "Missing Meta Description", "desc": "No meta description found", "fix": "Add meta description tag"}
  ],
  "performance": [
    {"type": "warning", "title": "Large Images", "desc": "Images are not optimized", "fix": "Compress images using WebP format"}
  ],
  "security": [
    {"type": "critical", "title": "Missing HTTPS", "desc": "Site not using HTTPS", "fix": "Install SSL certificate"}
  ],
  "bugs": [
    {"type": "info", "title": "Console Errors", "desc": "JavaScript errors found", "fix": "Fix JavaScript errors in console"}
  ],
  "summary": "This website needs improvement in several areas including SEO and performance."
}

Provide 4-6 realistic items for each category based on ${url}. Use types: critical, warning, info, pass.`

    try {
      const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 2000,
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: 'You are a website auditor. Always respond with valid JSON only. Never include markdown or backticks.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        })
      })

      const aiData = await aiRes.json()

      if (!aiData.choices || !aiData.choices[0]) {
        throw new Error('Groq response invalid: ' + JSON.stringify(aiData))
      }

      const raw = aiData.choices[0].message.content.trim()
      const auditResult = JSON.parse(raw)

      // Fix missing fields
      if (!auditResult.scores) auditResult.scores = { seo: 50, performance: 50, security: 50, bugs: 50 }
      if (!auditResult.seo) auditResult.seo = []
      if (!auditResult.performance) auditResult.performance = []
      if (!auditResult.security) auditResult.security = []
      if (!auditResult.bugs) auditResult.bugs = []
      if (!auditResult.summary) auditResult.summary = 'Audit completed successfully.'

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

  fastify.post('/ask', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { history } = req.body
    try {
      const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: 'You are a helpful website audit expert. Answer concisely.' },
            ...history
          ]
        })
      })
      const data = await aiRes.json()
      const replyText = data.choices[0].message.content
      return { reply: replyText }
    } catch (e) {
      return reply.code(500).send({ message: e.message })
    }
  })
}
