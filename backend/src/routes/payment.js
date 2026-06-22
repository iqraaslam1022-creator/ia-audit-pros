export default async function paymentRoutes(fastify) {

  // Create checkout session
  fastify.post('/create-checkout', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { plan } = req.body
    const userId = req.user.id
    const email = req.user.email

    const priceId = plan === 'agency' 
      ? process.env.STRIPE_AGENCY_PRICE_ID 
      : process.env.STRIPE_PRO_PRICE_ID

    try {
      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'mode': 'subscription',
          'customer_email': email,
          'line_items[0][price]': priceId,
          'line_items[0][quantity]': '1',
          'success_url': `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
          'cancel_url': `${process.env.FRONTEND_URL}/dashboard`,
          'metadata[userId]': userId,
          'metadata[plan]': plan
        })
      })

      const session = await res.json()
      if (session.error) throw new Error(session.error.message)
      return { url: session.url }

    } catch (e) {
      return reply.code(500).send({ message: e.message })
    }
  })

  // Get user plan
  fastify.get('/plan', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { data } = await fastify.supabase
      .from('user_plans')
      .select('plan')
      .eq('user_id', req.user.id)
      .single()

    return { plan: data?.plan || 'free' }
  })
}
