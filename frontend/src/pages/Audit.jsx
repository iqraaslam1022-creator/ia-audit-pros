import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AuditForm from '../components/AuditForm'
import ScoreGrid from '../components/ScoreGrid'
import IssueList from '../components/IssueList'
import AIChat from '../components/AIChat'
import ExportBar from '../components/ExportBar'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const TABS = ['SEO', 'Performance', 'Security', 'Bugs', 'AI Chat']
const KEYS = ['seo', 'performance', 'security', 'bugs', 'ai']
const STEPS = ['Checking SEO tags...', 'Analyzing performance...', 'Scanning security...', 'Detecting bugs...', 'Running AI...', 'Saving results...']

export default function Audit() {
  const navigate = useNavigate()
  const { isPaid } = useAuth()
  const [auditData, setAuditData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stepMsg, setStepMsg] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [error, setError] = useState('')
  const [upgradeRequired, setUpgradeRequired] = useState(false)

  const sleep = ms => new Promise(r => setTimeout(r, ms))

  async function runAudit(url) {
    setError(''); setUpgradeRequired(false); setAuditData(null); setLoading(true); setProgress(0); setActiveTab(0)
    for (let i = 0; i < STEPS.length; i++) {
      setStepMsg(STEPS[i])
      setProgress(Math.round(((i + 1) / STEPS.length) * 85))
      await sleep(400)
    }
    try {
      const data = await api.runAudit(url)
      setProgress(100)
      await sleep(300)
      setAuditData(data.audit)
    } catch (e) {
      setError(e.message)
      setUpgradeRequired(!!e.upgradeRequired)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <AuditForm onAudit={runAudit} loading={loading} />
        {loading && (
          <div className="loading-card">
            <p className="step-msg">{stepMsg}</p>
            <div className="prog-track"><div className="prog-fill" style={{ width: progress + '%' }} /></div>
            <p className="prog-pct">{progress}%</p>
          </div>
        )}
        {error && (
          <div className="error-card">
            ⚠️ {error}
            {upgradeRequired && (
              <button className="btn btn-primary" style={{ marginLeft: 12 }} onClick={() => navigate('/dashboard')}>
                Upgrade karein →
              </button>
            )}
          </div>
        )}
        {auditData && (
          <>
            <ExportBar data={auditData} />
            <ScoreGrid scores={auditData.scores} />
            <div className="tabs">
              {TABS.map((t, i) => (
                <button key={t} className={`tab${activeTab === i ? ' active' : ''}`} onClick={() => setActiveTab(i)}>
                  {t}{t === 'AI Chat' && !isPaid ? ' 🔒' : ''}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {activeTab < 4 ? (
                <IssueList items={auditData[KEYS[activeTab]]} />
              ) : isPaid ? (
                <AIChat data={auditData} />
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ marginBottom: 12 }}>🔒 AI Chat sirf Pro aur Agency plan mein available hai.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Upgrade karein →</button>
                </div>
              )}
            </div>
          </>
        )}
        {!auditData && !loading && !error && (
          <div className="empty"><div className="empty-icon">🔍</div><p>Website URL enter karo aur audit chalao</p></div>
        )}
      </main>
      <footer className="footer">IA Audit Pro · Powered by Groq AI</footer>
    </div>
  )
}
 
 
