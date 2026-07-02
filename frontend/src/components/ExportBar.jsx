import jsPDF from 'jspdf'

export default function ExportBar({ data, isPaid }) {
  function exportPDF() {
    const doc = new jsPDF()
    let y = 20
    const line = (txt, size=11, bold=false, color=[0,0,0]) => {
      if (y > 275) { doc.addPage(); y = 20; addFooterIfFree() }
      doc.setFontSize(size); doc.setFont('helvetica', bold?'bold':'normal'); doc.setTextColor(...color)
      const lines = doc.splitTextToSize(txt, 170)
      doc.text(lines, 20, y); y += lines.length*(size*0.45)+2
    }
    // Free plan: har page pe branding footer — ye "white-label" ko Pro/Agency ka
    // real selling point banata hai. Paid users ka report clean/unbranded rehta hai.
    function addFooterIfFree() {
      if (isPaid) return
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(9); doc.setFont('helvetica', 'italic'); doc.setTextColor(150,150,150)
      doc.text('Generated with IA Audit Pro (Free) — upgrade for white-label reports', 20, pageHeight - 10)
    }
    line('IA Audit Pro — Report', 18, true)
    line(`URL: ${data.url}`); line(`Date: ${new Date().toLocaleDateString()}`)
    y+=4; line('Scores', 13, true)
    line(`SEO: ${data.scores.seo}/100 | Performance: ${data.scores.performance}/100 | Security: ${data.scores.security}/100 | Bugs: ${data.scores.bugs}/100`)
    y+=4; line('Summary', 13, true); line(data.summary); y+=4
    ;['seo','performance','security','bugs'].forEach(cat => {
      line(cat.toUpperCase(), 13, true)
      ;(data[cat]||[]).forEach(item => {
        line(`[${item.type.toUpperCase()}] ${item.title}`, 11, true)
        line(item.desc); line(`Fix: ${item.fix}`, 10, false, [80,80,180]); y+=2
      }); y+=3
    })
    addFooterIfFree()
    doc.save(isPaid ? `audit-report.pdf` : `audit-report-free.pdf`)
  }
  function exportJSON() {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}))
    a.download='audit.json'; a.click()
  }
  function exportCSV() {
    let csv='Category,Type,Title,Description,Fix\n'
    ;['seo','performance','security','bugs'].forEach(cat=>{
      ;(data[cat]||[]).forEach(i=>{csv+=`"${cat}","${i.type}","${i.title.replace(/"/g,'""')}","${i.desc.replace(/"/g,'""')}","${i.fix.replace(/"/g,'""')}"\n`})
    })
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='audit.csv'; a.click()
  }
  function copyReport() {
    const s=data.scores
    let txt=`IA AUDIT REPORT\nURL: ${data.url}\n\nSCORES:\nSEO: ${s.seo}/100 | Perf: ${s.performance}/100 | Sec: ${s.security}/100 | Bugs: ${s.bugs}/100\n\nSUMMARY:\n${data.summary}\n`
    ;['seo','performance','security','bugs'].forEach(cat=>{
      txt+=`\n${cat.toUpperCase()}:\n`
      ;(data[cat]||[]).forEach(i=>{txt+=`[${i.type.toUpperCase()}] ${i.title}\n${i.desc}\nFix: ${i.fix}\n\n`})
    })
    navigator.clipboard.writeText(txt).then(()=>alert('Copied!'))
  }
  return (
    <div className="export-bar">
      <button className="btn" onClick={exportPDF}>📄 PDF</button>
      <button className="btn" onClick={exportJSON}>⬇️ JSON</button>
      <button className="btn" onClick={exportCSV}>📊 CSV</button>
      <button className="btn" onClick={copyReport}>📋 Copy</button>
    </div>
  )
}
