export default async function historyRoutes(fastify) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { data, error } = await fastify.supabase.from('audits')
      .select('id, url, scores, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
    if (error) return reply.code(500).send({ message: error.message })
    return { audits: data }
  })

  fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { data, error } = await fastify.supabase.from('audits')
      .select('*').eq('id', req.params.id).eq('user_id', req.user.id).single()
    if (error) return reply.code(404).send({ message: 'Audit nahi mili' })
    return { audit: data }
  })
}
