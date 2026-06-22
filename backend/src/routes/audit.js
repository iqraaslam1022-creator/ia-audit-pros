export default async function auditRoutes(fastify) {

  fastify.post('/run', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { url } = req.body
    const userId = req.user.id

    if (!url) return reply.code(400).send({ message: 'URL zaroori hai' })

    const prompt = `You are a professional website SEO and technical auditor. Analyze: ${url}

Return ONLY raw JSON (no markdown, no backticks, just pure JSON):
{
  "scores": {"seo": 72, "performance": 58, "security": 65, "bugs": 80},
  "seo": [{"type": "warning", "title": "Issue title", "desc": "Description", "fix": "How to fix"}],
  "performance": [{"type": "warning", "title": "Issue title", "desc": "Description", "fix": "How to fix"}],
  "security": [{"type": "warning", "title": "Issue title", "desc": "Description", "fix": "How to fix"}],
  "bugs": [{"type": "info", "title": "Issue title", "desc": "Description", "fix": "How to fix"}],
  "summary": "2-3 sentence overview."
}
Include 4-6 real items per category. Use types: critical, warning, info, pass. Scores 0-100.`

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
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      })

      const aiData = await aiRes.json()

      if (!aiData.choices || !aiData.choices[0]) {
        throw new Error('Groq response invalid: ' + JSON.stringify(aiData))
      }

      const raw = aiData.choices[0].message.content.trim()
      const auditResult = JSON.parse(raw)

      if (!auditResult.scores || !auditResult.seo || !auditResult.performance ||
          !auditResult.security || !auditResult.bugs || !auditResult.summary) {
        throw new Error('AI response missing required fields')
      }

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
