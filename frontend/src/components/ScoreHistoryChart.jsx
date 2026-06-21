import { useEffect, useRef } from 'react'

const COLORS = {
  seo: '#7C3AED',
  performance: '#2563EB',
  security: '#059669',
  bugs: '#D97706',
}

export default function ScoreHistoryChart({ history }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!history || history.length === 0) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const PAD = { top: 20, right: 20, bottom: 40, left: 40 }
    const chartW = W - PAD.left - PAD.right
    const chartH = H - PAD.top - PAD.bottom

    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, W, H)

    const data = [...history].reverse().slice(-10) // last 10 audits
    const keys = ['seo', 'performance', 'security', 'bugs']

    // Grid lines
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(PAD.left, y)
      ctx.lineTo(PAD.left + chartW, y)
      ctx.stroke()
      ctx.fillStyle = '#9ca3af'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(100 - i * 25, PAD.left - 6, y + 4)
    }

    // X axis labels
    data.forEach((item, i) => {
      const x = PAD.left + (chartW / Math.max(data.length - 1, 1)) * i
      const date = new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      ctx.fillStyle = '#9ca3af'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(date, x, H - 8)
    })

    // Lines
    keys.forEach(key => {
      ctx.strokeStyle = COLORS[key]
      ctx.lineWidth = 2.5
      ctx.beginPath()
      data.forEach((item, i) => {
        const x = PAD.left + (chartW / Math.max(data.length - 1, 1)) * i
        const y = PAD.top + chartH - (chartH * (item.scores?.[key] || 0)) / 100
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Dots
      data.forEach((item, i) => {
        const x = PAD.left + (chartW / Math.max(data.length - 1, 1)) * i
        const y = PAD.top + chartH - (chartH * (item.scores?.[key] || 0)) / 100
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = COLORS[key]
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      })
    })
  }, [history])

  if (!history || history.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 14 }}>
        📊 Score history graph tab dikhega jab 2+ audits honge
      </div>
    )
  }

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: '1rem' }}>📈 Score History</div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(COLORS).map(([key, color]) => (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </span>
        ))}
      </div>
      <canvas ref={canvasRef} width={820} height={220}
        style={{ width: '100%', height: 'auto', borderRadius: 8, border: '1px solid var(--border)' }} />
    </div>
  )
}
