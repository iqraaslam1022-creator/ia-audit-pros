import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', minHeight: '100vh' }}>

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 100 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#C9A84C' }}>IA Audit Pro</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="#features" style={{ color: '#999', fontSize: 14, textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ color: '#999', fontSize: 14, textDecoration: 'none' }}>Pricing</a>
          <a href="#faq" style={{ color: '#999', fontSize: 14, textDecoration: 'none' }}>FAQ</a>
          <button onClick={() => navigate('/auth')} style={{ background: 'none', border: '1px solid #C9A84C', color: '#C9A84C', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Login</button>
          <button onClick={() => navigate('/auth')} style={{ background: '#C9A84C', border: 'none', color: '#000', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Get Started Free</button>
        </div>
      </nav>

      <section style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#1a1500', border: '1px solid #C9A84C', color: '#C9A84C', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: '1.5rem', letterSpacing: 1 }}>
          AI-POWERED WEBSITE AUDITOR
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: -1 }}>
          Audit Your Website Like a <span style={{ color: '#C9A84C' }}>Pro</span>
        </h1>
        <p style={{ fontSize: 18, color: '#888', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
          Get instant AI-powered analysis of your website SEO, Performance, Security and Bugs. Fix issues faster and outrank your competitors.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/auth')} style={{ background: '#C9A84C', color: '#000', border: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>Start Free Audit</button>
          <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', color: '#fff', border: '1px solid #333', padding: '14px 32px', borderRadius: 10, fontSize: 16, cursor: 'pointer' }}>See How It Works</button>
        </div>
        <p style={{ color: '#555', fontSize: 13, marginTop: '1rem' }}>No credit card required. 3 free audits/month.</p>
      </section>

      <section style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {[['500+', 'Websites Audited'], ['98/100', 'PageSpeed Score'], ['4', 'Audit Categories'], ['Free', 'To Start']].map(([num, label]) => (
          <div key={label}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#C9A84C' }}>{num}</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </section>

      <section id="features" style={{ padding: '5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, marginBottom: '0.75rem' }}>Everything You Need</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem', fontSize: 16 }}>One tool to audit, analyze and fix your entire website</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {[
            { icon: 'S', title: 'SEO Analysis', desc: 'Meta tags, headings, keywords, sitemap and 20+ SEO factors checked instantly.' },
            { icon: 'P', title: 'Performance Audit', desc: 'Page speed, Core Web Vitals, image optimization and load time analysis.' },
            { icon: 'L', title: 'Security Check', desc: 'HTTPS, security headers, vulnerabilities and SSL certificate detection.' },
            { icon: 'B', title: 'Bug Detection', desc: 'JavaScript errors, broken links, console errors and code quality issues.' },
            { icon: 'C', title: 'Competitor Analysis', desc: 'Compare your site against any competitor side by side with detailed scores.' },
            { icon: 'E', title: 'Export Reports', desc: 'Download professional PDF reports, CSV data or JSON for your clients.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ width: 40, height: 40, background: '#1a1500', border: '1px solid #C9A84C', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontWeight: 800, marginBottom: '1rem' }}>{icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', background: '#060606', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: '0.75rem' }}>How It Works</h2>
          <p style={{ color: '#666', marginBottom: '3rem', fontSize: 16 }}>Get your full website audit in under 60 seconds</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { step: '01', title: 'Enter URL', desc: 'Paste your website URL into the audit tool' },
              { step: '02', title: 'AI Analyzes', desc: 'Our AI scans 50+ factors across SEO, performance, security and bugs' },
              { step: '03', title: 'Get Results', desc: 'Receive detailed report with actionable fix recommendations' },
            ].map(({ step, title, desc }) => (
              <div key={step}>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#C9A84C', opacity: 0.3, marginBottom: 8 }}>{step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: '5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, marginBottom: '0.75rem' }}>Simple Pricing</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem', fontSize: 16 }}>Start free, upgrade when you need more</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {[
            { name: 'Free', price: '$0', features: ['3 audits/month', 'SEO Analysis', 'Performance Check', 'PDF Export', 'AI Chat'], cta: 'Get Started Free', popular: false },
            { name: 'Pro', price: '$19', features: ['Unlimited audits', 'Competitor Analysis', 'White-label PDF', 'Email Reports', 'Priority Support'], cta: 'Start Pro', popular: true },
            { name: 'Agency', price: '$49', features: ['Everything in Pro', '10 Team Members', 'Multi-client Dashboard', 'API Access', 'Custom Branding'], cta: 'Start Agency', popular: false },
          ].map(({ name, price, features, cta, popular }) => (
            <div key={name} style={{ background: popular ? '#111' : '#0d0d0d', border: popular ? '1px solid #C9A84C' : '1px solid #1f1f1f', borderRadius: 16, padding: '2rem', position: 'relative' }}>
              {popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#000', padding: '2px 16px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>MOST POPULAR</div>}
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{name}</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: popular ? '#C9A84C' : '#fff' }}>{price}</span>
                <span style={{ fontSize: 14, color: '#666' }}>/month</span>
              </div>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                  <span style={{ color: '#C9A84C', fontSize: 14 }}>+</span>
                  <span style={{ fontSize: 13, color: '#aaa' }}>{f}</span>
                </div>
              ))}
              <button onClick={() => navigate('/auth')} style={{ width: '100%', marginTop: '1.5rem', padding: '12px', background: popular ? '#C9A84C' : 'transparent', color: popular ? '#000' : '#C9A84C', border: popular ? 'none' : '1px solid #C9A84C', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', background: '#060606', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, marginBottom: '3rem' }}>What Users Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {[
              { name: 'Sarah M.', role: 'Freelance Developer', text: 'IA Audit Pro saved me hours of manual SEO checking. My clients love the professional PDF reports!' },
              { name: 'Ahmed K.', role: 'Digital Agency Owner', text: 'The competitor analysis feature is incredible. I can show clients exactly how they compare to their rivals.' },
              { name: 'Lisa T.', role: 'E-commerce Manager', text: 'Found 12 critical security issues I had no idea about. Fixed them all within a day. Highly recommended!' },
            ].map(({ name, role, text }) => (
              <div key={name} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: '1.5rem' }}>
                <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7, marginBottom: '1rem' }}>"{text}"</p>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" style={{ padding: '5rem 2rem', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, marginBottom: '3rem' }}>FAQ</h2>
        {[
          { q: 'Is it really free to start?', a: 'Yes! You get 3 free audits every month with no credit card required. Upgrade anytime for unlimited audits.' },
          { q: 'How accurate is the AI analysis?', a: 'Our AI analyzes 50+ factors. Results are highly accurate and updated regularly.' },
          { q: 'Can I export the reports?', a: 'Yes! Export as PDF, CSV or JSON. White-label PDF available on Pro and Agency plans.' },
          { q: 'What is competitor analysis?', a: 'Compare your website against any competitor side by side with scores, strengths and recommendations.' },
          { q: 'Can I cancel anytime?', a: 'Absolutely. No contracts, no hidden fees. Cancel anytime from your dashboard.' },
        ].map(({ q, a }) => (
          <div key={q} style={{ borderBottom: '1px solid #1a1a1a', padding: '1.25rem 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#fff' }}>{q}</h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{a}</p>
          </div>
        ))}
      </section>

      <section style={{ padding: '5rem 2rem', textAlign: 'center', background: '#060606', borderTop: '1px solid #1a1a1a' }}>
        <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: '1rem' }}>Ready to Audit Your Website?</h2>
        <p style={{ color: '#666', fontSize: 16, marginBottom: '2rem' }}>Join hundreds of developers and agencies using IA Audit Pro</p>
        <button onClick={() => navigate('/auth')} style={{ background: '#C9A84C', color: '#000', border: 'none', padding: '16px 40px', borderRadius: 10, fontSize: 18, fontWeight: 800, cursor: 'pointer' }}>
          Start Free Today
        </button>
        <p style={{ color: '#444', fontSize: 13, marginTop: '1rem' }}>No credit card required</p>
      </section>

      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '2rem', textAlign: 'center', color: '#444', fontSize: 13 }}>
        <div style={{ marginBottom: 8, color: '#C9A84C', fontWeight: 700, fontSize: 16 }}>IA Audit Pro</div>
        <p>2025 IA Audit Pro. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>

    </div>
  )
}
          
