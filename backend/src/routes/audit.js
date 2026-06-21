export default async function auditRoutes(fastify) {

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
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const aiData = await aiRes.json()
      
      if (!aiData.content || !aiData.content[0]) {
        throw new Error('AI response invalid: ' + JSON.stringify(aiData))
      }

      const raw = aiData.content.map(b => b.text || '').join('').trim()
      const clean = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim()
      
      const auditResult = JSON.parse(clean)

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
    const { question, history } = req.body
    try {
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: 'You are a helpful website audit expert. Answer concisely and helpfully.',
          messages: history
        })
      })
      const data = await aiRes.json()
      const replyText = data.content.map(b => b.text || '').join('')
      return { reply: replyText }
    } catch (e) {
      return reply.code(500).send({ message: e.message })
    }
  })
}
