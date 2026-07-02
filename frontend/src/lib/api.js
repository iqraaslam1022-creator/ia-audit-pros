const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed')
    err.upgradeRequired = !!data.upgradeRequired
    throw err
  }
  return data
}

export const api = {
  // Auth
  signup: (email, password) =>
    request('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Audit
  runAudit: (url) =>
    request('/api/audit/run', { method: 'POST', body: JSON.stringify({ url }) }),
  askAI: (auditId, question, history) =>
    request('/api/audit/ask', { method: 'POST', body: JSON.stringify({ auditId, question, history }) }),

  // History
  getHistory: () => request('/api/history'),
  getAudit: (id) => request(`/api/history/${id}`),

  // Payment
  createCheckout: (plan) =>
    request('/api/payment/create-checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
  getPlan: () => request('/api/payment/plan'),

  // Competitor — FIXED: correct path + correct param names
  compareAudit: (myUrl, competitorUrl) =>
    request('/api/competitor/analyze', { method: 'POST', body: JSON.stringify({ url: myUrl, competitor_url: competitorUrl }) }),
}
