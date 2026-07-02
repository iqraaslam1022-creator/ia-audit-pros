export default async function paymentRoutes(fastify) {
  fastify.post('/create-checkout', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { plan } = req.body
    const userId = req.user.id
    const email = req.user.email

    const provider = process.env.PAYMENT_PROVIDER || 'stripe' // 'stripe' ya 'lemonsqueezy'

    if (provider === 'lemonsqueezy') {
      return createLemonSqueezyCheckout({ fastify, reply, plan, userId, email })
    }

    return createStripeCheckout({ fastify, reply, plan, userId, email })
  })

  fastify.get('/plan', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { data } = await fastify.supabase
      .from('user_plans')
      .select('plan')
      .eq('user_id', req.user.id)
      .single()
    return { plan: data?.plan || 'free' }
  })
}

// ─── Stripe Checkout ───────────────────────────────────────────────────────────
async function createStripeCheckout({ fastify, reply, plan, userId, email }) {
  const priceId = plan === 'agency'
    ? process.env.STRIPE_AGENCY_PRICE_ID?.trim()
    : process.env.STRIPE_PRO_PRICE_ID?.trim()

  if (!priceId) {
    return reply.code(400).send({ message: `Price ID missing for plan: ${plan}` })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return reply.code(400).send({ message: 'Stripe secret key missing' })
  }

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY.trim()}`,
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
    fastify.log.info('Stripe session: ' + JSON.stringify(session))

    if (session.error) {
      return reply.code(400).send({ message: session.error.message })
    }

    if (!session.url) {
      return reply.code(400).send({ message: 'No checkout URL returned from Stripe' })
    }

    return { url: session.url }
  } catch (e) {
    fastify.log.error(e)
    return reply.code(500).send({ message: e.message })
  }
}

// ─── Lemon Squeezy Checkout ─────────────────────────────────────────────────────
async function createLemonSqueezyCheckout({ fastify, reply, plan, userId, email }) {
  const variantId = plan === 'agency'
    ? process.env.LEMONSQUEEZY_AGENCY_VARIANT_ID?.trim()
    : process.env.LEMONSQUEEZY_PRO_VARIANT_ID?.trim()

  const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim()
  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim()

  if (!variantId) {
    return reply.code(400).send({ message: `Variant ID missing for plan: ${plan}` })
  }
  if (!storeId || !apiKey) {
    return reply.code(400).send({ message: 'Lemon Squeezy store ID or API key is missing' })
  }

  try {
    const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email,
              // custom_data yahan se webhook tak safar karta hai — isi se pata chalta hai
              // ke kaunse user ne payment ki, taake plan sahi account mein update ho
              custom: { userId, plan }
            },
            product_options: {
              redirect_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`
            }
          },
          relationships: {
            store: { data: { type: 'stores', id: storeId } },
            variant: { data: { type: 'variants', id: variantId } }
          }
        }
      })
    })

    const session = await res.json()

    if (session.errors) {
      fastify.log.error('Lemon Squeezy error: ' + JSON.stringify(session.errors))
      return reply.code(400).send({ message: session.errors[0]?.detail || 'Lemon Squeezy checkout fail ho gaya' })
    }

    const checkoutUrl = session.data?.attributes?.url
    if (!checkoutUrl) {
      return reply.code(400).send({ message: 'Could not get checkout URL from Lemon Squeezy' })
    }

    return { url: checkoutUrl }
  } catch (e) {
    fastify.log.error(e)
    return reply.code(500).send({ message: e.message })
  }
}

