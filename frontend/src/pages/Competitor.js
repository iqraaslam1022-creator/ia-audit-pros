import { useState } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'

export default function Competitor() {
  const [myUrl, setMyUrl] = useState('')
  const [compUrl, setCompUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function analyze() {
    if (!myUrl || !compUrl) return
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await api.compareCompetitor(myUrl, compUrl)
      setResult(data.comparison)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function scoreColor(v) {
    if (v >= 80) return '#3B6D11'
    if (v >= 50) return '#854F0B'
    return '#A32D2D'
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <h1 className="page-title">Competitor Analysis</h1>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>My Website</label>
              <input
                value={myUrl}
                onChange={e => setMyUrl(e.target.value)}
                placeholder="https://mywebsite.com"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Competitor Website</label>
              <input
                value={compUrl}
                onChange={e => setCompUrl(e.target.value)}
                placeholder="https://competitor.com"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={analyze} disabled={loading}>
            {loading ? 'Analyzing...' : '⚡ Compare Now'}
          </button>
        </div>

        {error && <div className="error-card">⚠️ {error}</div>}

        {loading && (
          <div className="loading-card">
            <p className="step-msg">Comparing websites...</p>
            <div className="prog-track"><div className="prog-fill" style={{ width: '60%' }} /></div>
          </div>
        )}

        {result && (
          <>
            {/* Score Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[result.my_site, result.competitor].map((site, idx) => (
                <div key={idx} className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem', color: idx === 0 ? 'var(--purple)' : 'var(--red)' }}>
                    {idx === 0 ? '⚡ My Site' : '🏆 Competitor'}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1rem' }}>{site.url}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
                    {Object.entries(site.scores).map(([key, val]) => (
                      <div key={key} style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{key}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: scoreColor(val) }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>✅ Strengths</p>
                    {site.strengths.map((s, i) => <p key={i} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>• {s}</p>)}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', marginBottom: 4 }}>❌ Weaknesses</p>
                    {site.weaknesses.map((w, i) => <p key={i} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>• {w}</p>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Verdict */}
            <div className="card" style={{ marginBottom: '1rem', background: 'var(--purple-light)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--purple)' }}>🏆 Verdict</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{result.verdict}</p>
            </div>

            {/* Recommendations */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>💡 Recommendations</h3>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: 'var(--purple)', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ fontSize: 13, color: 'var(--text)' }}>{r}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {!result && !loading && !error && (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <p>Apni website aur competitor ka URL daalo</p>
          </div>
        )}
      </main>
      <footer className="footer">IA Audit Pro · Powered by Groq AI</footer>
    </div>
  )
}
