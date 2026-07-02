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
      if (res.url) {
        window.location.href = res.url
      } else {
        alert('Error: No checkout URL')
      }
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  useEffect(() => {
    api.getHistory().then(data => setHistory(data.audits || [])).catch(() => {}).finally(() => setLoading(false))
    api.getPlan().then(data => setPlan(data.plan || 'free')).catch(() => {})

    // ✅ Landing page se selected plan check karo
    const selectedPlan = localStorage.getItem('selectedPlan')
    if (selectedPlan && selectedPlan !== 'free') {
      localStorage.removeItem('selectedPlan')
      setTimeout(() => handleUpgrade(selectedPlan), 500)
    }
  }, [])

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
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {plan !== 'free' && (
              
                href="mailto:support@iaauditpro.online?subject=Priority Support Request"
                className="btn"
                style={{ border: '1px solid var(--border)', fontSize: 13, textDecoration: 'none' }}
              >
                💬 Priority Support
              </a>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/audit')}>⚡ New Audit</button>
          </div>
        </div> 

        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab${activeTab === 'history' ? ' active' : ''}`} onClick={() => setActiveTab('history')}>📋 Audit History</button>
          <button className={`tab${activeTab === 'pricing' ? ' active' : ''}`} onClick={() => setActiveTab('pricing')}>💳 Pricing</button>
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

        {activeTab === 'pricing' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { name: 'Free', price: '$0', p: 'free', features: ['3 audits/month', 'Basic SEO check', 'PDF export', 'AI Chat'], popular: false },
              { name: 'Pro', price: '$19', p: 'pro', features: ['Unlimited audits', 'Competitor analysis', 'White-label PDF', 'Email reports', 'Priority support'], popular: true },
              { name: 'Agency', price: '$49', p: 'agency', features: ['Everything in Pro', 'Unlimited Audits', 'Competitor Analysis', 'White-label PDF', 'Priority Support', 'Advanced Reports'], popular: false },
            ].map(({ name, price, p, features, popular }) => (
              <div key={name} className="card" style={{ border: plan === p ? '2px solid var(--purple)' : popular ? '1px solid var(--purple-mid)' : '1px solid var(--border)', position: 'relative' }}>
                {popular && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--purple)', color: 'white', padding: '2px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{name}</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--purple)' }}>{price}</span>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>/month</span>
                </div>
                {features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <span style={{ color: 'var(--purple)', fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{f}</span>
                  </div>
                ))}
                <button
                  style={{ width: '100%', marginTop: '1.25rem', padding: '11px', background: plan === p ? 'transparent' : 'var(--purple)', color: plan === p ? 'var(--muted)' : 'white', border: plan === p ? '1px solid var(--border)' : 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: plan === p ? 'default' : 'pointer', boxShadow: plan !== p ? 'var(--shadow-purple)' : 'none' }}
                  onClick={() => plan !== p && p !== 'free' && handleUpgrade(p)}
                  disabled={plan === p}
                >
                  {plan === p ? 'Current Plan' : p === 'free' ? 'Free' : `Upgrade to ${name}`}
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
