 import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#ffffff', color: '#1a1a2e', fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: '100vh' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Space Grotesk', sans-serif; }
        .btn-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(83,74,183,0.35) !important; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(83,74,183,0.12) !important; border-color: #534AB7 !important; }
        .faq-item { border-bottom: 1px solid #ebebf5; padding: 1.4rem 0; }
        .faq-item h3 { font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
        .faq-item p { font-size: 14px; color: #6b6b8a; line-height: 1.7; }
        @media (max-width: 768px) {
          .hero-title { font-size: 38px !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: repeat(2,1fr) !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 2.5rem', borderBottom: '1px solid #f0f0f8', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: '#534AB7', letterSpacing: '-0.5px' }}>IA<span style={{ color: '#1a1a2e' }}>Audit</span><span style={{ color: '#534AB7' }}>Pro</span></div>
        <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#features" style={{ color: '#6b6b8a', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ color: '#6b6b8a', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Pricing</a>
          <a href="#faq" style={{ color: '#6b6b8a', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>FAQ</a>
          <button onClick={() => navigate('/auth')} style={{ background: 'none', border: '1.5px solid #534AB7', color: '#534AB7', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Login</button>
          <button onClick={() => navigate('/auth')} className="btn-hover" style={{ background: '#534AB7', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(83,74,183,0.25)', transition: 'all 0.2s' }}>Get Started Free</button>
        </div>
      </nav>

      <section style={{ textAlign: 'center', padding: '6rem 2rem 5rem', maxWidth: 860, margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '70%', height: '60%', background: 'radial-gradient(ellipse, rgba(83,74,183,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEEDFE', border: '1px solid #c5c2f5', color: '#534AB7', padding: '6px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: '1.75rem', letterSpacing: 1 }}>
          <span style={{ width: 7, height: 7, background: '#534AB7', borderRadius: '50%', display: 'inline-block' }} />
          AI-POWERED WEBSITE AUDITOR
        </div>
        <h1 className="hero-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: 58, fontWeight: 800, lineHeight: 1.08, marginBottom: '1.5rem', letterSpacing: '-1.5px', color: '#1a1a2e' }}>
          Audit Your Website<br />Like a <span style={{ color: '#534AB7' }}>Pro</span>
        </h1>
        <p style={{ fontSize: 17, color: '#6b6b8a', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem', fontWeight: 400 }}>
          Get instant AI-powered analysis of your website SEO, Performance, Security and Bugs. Fix issues faster and outrank your competitors.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/auth')} className="btn-hover" style={{ background: '#534AB7', color: '#fff', border: 'none', padding: '15px 36px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(83,74,183,0.3)', transition: 'all 0.25s' }}>Start Free Audit</button>
          <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} style={{ background: '#fff', color: '#1a1a2e', border: '1.5px solid #e2e2ef', padding: '15px 36px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>See How It Works</button>
        </div>
        <p style={{ color: '#b0b0c8', fontSize: 13, marginTop: '1.25rem', fontWeight: 400 }}>No credit card required · 3 free audits/month</p>
      </section>

      <section style={{ borderTop: '1px solid #f0f0f8', borderBottom: '1px solid #f0f0f8', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: 860, margin: '0 auto', textAlign: 'center' }} className="grid-4">
        {[['500+', 'Websites Audited'], ['98/100', 'PageSpeed Score'], ['50+', 'Audit Factors'], ['Free', 'To Start']].map(([num, label]) => (
          <div key={label} style={{ padding: '0.5rem' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: '#534AB7' }}>{num}</div>
            <div style={{ fontSize: 12, color: '#6b6b8a', marginTop: 5, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </section>

      <section id="features" style={{ padding: '6rem 2rem', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#EEEDFE', color: '#534AB7', padding: '4px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: '1rem', textTransform: 'uppercase' }}>Features</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", textAlign: 'left', fontSize: 38, fontWeight: 800, marginBottom: '0.6rem', letterSpacing: '-0.5px', color: '#1a1a2e' }}>Everything You Need</h2>
        <p style={{ textAlign: 'left', color: '#6b6b8a', marginBottom: '3rem', fontSize: 16, maxWidth: 460 }}>One tool to audit, analyze and fix your entire website</p>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {[
            { icon: 'S', title: 'SEO Analysis', desc: 'Meta tags, headings, keywords, sitemap and 20+ SEO factors checked instantly.' },
            { icon: 'P', title: 'Performance Audit', desc: 'Page speed, Core Web Vitals, image optimization and load time analysis.' },
            { icon: 'L', title: 'Security Check', desc: 'HTTPS, security headers, vulnerabilities and SSL certificate detection.' },
            { icon: 'B', title: 'Bug Detection', desc: 'JavaScript errors, broken links, console errors and code quality issues.' },
            { icon: 'C', title: 'Competitor Analysis', desc: 'Compare your site against any competitor side by side with detailed scores.' },
            { icon: 'E', title: 'Export Reports', desc: 'Download professional PDF reports, CSV data or JSON for your clients.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card-hover" style={{ background: '#fff', border: '1.5px solid #f0f0f8', borderRadius: 14, padding: '1.75rem', transition: 'all 0.25s', cursor: 'default' }}>
              <div style={{ width: 44, height: 44, background: '#EEEDFE', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#534AB7', marginBottom: '1.1rem' }}>{icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#1a1a2e' }}>{title}</h3>
              <p style={{ fontSize: 13.5, color: '#6b6b8a', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', background: '#fafaff', borderTop: '1px solid #f0f0f8', borderBottom: '1px solid #f0f0f8' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#EEEDFE', color: '#534AB7', padding: '4px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: '1rem', textTransform: 'uppercase' }}>Process</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, marginBottom: '0.6rem', letterSpacing: '-0.5px', color: '#1a1a2e' }}>How It Works</h2>
          <p style={{ color: '#6b6b8a', marginBottom: '3.5rem', fontSize: 16 }}>Get your full website audit in under 60 seconds</p>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { step: '01', title: 'Enter URL', desc: 'Paste your website URL into the audit tool' },
              { step: '02', title: 'AI Analyzes', desc: 'Our AI scans 50+ factors across SEO, performance, security and bugs' },
              { step: '03', title: 'Get Results', desc: 'Receive a detailed report with actionable fix recommendations' },
            ].map(({ step, title, desc }) => (
              <div key={step}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 52, fontWeight: 800, color: '#534AB7', opacity: 0.15, marginBottom: 10, lineHeight: 1 }}>{step}</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1a1a2e' }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#6b6b8a', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: '6rem 2rem', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#EEEDFE', color: '#534AB7', padding: '4px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: '1rem', textTransform: 'uppercase' }}>Pricing</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", textAlign: 'left', fontSize: 38, fontWeight: 800, marginBottom: '0.6rem', letterSpacing: '-0.5px', color: '#1a1a2e' }}>Simple Pricing</h2>
        <p style={{ textAlign: 'left', color: '#6b6b8a', marginBottom: '3rem', fontSize: 16 }}>Start free, upgrade when you need more</p>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {[
            { name: 'Free', price: '$0', plan: 'free', features: ['3 audits/month', 'SEO Analysis', 'Performance Check', 'PDF Export'], cta: 'Get Started Free', popular: false },
            { name: 'Pro', price: '$19', plan: 'pro', features: ['Unlimited audits', 'AI Chat Assistant', 'Competitor Analysis', 'White-label PDF', 'Email Reports', 'Priority Support'], cta: 'Start Pro', popular: true },
            { name: 'Agency', price: '$49', plan: 'agency', features: ['Everything in Pro', 'Multiple team members', 'Advanced Reports', 'Priority Support'], cta: 'Start Agency', popular: false },
          ].map(({ name, price, plan, features, cta, popular }) => (
            <div key={name} style={{ background: popular ? '#534AB7' : '#fff', border: popular ? 'none' : '1.5px solid #f0f0f8', borderRadius: 16, padding: '2rem', position: 'relative', boxShadow: popular ? '0 20px 50px rgba(83,74,183,0.25)' : 'none' }}>
              {popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', color: '#fff', padding: '4px 18px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8, color: popular ? '#fff' : '#1a1a2e' }}>{name}</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 42, fontWeight: 800, color: popular ? '#fff' : '#534AB7' }}>{price}</span>
                <span style={{ fontSize: 14, color: popular ? 'rgba(255,255,255,0.6)' : '#6b6b8a' }}>/month</span>
              </div>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 11, alignItems: 'center' }}>
                  <span style={{ width: 18, height: 18, background: popular ? 'rgba(255,255,255,0.2)' : '#EEEDFE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: popular ? '#fff' : '#534AB7', flexShrink: 0, fontWeight: 700 }}>v</span>
                  <span style={{ fontSize: 13.5, color: popular ? 'rgba(255,255,255,0.85)' : '#6b6b8a' }}>{f}</span>
                </div>
              ))}
              <button
                onClick={() => { localStorage.setItem('selectedPlan', plan); navigate('/auth') }}
                className="btn-hover"
                style={{ width: '100%', marginTop: '1.75rem', padding: '13px', background: popular ? '#fff' : '#534AB7', color: popular ? '#534AB7' : '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s' }}>
                {cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', background: '#fafaff', borderTop: '1px solid #f0f0f8', borderBottom: '1px solid #f0f0f8' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: '#EEEDFE', color: '#534AB7', padding: '4px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: '1rem', textTransform: 'uppercase' }}>Reviews</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, marginBottom: '3rem', letterSpacing: '-0.5px', color: '#1a1a2e' }}>What Users Say</h2>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {[
              { name: 'Sarah M.', role: 'Freelance Developer', text: 'IA Audit Pro saved me hours of manual SEO checking. My clients love the professional PDF reports!' },
              { name: 'Ahmed K.', role: 'Digital Agency Owner', text: 'The competitor analysis feature is incredible. I can show clients exactly how they compare to their rivals.' },
              { name: 'Lisa T.', role: 'E-commerce Manager', text: 'Found 12 critical security issues I had no idea about. Fixed them all within a day. Highly recommended!' },
            ].map(({ name, role, text }) => (
              <div key={name} className="card-hover" style={{ background: '#fff', border: '1.5px solid #f0f0f8', borderRadius: 14, padding: '1.75rem', transition: 'all 0.25s' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#534AB7', fontSize: 14 }}>*</span>)}
                </div>
                <p style={{ fontSize: 14, color: '#6b6b8a', lineHeight: 1.8, marginBottom: '1.25rem' }}>"{text}"</p>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{name}</div>
                <div style={{ fontSize: 12, color: '#b0b0c8', marginTop: 3 }}>{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" style={{ padding: '6rem 2rem', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#EEEDFE', color: '#534AB7', padding: '4px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: '1rem', textTransform: 'uppercase' }}>FAQ</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, marginBottom: '2.5rem', letterSpacing: '-0.5px', color: '#1a1a2e' }}>Questions?</h2>
        {[
          { q: 'Is it really free to start?', a: 'Yes! You get 3 free audits every month with no credit card required. Upgrade anytime for unlimited audits.' },
          { q: 'How accurate is the AI analysis?', a: 'Our AI analyzes 50+ factors. Results are highly accurate and updated regularly.' },
          { q: 'Can I export the reports?', a: 'Yes! Export as PDF, CSV or JSON. White-label PDF available on Pro and Agency plans.' },
          { q: 'What is competitor analysis?', a: 'Compare your website against any competitor side by side with scores, strengths and recommendations.' },
          { q: 'Can I cancel anytime?', a: 'Absolutely. No contracts, no hidden fees. Cancel anytime from your dashboard.' },
        ].map(({ q, a }) => (
          <div key={q} className="faq-item">
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </section>

      <section style={{ padding: '6rem 2rem', textAlign: 'center', background: '#534AB7', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '200%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 44, fontWeight: 800, marginBottom: '1rem', color: '#fff', letterSpacing: '-1px' }}>Ready to Audit Your Website?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: '2.5rem' }}>Join hundreds of developers and agencies using IA Audit Pro</p>
        <button onClick={() => navigate('/auth')} style={{ background: '#fff', color: '#534AB7', border: 'none', padding: '16px 44px', borderRadius: 10, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', transition: 'all 0.25s' }}>
          Start Free Today
        </button>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: '1rem' }}>No credit card required</p>
      </section>

      <footer style={{ borderTop: '1px solid #f0f0f8', padding: '2.5rem 2rem', textAlign: 'center', color: '#b0b0c8', fontSize: 13, background: '#fff' }}>
        <div style={{ fontFamily: "'Syne', sans-serif", marginBottom: 10, color: '#534AB7', fontWeight: 800, fontSize: 17 }}>IAAuditPro</div>
        <p style={{ marginBottom: 12 }}>2025 IA Audit Pro. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <a href="#" style={{ color: '#b0b0c8', textDecoration: 'none', fontSize: 13 }}>Privacy Policy</a>
          <a href="#" style={{ color: '#b0b0c8', textDecoration: 'none', fontSize: 13 }}>Terms of Service</a>
          <a href="#" style={{ color: '#b0b0c8', textDecoration: 'none', fontSize: 13 }}>Contact</a>
        </div>
      </footer>
    </div>
  )
}
          
