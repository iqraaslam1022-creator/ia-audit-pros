export default async function competitorRoutes(fastify) {
  fastify.post('/analyze', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { url, competitor_url } = req.body
    if (!url || !competitor_url) {
      return reply.code(400).send({ message: 'Dono URLs zaroori hain' })
    }
    const prompt = `You are a professional website competitor analyzer.
Compare these two websites:
- My Website: ${url}
- Competitor: ${competitor_url}
Return ONLY valid JSON:
{
  "my_site": {
    "url": "${url}",
    "scores": {"seo": 70, "performance": 60, "security": 65, "bugs": 80},
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3"]
  },
  "competitor": {
    "url": "${competitor_url}",
    "scores": {"seo": 75, "performance": 70, "security": 80, "bugs": 85},
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3"]
  },
  "verdict": "2-3 sentence comparison summary",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`
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
            { role: 'system', content: 'You are a website competitor analyzer. Always respond with valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      })
      const aiData = await aiRes.json()
      if (!aiData.choices || !aiData.choices[0]) {
        throw new Error('AI response invalid')
      }
      const result = JSON.parse(aiData.choices[0].message.content.trim())
      return { comparison: result }
    } catch (e) {
      fastify.log.error(e)
      return reply.code(500).send({ message: e.message })
    }
  })
}
