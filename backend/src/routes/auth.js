export default async function authRoutes(fastify) {
  fastify.post('/signup', async (req, reply) => {
    const { email, password } = req.body
    if (!email || !password) return reply.code(400).send({ message: 'Email aur password zaroori hain' })
    const { data, error } = await fastify.supabase.auth.admin.createUser({ email, password, email_confirm: true })
    if (error) return reply.code(400).send({ message: error.message })
    const token = fastify.jwt.sign({ id: data.user.id, email: data.user.email })
    return { user: { id: data.user.id, email: data.user.email }, token }
  })

  fastify.post('/login', async (req, reply) => {
    const { email, password } = req.body
    const { data, error } = await fastify.supabase.auth.signInWithPassword({ email, password })
    if (error) return reply.code(401).send({ message: 'Email ya password galat hai' })
    const token = fastify.jwt.sign({ id: data.user.id, email: data.user.email })
    return { user: { id: data.user.id, email: data.user.email }, token }
  })
}
