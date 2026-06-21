import fp from 'fastify-plugin'
import cors from '@fastify/cors'

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true,
  })
})
