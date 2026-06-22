export default async function authRoutes(fastify) {
  fastify.post('/signup', async (req, reply) => {
    const { email, password } = req.body
    if (!email || !password) return reply.code(400).send({ message: 'Email aur password zaroori hain' })
    const { data, error } = await fastify.supabase.auth.admin.createUser({ email, password, email_confirm: true })
    if (error) return reply.code(400).send({ message: error.message })
    const token = fastify.jwt.sign({ id: data.user.id, email: data.user.email })

    // ✅ Welcome Email
    try {
      await sendWelcomeEmail(email)
    } catch (e) {
      fastify.log.error('Email error:', e)
    }

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

// ─── Welcome Email ────────────────────────────────────────────────────────────
async function sendWelcomeEmail(email) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'IA Audit Pro <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to IA Audit Pro ⚡',
      html: `
        <div style="font-family: 'Montserrat', sans-serif; max-width: 560px; margin: 0 auto; background: #F8F6F1; border-radius: 16px; overflow: hidden;">
          <div style="background: #006039; padding: 32px; text-align: center;">
            <h1 style="color: white; font-size: 24px; letter-spacing: 3px; margin: 0; text-transform: uppercase;">IA Audit Pro</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: 2px; margin-top: 6px;">PROFESSIONAL WEBSITE AUDIT</p>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #1A1A14; font-size: 22px; margin-bottom: 12px;">Welcome aboard! 🎉</h2>
            <p style="color: #4A4A3E; font-size: 14px; line-height: 1.8; margin-bottom: 24px;">
              Your account has been created successfully. You can now start auditing your websites and get detailed SEO, Performance, Security, and Bug reports.
            </p>
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #E5DFD3;">
              <p style="color: #006039; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">What you get:</p>
              <p style="color: #4A4A3E; font-size: 13px; margin: 6px 0;">✅ SEO Analysis</p>
              <p style="color: #4A4A3E; font-size: 13px; margin: 6px 0;">✅ Performance Check</p>
              <p style="color: #4A4A3E; font-size: 13px; margin: 6px 0;">✅ Security Scan</p>
              <p style="color: #4A4A3E; font-size: 13px; margin: 6px 0;">✅ Bug Detection</p>
              <p style="color: #4A4A3E; font-size: 13px; margin: 6px 0;">✅ AI Auto Fix</p>
              <p style="color: #4A4A3E; font-size: 13px; margin: 6px 0;">✅ Competitor Analysis</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/audit" 
               style="display: block; background: #006039; color: white; text-align: center; padding: 14px; border-radius: 8px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-decoration: none; text-transform: uppercase;">
              Run Your First Audit →
            </a>
          </div>
          <div style="padding: 20px 32px; border-top: 1px solid #E5DFD3; text-align: center;">
            <p style="color: #8A8A78; font-size: 11px; letter-spacing: 1px;">IA AUDIT PRO · POWERED BY GROQ AI</p>
          </div>
        </div>
      `
    })
  })
}
