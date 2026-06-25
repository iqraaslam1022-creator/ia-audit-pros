import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('history')
  const [plan, setPlan] = useState('free')
  const navigate = useNavigate()

  async function handleUpgrade(planName) {
    try {
      const res = await api.createCheckout(planName)
      window.location.href = res.url
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  useEffect(() => {
    api.getHistory().then(data => setHistory(data.audits || [])).catch(() => {}).finally(() => setLoading(false))
    api.getPlan().then(data => setPlan(data.plan || 'free')).catch(() => {})

    const params = new URLSearchParams(window.location.search)
    const upgradePlan = params.get('upgrade')
    if (upgradePlan && upgradePlan !== 'free') {
      setTimeout(() => handleUpgrade(upgradePlan), 800)
    }
  }, [])

  function scoreColor(v) {
    if (v >= 80) return { background: '#052e16', color: '#22c55e' }
    if (v >= 50) return { background: '#1c1500', color: '#f59e0b' }
    return { background: '#1a0505', color: '#ef4444' }
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
          <button className="btn btn-primary" onClick={() => navigate('/audit')}>New Audit</button>
        </div>
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab${activeTab === 'history' ? ' active' : ''}`} onClick={() => setActiveTab('history')}>Audit History</button>
          <button className={`tab${activeTab === 'pricing' ? ' active' : ''}`} onClick={() => setActiveTab('pricing')}>Pricing</button>
        </div>
        {activeTab === 'history' && (
          <>
            {loading && <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading...</p>}
            {!loading && history.length === 0 && (
              <div className="empty">
                <div className="empty-icon">📋</div>
                <p>Koi audit nahi mili abhi tak</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/audit')}>Pehla Audit Chalao</button>
              </div>
            )}
            <div className="history-grid">
              {history.map(item => (
                <div className="history-item" key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/audit', { state: { auditId: item.id } })}>
                  <div>
                    <div className="history-url">{item.url}</div>
                    <div className="history-date">{new Date(item.created_at).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div className="history-scores">
                    {['seo','performance','security','bugs'].map(k => (
                      <span key={k} className="score-pill" style={scoreColor(item.scores?.[k] || 0)}>{k.toUpperCase()} {item.scores?.[k] || 0}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {activeTab === 'pricing' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            {[
              { name: 'Free', price: '$0', features: ['3 audits/month', 'Basic SEO check', 'PDF export', 'AI Chat'], p: 'free', popular: false },
              { name: 'Pro', price: '$19', features: ['Unlimited audits', 'Competitor analysis', 'White-label PDF', 'Email reports', 'Priority support'], p: 'pro', popular: true },
              { name: 'Agency', price: '$49', features: ['Everything in Pro', '10 team members', 'API access', 'Custom branding', 'Multi-client dashboard'], p: 'agency', popular: false },
            ].map(({ name, price, features, p, popular }) => (
              <div key={name} style={{ background: popular ? 'var(--card2)' : 'var(--card)', border: popular ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: 16, padding: '2rem', position: 'relative' }}>
                {popular && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#000', padding: '2px 16px', borderRadius: 20, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{name}</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: popular ? 'var(--accent)' : 'var(--text)' }}>{price}</span>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>/month</span>
                </div>
                {features.map(f => <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 8 }}><span style={{ color: 'var(--accent)' }}>+</span><span style={{ fontSize: 13, color: 'var(--muted)' }}>{f}</span></div>)}
                <button style={{ width: '100%', marginTop: '1rem', padding: '11px', background: plan === p ? 'transparent' : popular ? 'var(--accent)' : 'transparent', color: plan === p ? 'var(--muted)' : popular ? '#000' : 'var(--accent)', border: plan === p ? '1px solid var(--border)' : popular ? 'none' : '1px solid var(--accent)', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: plan === p ? 'default' : 'pointer' }}
                  onClick={() => plan !== p && p !== 'free' && handleUpgrade(p)} disabled={plan === p}>
                  {plan === p ? 'Current Plan' : `Upgrade to ${name}`}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <footer className="footer">IA Audit Pro · Powered by Groq AI</footer>
    </div>
  )
}
