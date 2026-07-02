import fp from 'fastify-plugin'

// Free tier ke limits — ek jagah define, sab routes yahan se import karenge
const FREE_AUDIT_LIMIT_PER_MONTH = 3

export default fp(async (fastify) => {
  // User ka current plan supabase se fetch karo ('free' default hai)
  async function getUserPlan(userId) {
    const { data } = await fastify.supabase
      .from('user_plans')
      .select('plan')
      .eq('user_id', userId)
      .single()
    return data?.plan || 'free'
  }

  // Is mahine kitne audits ho chuke hain (free-tier limit check ke liye)
  async function getAuditsThisMonth(userId) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await fastify.supabase
      .from('audits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())

    return count || 0
  }

  // Route ke andar ek line mein feature-gate karne ke liye
  // Usage: const gate = await fastify.requirePaidPlan(userId)
  //        if (gate) return reply.code(403).send(gate)
  async function requirePaidPlan(userId, featureName = 'Ye feature') {
    const plan = await getUserPlan(userId)
    if (plan === 'free') {
      return {
        message: `${featureName} is only available on the Pro or Agency plan. Upgrade to unlock this feature.`,
        upgradeRequired: true
      }
    }
    return null
  }

  fastify.decorate('getUserPlan', getUserPlan)
  fastify.decorate('getAuditsThisMonth', getAuditsThisMonth)
  fastify.decorate('requirePaidPlan', requirePaidPlan)
  fastify.decorate('FREE_AUDIT_LIMIT_PER_MONTH', FREE_AUDIT_LIMIT_PER_MONTH)
})
