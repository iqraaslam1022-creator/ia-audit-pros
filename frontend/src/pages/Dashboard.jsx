import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Audit History</h1>
          <button className="btn btn-primary" onClick={() => navigate('/audit')}>⚡ New Audit</button>
        </div>
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
                {['seo','performance','security','bugs'].map(k => (
                  <span key={k} className="score-pill" style={scoreColor(item.scores?.[k] || 0)}>
                    {k.toUpperCase()} {item.scores?.[k] || 0}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="footer">IA Audit Pro · Powered by Claude AI</footer>
    </div>
  )
}
