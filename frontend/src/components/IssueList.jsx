import { useState } from 'react'
import { api } from '../lib/api'

const BADGE = { critical:'badge-critical', warning:'badge-warning', info:'badge-info', pass:'badge-pass' }

export default function IssueList({ items = [] }) {
  const [fixes, setFixes] = useState({})
  const [loading, setLoading] = useState({})

  async function autoFix(item, index) {
    setLoading(prev => ({ ...prev, [index]: true }))
    try {
      const data = await api.autoFix(item.title, item.desc, item.fix)
      setFixes(prev => ({ ...prev, [index]: data.code }))
    } catch (e) {
      setFixes(prev => ({ ...prev, [index]: 'Error: ' + e.message }))
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }))
    }
  }

  function copyCode(index) {
    navigator.clipboard.writeText(fixes[index])
    alert('✅ Code copy ho gaya!')
  }

  return (
    <div className="issues">
      {items.map((item, i) => (
        <div key={i} className="issue">
          <div className="issue-top">
            <span className={`badge ${BADGE[item.type] || 'badge-info'}`}>{item.type.toUpperCase()}</span>
            <span className="issue-title">{item.title}</span>
          </div>
          <p className="issue-desc">{item.desc}</p>
          <p className="issue-fix">🔧 {item.fix}</p>

          {/* Auto Fix Button — pass type ke liye nahi */}
          {item.type !== 'pass' && (
            <div style={{ marginTop: 10 }}>
              {!fixes[i] && (
                <button
                  className="btn btn-primary"
                  style={{ fontSize: 12, padding: '6px 14px' }}
                  onClick={() => autoFix(item, i)}
                  disabled={loading[i]}
                >
                  {loading[i] ? '⏳ Generating fix...' : '🤖 Auto Fix'}
                </button>
              )}

              {fixes[i] && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#059669' }}>
                    ✅ Ready-made fix:
                  </div>
                  <pre style={{
                    background: '#1e1e1e', color: '#d4d4d4', padding: '12px',
                    borderRadius: 8, fontSize: 12, overflowX: 'auto',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                  }}>
                    {fixes[i].replace(/^```[\w]*\n?/,'').replace(/```$/,'').trim()}
  </pre>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 12, padding: '6px 14px' }}
                      onClick={() => copyCode(i)}
                    >
                      📋 Copy Code
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 12, padding: '6px 14px' }}
                      onClick={() => setFixes(prev => ({ ...prev, [i]: null }))}
                    >
                      🔄 Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
