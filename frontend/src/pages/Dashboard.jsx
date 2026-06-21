 import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ScoreHistoryChart from '../components/ScoreHistoryChart'
import CompetitorAnalysis from '../components/CompetitorAnalysis'
import { api } from '../lib/api'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    color: 'var(--border)',
    features: ['3 audits/month', 'Basic SEO check', 'PDF export', 'AI Chat'],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    color: 'var(--purple)',
    features: ['Unlimited audits', 'Competitor analysis', 'Score history', 'Priority support', 'White-label PDF'],
    cta: 'Upgrade to Pro',
    disabled: false,
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$49',
    period: '/month',
    color: '#059669',
    features: ['Everything in Pro', 'Multi-client dashboard', '10 team members', 'API access', 'Custom branding'],
    cta: 'Contact Sales',
    disabled: false,
  },
]

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('history')
  const navigate = useNavigate()

  useEffect(() => {
    api.getHistory()
      .then(data => setHistory(data.audits || []))
      .catch(() => {})
      .finally(() => setLoading(false))
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

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
          <button className="btn btn-primary" onClick={() => navigate('/audit')}>⚡ New Audit</button>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {[['history', '📋 Audit History'], ['compare', '⚔️ Competitor'], ['pricing', '💳 Pricing']].map(([id, label]) => (
            <button key={id} className={`tab${activeTab === id ? ' active' : ''}`} onClick={() => setActiveTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            <ScoreHistoryChart history={history} />
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

        {/* Competitor Tab */}
        {activeTab === 'compare' && <CompetitorAnalysis />}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {PLANS.map(plan => (
              <div key={plan.name} className="card" style={{
                border: plan.highlight ? `2px solid var(--purple)` : '1px solid var(--border)',
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--purple)', color: '#fff', fontSize: 11, fontWeight: 700,
                    padding: '3px 14px', borderRadius: 20,
                  }}>⭐ MOST POPULAR</div>
                )}
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: plan.color }}>
                  {plan.price}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>{plan.period}</span>
                </div>
                <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: '#059669' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button
                  className={`btn ${plan.highlight ? 'btn-primary' : ''}`}
                  style={{ width: '100%', marginTop: 8 }}
                  disabled={plan.disabled}
                  onClick={() => !plan.disabled && alert('Payment integration coming soon! 🚀')}
                >
                  {plan.cta}
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
