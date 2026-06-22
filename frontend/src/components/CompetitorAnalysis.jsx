export default async function auditRoutes(fastify) {

  fastify.post('/run', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { url } = req.body
    const userId = req.user.id
    if (!url) return reply.code(400).send({ message: 'URL zaroori hai' })
    const prompt = `You are a professional website SEO and technical auditor. Analyze: ${url}
Return ONLY raw JSON (no markdown, no backticks, just pure JSON):
{"scores":{"seo":0,"performance":0,"security":0,"bugs":0},"seo":[{"type":"warning","title":"title","desc":"desc","fix":"fix"}],"performance":[{"type":"warning","title":"title","desc":"desc","fix":"fix"}],"security":[{"type":"warning","title":"title","desc":"desc","fix":"fix"}],"bugs":[{"type":"info","title":"title","desc":"desc","fix":"fix"}],"summary":"overview here"}
Include 4-6 items per category. Scores 0-100.`
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
      if (error) throw new Error(error.message)
      return { audit: { ...auditResult, id: data.id } }
    } catch (e) {
      fastify.log.error(e)
      return reply.code(500).send({ message: e.message })
    }
  })

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
            { role: 'system', content: 'You are a helpful website audit expert. Answer concisely.' },
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
}
