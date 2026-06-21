import 'dotenv/config'
import Fastify from 'fastify'
import corsPlugin from './plugins/cors.js'
import supabasePlugin from './plugins/supabase.js'
import authRoutes from './routes/auth.js'
import auditRoutes from './routes/audit.js'
import historyRoutes from './routes/history.js'

const fastify = Fastify({ logger: true })

// Plugins
await fastify.register(corsPlugin)
await fastify.register(supabasePlugin)

// JWT
await fastify.register(import('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'changethis'
})

// Auth middleware
fastify.decorate('authenticate', async (req, reply) => {
  try {
    await req.jwtVerify()
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized' })
  }
})

// Routes
await fastify.register(authRoutes, { prefix: '/api/auth' })
await fastify.register(auditRoutes, { prefix: '/api/audit' })
await fastify.register(historyRoutes, { prefix: '/api/history' })

// Health check
fastify.get('/health', async () => ({ status: 'ok' }))

// Start
const port = process.env.PORT || 3001
await fastify.listen({ port, host: '0.0.0.0' })
console.log(`Server running on port ${port}`)
