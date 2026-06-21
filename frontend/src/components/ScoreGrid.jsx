function scoreClass(v) { return v >= 80 ? 'great' : v >= 50 ? 'ok' : 'bad' }
export default function ScoreGrid({ scores }) {
  return (
    <div className="score-grid">
      {[['SEO', scores.seo],['Performance', scores.performance],['Security', scores.security],['Bugs', scores.bugs]].map(([label, val]) => (
        <div key={label} className="score-card">
          <div className="score-label">{label}</div>
          <div className={`score-num ${scoreClass(val)}`}>{val}</div>
          <div className="score-sub">/100</div>
        </div>
      ))}
    </div>
  )
}
