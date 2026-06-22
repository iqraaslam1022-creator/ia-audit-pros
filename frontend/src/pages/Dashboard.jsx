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

  useEffect(() => {
    api.getHistory()
      .then(data => setHistory(data.audits || []))
      .catch(() => {})
      .finally(() => setLoading(false))
    
    api.getPlan()
      .then(data => setPlan(data.plan || 'free'))
      .catch(() => {})
  }, [])

  async function handleUpgrade(planName) {
    try {
      const res = await api.createCheckout(planName)
      window.location.href = res.url
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  function scoreColor(v) {
    if (v >= 80) return { background: '#EAF3DE', color: '#3B6D11' }
    if (v >= 50) return { background: '#FAEEDA', color: '#854F0B' }
    return { background: '#FCEBEB', color: '#A32D2D' }
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
          <button className="btn btn-primary" onClick={() => navigate('/audit')}>⚡ New Audit</button>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab${activeTab === 'history' ? ' active' : ''}`} onClick={() => setActiveTab('history')}>📋 Audit History</button>
          <button className={`tab${activeTab === 'pricing' ? ' active' : ''}`} onClick={() => setActiveTab('pricing')}>💳 Pricing</button>
        </div>

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            {loading && <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading...</p>}
            {!loading && history.length === 0 && (
              <div className="empty">
                <div className="empty-icon">📋</div>
                <p>Koi audit nahi mili abhi tak</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/audit')}>
                  Pehla Audit Chalao
                </button>
              </div>
            )}
            <div className="history-grid">
              {history.map(item => (
                <div className="history-item" key={item.id} style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/audit', { state: { auditId: item.id } })}>
                  <div>
                    <div className="history-url">{item.url}</div>
                    <div className="history-date">{new Date(item.created_at).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div className="history-scores">
                    {['seo', 'performance', 'security', 'bugs'].map(k => (
                      <span key={k} className="score-pill" style={scoreColor(item.scores?.[k] || 0)}>
                        {k.toUpperCase()} {item.scores?.[k] || 0}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {/* Free */}
            <div className="card" style={{ border: plan === 'free' ? '2px solid var(--purple)' : '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>Free</h3>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>$0<span style={{ fontSize: 14, fontWeight: 400 }}>/month</span></div>
              {['3 audits/month', 'Basic SEO check', 'PDF export', 'AI Chat'].map(f => (
                <p key={f} style={{ fontSize: 13, marginBottom: 6 }}>✓ {f}</p>
              ))}
              <button className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled>
                {plan === 'free' ? 'Current Plan' : 'Free'}
              </button>
            </div>

            {/* Pro */}
            <div className="card" style={{ border: plan === 'pro' ? '2px solid var(--purple)' : '1px solid var(--border)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--purple)', color: 'white', padding: '2px 16px', borderRadius: 20, fontSize: 12 }}>⭐ Popular</div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>Pro</h3>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>$19<span style={{ fontSize: 14, fontWeight: 400 }}>/month</span></div>
              {['Unlimited audits', 'Competitor analysis', 'White-label PDF', 'Email reports', 'Priority support'].map(f => (
                <p key={f} style={{ fontSize: 13, marginBottom: 6 }}>✓ {f}</p>
              ))}
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => handleUpgrade('pro')} disabled={plan === 'pro'}>
                {plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
              </button>
            </div>

            {/* Agency */}
            <div className="card" style={{ border: plan === 'agency' ? '2px solid var(--purple)' : '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>Agency</h3>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>$49<span style={{ fontSize: 14, fontWeight: 400 }}>/month</span></div>
              {['Everything in Pro', '10 team members', 'API access', 'Custom branding', 'Multi-client dashboard'].map(f => (
                <p key={f} style={{ fontSize: 13, marginBottom: 6 }}>✓ {f}</p>
              ))}
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => handleUpgrade('agency')} disabled={plan === 'agency'}>
                {plan === 'agency' ? 'Current Plan' : 'Upgrade to Agency'}
              </button>
            </div>
          </div>
        )}
      </main>
      <footer className="footer">IA Audit Pro · Powered by Groq AI</footer>
    </div>
  )
}
