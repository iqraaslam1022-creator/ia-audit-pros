import { useState } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'

export default function CompetitorAnalysis() {
  const [myUrl, setMyUrl] = useState('')
  const [compUrl, setCompUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function analyze() {
    if (!myUrl || !compUrl) return
    setError(''); setResult(null); setLoading(true)
    try {
      const data = await api.compareAudit(myUrl, compUrl)
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

  const myOverall = result ? Math.round(Object.values(result.my_site?.scores || {}).reduce((a, b) => a + b, 0) / 4) : 0
  const compOverall = result ? Math.round(Object.values(result.competitor?.scores || {}).reduce((a, b) => a + b, 0) / 4) : 0

  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <h1 className="page-title">Competitor Analysis</h1>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>My Website</label>
              <input value={myUrl} onChange={e => setMyUrl(e.target.value)} placeholder="https://mywebsite.com"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Competitor Website</label>
              <input value={compUrl} onChange={e => setCompUrl(e.target.value)} placeholder="https://competitor.com"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={analyze} disabled={loading}>
            {loading ? 'Analyzing...' : '⚔️ Compare Now'}
          </button>
        </div>

        {error && <div className="error-card">{error}</div>}

        {loading && (
          <div className="loading-card">
            <p className="step-msg">Comparing websites...</p>
            <div className="prog-track"><div className="prog-fill" style={{ width: '60%' }} /></div>
          </div>
        )}

        {result && (
          <div>
            {/* Winner Banner */}
            <div className="card" style={{
              marginBottom: '1rem',
              background: myOverall >= compOverall ? '#EAF3DE' : '#FCEBEB',
              border: `1px solid ${myOverall >= compOverall ? '#3B6D11' : '#A32D2D'}`
            }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: myOverall >= compOverall ? '#3B6D11' : '#A32D2D', textAlign: 'center' }}>
                {myOverall >= compOverall
                  ? `🏆 Tumhari website behtar hai! (${myOverall} vs ${compOverall})`
                  : `⚠️ Competitor aage hai! (${compOverall} vs ${myOverall})`}
              </p>
            </div>

            {/* Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                {
                  label: '🟣 My Site',
                  url: result.my_site?.url || myUrl,
                  scores: result.my_site?.scores || {},
                  strengths: result.my_site?.strengths || [],
                  weaknesses: result.my_site?.weaknesses || []
                },
                {
                  label: '⚫ Competitor',
                  url: result.competitor?.url || compUrl,
                  scores: result.competitor?.scores || {},
                  strengths: result.competitor?.strengths || [],
                  weaknesses: result.competitor?.weaknesses || []
                }
              ].map((site, idx) => (
                <div key={idx} className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '0.5rem', color: idx === 0 ? 'var(--purple)' : 'var(--red)' }}>
                    {site.label}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1rem' }}>{site.url}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
                    {Object.entries(site.scores).map(([key, val]) => (
                      <div key={key} style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: scoreColor(val) }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#3B6D11', marginBottom: 4 }}>✅ Strengths</p>
                  {site.strengths.map((s, i) => (
                    <p key={i} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>• {s}</p>
                  ))}
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#A32D2D', marginBottom: 4, marginTop: 8 }}>❌ Weaknesses</p>
                  {site.weaknesses.map((w, i) => (
                    <p key={i} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>• {w}</p>
                  ))}
                </div>
              ))}
            </div>

            {/* Verdict */}
            {result.verdict && (
              <div className="card" style={{ marginBottom: '1rem', background: 'var(--purple-light)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--purple)' }}>🏆 Verdict</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-2)' }}>{result.verdict}</p>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>💡 Recommendations</h3>
                {result.recommendations.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <span style={{ background: 'var(--purple)', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--text)' }}>{r}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="footer">IA Audit Pro · Powered by Groq AI</footer>
    </div>
  )
}
