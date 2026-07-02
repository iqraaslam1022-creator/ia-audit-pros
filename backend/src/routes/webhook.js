import crypto from 'crypto'

// NOTE: Ye route apna khud ka JSON parser use karta hai (raw body ke saath)
// kyunke Lemon Squeezy signature verify karne ke liye EXACT raw bytes chahiye,
// Fastify ka default parser JSON parse karke raw bytes discard kar deta hai.
export default async function webhookRoutes(fastify) {
  fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    req.rawBody = body
    try {
      done(null, JSON.parse(body))
    } catch (err) {
      done(err)
    }
  })

  fastify.post('/lemonsqueezy', async (req, reply) => {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!secret) {
      fastify.log.error('LEMONSQUEEZY_WEBHOOK_SECRET .env mein set nahi hai')
      return reply.code(500).send({ message: 'Webhook secret configure nahi hai' })
    }

    // ─── Signature verify karo (security ke liye zaroori — warna koi bhi fake payment event bhej sakta hai) ───
    const signature = req.headers['x-signature'] || ''
    const digest = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex')

    const sigBuf = Buffer.from(signature, 'utf8')
    const digestBuf = Buffer.from(digest, 'utf8')
    if (sigBuf.length !== digestBuf.length || !crypto.timingSafeEqual(sigBuf, digestBuf)) {
      fastify.log.warn('Lemon Squeezy webhook: invalid signature')
      return reply.code(401).send({ message: 'Invalid signature' })
    }

    const event = req.body
    const eventName = event?.meta?.event_name
    const userId = event?.meta?.custom_data?.userId

    if (!userId) {
      fastify.log.warn('Lemon Squeezy webhook: custom_data.userId missing, skipping')
      return reply.code(200).send({ received: true })
    }

    const variantId = String(
      event?.data?.attributes?.variant_id ||
      event?.data?.attributes?.first_subscription_item?.variant_id || ''
    )

    const planMap = {
      [process.env.LEMONSQUEEZY_PRO_VARIANT_ID]: 'pro',
      [process.env.LEMONSQUEEZY_AGENCY_VARIANT_ID]: 'agency'
    }

    try {
      // Subscription active ho gayi — plan upgrade karo
      if (['subscription_created', 'subscription_updated', 'subscription_resumed', 'subscription_unpaused'].includes(eventName)) {
        const status = event?.data?.attributes?.status
        const isActive = status === 'active' || status === 'on_trial'
        const plan = isActive ? (planMap[variantId] || 'pro') : 'free'

        const { error } = await fastify.supabase.from('user_plans').upsert({
          user_id: userId,
          plan,
          lemonsqueezy_subscription_id: event?.data?.id || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

        if (error) throw new Error('Supabase upsert error: ' + error.message)
        fastify.log.info(`User ${userId} ka plan '${plan}' set ho gaya (event: ${eventName})`)
      }

      // Subscription cancel/expire ho gayi — wapis free pe daalo
      if (['subscription_cancelled', 'subscription_expired', 'subscription_paused'].includes(eventName)) {
        const { error } = await fastify.supabase.from('user_plans').upsert({
          user_id: userId,
          plan: 'free',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

        if (error) throw new Error('Supabase upsert error: ' + error.message)
        fastify.log.info(`User ${userId} ka plan 'free' pe wapis aa gaya (event: ${eventName})`)
      }
    } catch (e) {
      fastify.log.error(e)
      return reply.code(500).send({ message: e.message })
    }

    return reply.code(200).send({ received: true })
  })
}
