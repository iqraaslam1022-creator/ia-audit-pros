import { useState } from 'react'
import { api } from '../lib/api'

export default function CompetitorAnalysis() {
  const [myUrl, setMyUrl] = useState('')
  const [compUrl, setCompUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function runComparison() {
    if (!myUrl || !compUrl) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await api.compareAudit(myUrl, compUrl)
      setResult(data.comparison)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const keys = ['seo', 'performance', 'security', 'bugs']

  function scoreColor(v) {
    if (v >= 80) return '#059669'
    if (v >= 50) return '#D97706'
    return '#DC2626'
  }

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: '1rem' }}>⚔️ Competitor Analysis</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <input className="form-input" style={{ flex: 1, minWidth: 200 }}
          placeholder="Meri website: https://mysite.com"
          value={myUrl} onChange={e => setMyUrl(e.target.value)} />
        <input className="form-input" style={{ flex: 1, minWidth: 200 }}
          placeholder="Competitor: https://competitor.com"
          value={compUrl} onChange={e => setCompUrl(e.target.value)} />
        <button className="btn btn-primary" onClick={runComparison} disabled={loading || !myUrl || !compUrl}>
          {loading ? '⏳ Analyzing...' : '⚔️ Compare'}
        </button>
      </div>

      {error && <div className="error-card">⚠️ {error}</div>}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 14 }}>
          🔍 Dono websites analyze ho rahi hain...
        </div>
      )}

      {result && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '1rem', border: '2px solid var(--purple)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--purple)' }}>
                🟣 {myUrl.replace('https://','').replace('http://','').split('/')[0]}
              </div>
              {keys.map(k => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)' }}>{k}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: scoreColor(result.my.scores[k]) }}>
                    {result.my.scores[k]}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--muted)' }}>
                ⚫ {compUrl.replace('https://','').replace('http://','').split('/')[0]}
              </div>
              {keys.map(k => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)' }}>{k}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: scoreColor(result.competitor.scores[k]) }}>
                    {result.competitor.scores[k]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: result.winner === 'my' ? '#EAF3DE' : '#FCEBEB', borderRadius: 8, padding: '1rem', marginBottom: 12, textAlign: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              {result.winner === 'my'
                ? `🏆 Tumhari website behtar hai! Overall: ${result.my.overall} vs ${result.competitor.overall}`
                : `⚠️ Competitor aage hai! Overall: ${result.competitor.overall} vs ${result.my.overall}`}
            </span>
          </div>

          {result.advantages?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#059669' }}>✅ Tumhari strengths:</div>
              {result.advantages.map((a, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>• {a}</div>
              ))}
            </div>
          )}

          {result.weaknesses?.length > 0 && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#DC2626' }}>❌ Improve karo:</div>
              {result.weaknesses.map((w, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>• {w}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
