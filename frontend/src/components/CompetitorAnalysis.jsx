export default async function auditRoutes(fastify) {
  fastify.post('/run', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { url } = req.body
    const userId = req.user.id
    if (!url) return reply.code(400).send({ message: 'URL zaroori hai' })

    const prompt = `You are a professional website SEO and technical auditor. Analyze: ${url}
Return ONLY raw JSON (no markdown):
{"scores":{"seo":0,"performance":0,"security":0,"bugs":0},"seo":[{"type":"critical|warning|info|pass","title":"string","desc":"string","fix":"string"}],"performance":[{"type":"critical|warning|info|pass","title":"string","desc":"string","fix":"string"}],"security":[{"type":"critical|warning|info|pass","title":"string","desc":"string","fix":"string"}],"bugs":[{"type":"critical|warning|info|pass","title":"string","desc":"string","fix":"string"}],"summary":"2-3 sentence overview."}
Include 4-6 items per category. Scores 0-100.`

    try {
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
      })
      const aiData = await aiRes.json()
      const raw = aiData.content.map(b => b.text || '').join('').trim()
      const clean = raw.replace(/^```json\s*/i,'').replace(/^```/,'').replace(/```$/,'').trim()
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
      return reply.code(500).send({ message: e.message })
    }
  })

  fastify.post('/ask', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { question, history } = req.body
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, system: 'You are a helpful website audit expert. Answer concisely.', messages: history })
    })
    const data = await aiRes.json()
    return { reply: data.content.map(b => b.text || '').join('') }
  })
}
