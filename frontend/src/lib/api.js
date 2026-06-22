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
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  signup: (email, password) =>
    request('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  runAudit: (url) =>
    request('/api/audit/run', { method: 'POST', body: JSON.stringify({ url }) }),
  askAI: (auditId, question, history) =>
    request('/api/audit/ask', { method: 'POST', body: JSON.stringify({ auditId, question, history }) }),
  compareAudit: (myUrl, competitorUrl) =>
    request('/api/audit/compare', { method: 'POST', body: JSON.stringify({ myUrl, competitorUrl }) }),  // ✅ YEH ADD KARO
  getHistory: () => request('/api/history'),
  getAudit: (id) => request(`/api/history/${id}`),
}
