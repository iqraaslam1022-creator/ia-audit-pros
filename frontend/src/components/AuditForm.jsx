export default function AuditForm({ onAudit, loading }) {
  function handleSubmit(e) {
    e.preventDefault()
    const url = e.target.url.value.trim()
    if (!url) return
    onAudit(url.startsWith('http') ? url : 'https://' + url)
  }
  return (
    <form onSubmit={handleSubmit} className="audit-form" style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
      <input name="url" type="text" placeholder="https://yourwebsite.com" disabled={loading}
        style={{ flex: 1, minWidth: 0, padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: 'var(--card)', color: 'var(--text)', outline: 'none' }} />
      <button type="submit" disabled={loading} className="btn btn-primary" style={{ flexShrink: 0 }}>
        {loading ? 'Analyzing...' : '⚡ Run Audit'}
      </button>
    </form>
  )
}
