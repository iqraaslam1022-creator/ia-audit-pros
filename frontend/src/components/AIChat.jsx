import { useState } from 'react'
import { api } from '../lib/api'

export default function AIChat({ data }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    const newHistory = [...messages, { role: 'user', content: q }]
    setMessages(newHistory)
    setLoading(true)
    try {
      const res = await api.askAI(data.id, q, newHistory)
      setMessages([...newHistory, { role: 'assistant', content: res.reply }])
    } catch (e) {
      setMessages([...newHistory, { role: 'assistant', content: 'Error: ' + e.message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-section">
      <div className="ai-summary">
        <h3>🤖 AI Summary</h3>
        <p>{data.summary}</p>
      </div>
      <div className="ai-chatbox">
        <div className="ai-chatbox-header">💬 Ask AI about your site</div>
        <div className="ai-messages">
          {messages.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Kuch bhi poocho audit ke baare mein...</p>}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'msg-user' : 'msg-ai'}`}>{m.content}</div>
          ))}
          {loading && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Soch raha hun...</p>}
        </div>
        <div className="ai-input-row">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="e.g. Meta description kaise fix karun?" />
          <button className="btn btn-primary" onClick={send} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  )
}
