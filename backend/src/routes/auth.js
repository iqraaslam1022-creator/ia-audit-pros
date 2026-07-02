 export default async function authRoutes(fastify) {

  // Signup
  fastify.post('/signup', async (req, reply) => {
    const { email, password } = req.body

    if (!email || !password)
      return reply.code(400).send({ message: 'Email and password are required' })

    const { data, error } = await fastify.supabase.auth.admin.createUser({
      email, password, email_confirm: true
    })

    if (error) return reply.code(400).send({ message: error.message })

    // Welcome email bhejo
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'IA Audit Pro <noreply@iaauditpro.online>',
          to: email,
          subject: '⚡ Welcome to IA Audit Pro!',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #534AB7; padding: 2rem; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">⚡ IA Audit Pro</h1>
              </div>
              <div style="background: #f9f9f9; padding: 2rem; border-radius: 0 0 12px 12px;">
                <h2>Welcome aboard! 🎉</h2>
                <p>Your account has been created successfully.</p>
                <p>You can now start auditing your websites for SEO, Performance, Security & Bugs!</p>
                <a href="${process.env.FRONTEND_URL}" 
                   style="display: inline-block; background: #534AB7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 1rem;">
                  Start Auditing →
                </a>
                <p style="margin-top: 2rem; color: #888; font-size: 13px;">
                  IA Audit Pro · AI-powered website auditor
                </p>
              </div>
            </div>
          `
        })
      })
    } catch (e) {
      fastify.log.error('Email error:', e)
    }

    const token = fastify.jwt.sign({ id: data.user.id, email: data.user.email })
    return { user: { id: data.user.id, email: data.user.email }, token }
  })

  // Login
  fastify.post('/login', async (req, reply) => {
    const { email, password } = req.body

    const { data, error } = await fastify.supabase.auth.signInWithPassword({ email, password })

    if (error) return reply.code(401).send({ message: 'Incorrect email or password' })

    const token = fastify.jwt.sign({ id: data.user.id, email: data.user.email })
    return { user: { id: data.user.id, email: data.user.email }, token }
  })
}
