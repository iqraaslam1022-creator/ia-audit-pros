import { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api'

export default function AIChat({ data }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const question = input.trim()
    if (!question || sending) return

    setError('')
    const userMsg = { role: 'user', content: question }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setSending(true)

    try {
      const history = nextMessages.map(m => ({ role: m.role, content: m.content }))
      const res = await api.askAI(data?.id, question, history)
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="ai-section">
      {data?.summary && (
        <div className="ai-summary">
          <h3>Audit Summary</h3>
          <p>{data.summary}</p>
        </div>
      )}

      <div className="ai-chatbox">
        <div className="ai-chatbox-header">Ask the AI about your audit</div>
        <div className="ai-messages">
          {messages.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              Ask questions like "How do I fix the missing meta description?" or "What should I prioritize first?"
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
              {m.content}
            </div>
          ))}
          {sending && <div className="msg msg-ai">Thinking...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="ai-input-row">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !input.trim()}>
            Send
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger, #e5484d)', fontSize: 13 }}>⚠️ {error}</p>}
    </div>
  )
}