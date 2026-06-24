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
      const data = await api.compareAudit(myUrl, compUrl)
      const comp = data.comparison

      // Backend my_site/competitor ko frontend ke liye map karo
      const myScores = comp.my_site?.scores || {}
      const compScores = comp.competitor?.scores || {}

      const myTotal = Object.values(myScores).reduce((a, b) => a + b, 0)
      const compTotal = Object.values(compScores).reduce((a, b) => a + b, 0)

      setResult({
        my_site: comp.my_site,
        competitor: comp.competitor,
        verdict: comp.verdict,
        recommendations: comp.recommendations || [],
        myTotal,
        compTotal,
        iWin: myTotal >= compTotal
      })
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

        {/* Input Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>My Website</label>
              <input
                value={myUrl}
                onChange={e => setMyUrl(e.target.value)}
                placeholder="iaatelier.site"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Competitor Website</label>
              <input
                value={compUrl}
                onChange={e => setCompUrl(e.target.value)}
                placeholder="competitor.com"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
              />
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
              background: result.iWin ? '#EAF3DE' : '#FCEBEB',
              border: `1px solid ${result.iWin ? '#3B6D11' : '#A32D2D'}`
            }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: result.iWin ? '#3B6D11' : '#A32D2D', textAlign: 'center' }}>
                {result.iWin
                  ? `🏆 Tumhari website behtar hai! (${result.myTotal} vs ${result.compTotal})`
                  : `⚠️ Competitor aage hai! (${result.compTotal} vs ${result.myTotal})`}
              </p>
            </div>

            {/* Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: '🟣 My Site', url: result.my_site?.url || myUrl, scores: result.my_site?.scores || {} },
                { label: '⚫ Competitor', url: result.competitor?.url || compUrl, scores: result.competitor?.scores || {} }
              ].map((site, idx) => (
                <div key={idx} className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '0.5rem', color: idx === 0 ? 'var(--purple)' : '#A32D2D' }}>{site.label}</h3>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1rem' }}>{site.url}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {Object.entries(site.scores).map(([key, val]) => (
                      <div key={key} style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{key}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: scoreColor(val) }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {result.my_site?.strengths?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#3B6D11' }}>✅ Meri Strengths</h3>
                  {result.my_site.strengths.map((s, i) => (
                    <p key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>• {s}</p>
                  ))}
                </div>
              )}
              {result.competitor?.strengths?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#A32D2D' }}>⚔️ Competitor Strengths</h3>
                  {result.competitor.strengths.map((s, i) => (
                    <p key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>• {s}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {result.my_site?.weaknesses?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#854F0B' }}>⚠️ Meri Weaknesses</h3>
                  {result.my_site.weaknesses.map((w, i) => (
                    <p key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>• {w}</p>
                  ))}
                </div>
              )}
              {result.competitor?.weaknesses?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#3B6D11' }}>✅ Competitor Weaknesses</h3>
                  {result.competitor.weaknesses.map((w, i) => (
                    <p key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>• {w}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Verdict */}
            {result.verdict && (
              <div className="card" style={{ marginBottom: '1rem', background: 'var(--purple-light)', border: '1px solid #c5c2f5' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--purple)' }}>📊 Verdict</h3>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{result.verdict}</p>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--purple)' }}>💡 Recommendations</h3>
                {result.recommendations.map((r, i) => (
                  <p key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8, paddingLeft: 12, borderLeft: '3px solid var(--purple)' }}>• {r}</p>
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
 

   
 
