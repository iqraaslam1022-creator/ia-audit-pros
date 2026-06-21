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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const aiData = await aiRes.json()

      if (!aiData.choices || !aiData.choices[0]) {
        throw new Error('AI response invalid: ' + JSON.stringify(aiData))
      }

      const raw = aiData.choices[0].message.content.trim()
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

  // ─── AI Chat ─────────────────────────────────────────────────────────────────
  fastify.post('/ask', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { question, history } = req.body
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
            { role: 'system', content: 'You are a helpful website audit expert. Answer concisely and helpfully.' },
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

  // ─── Competitor Analysis ──────────────────────────────────────────────────────
  fastify.post('/compare', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { myUrl, competitorUrl } = req.body
    if (!myUrl || !competitorUrl) {
      return reply.code(400).send({ message: 'Dono URLs zaroori hain' })
    }

    const prompt = `You are a professional website auditor. Compare these two websites:
My website: ${myUrl}
Competitor website: ${competitorUrl}

Return ONLY raw JSON (no markdown, no backticks):
{
  "my": {
    "scores": {"seo": 75, "performance": 60, "security": 80, "bugs": 70},
    "overall": 71
  },
  "competitor": {
    "scores": {"seo": 65, "performance": 70, "security": 75, "bugs": 80},
    "overall": 72
  },
  "winner": "my",
  "advantages": ["Your site loads faster", "Better mobile optimization"],
  "weaknesses": ["Competitor has better meta descriptions", "Competitor has SSL configured better"]
}
winner should be "my" or "competitor" based on overall scores. Include 3-5 advantages and 3-5 weaknesses. Be realistic based on the actual URLs.`

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
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const aiData = await aiRes.json()
      if (!aiData.choices || !aiData.choices[0]) {
        throw new Error('AI response invalid: ' + JSON.stringify(aiData))
      }

      const raw = aiData.choices[0].message.content.trim()
      const clean = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim()

      const comparison = JSON.parse(clean)
      return { comparison }
    } catch (e) {
      fastify.log.error(e)
      return reply.code(500).send({ message: e.message })
    }
  })
}
