const BADGE = { critical:'badge-critical', warning:'badge-warning', info:'badge-info', pass:'badge-pass' }
export default function IssueList({ items = [] }) {
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
        </div>
      ))}
    </div>
  )
}
