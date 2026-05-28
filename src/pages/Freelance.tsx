import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, ArrowRight, Sun, Moon, Zap } from 'lucide-react'
import Cursor from '@/components/ui/Cursor'
import { LOGO_URL, SITE_NAME } from '@/lib/constants'
import { usePageTransition } from '@/hooks/usePageTransition'
import { useTheme } from '@/contexts/ThemeContext'

gsap.registerPlugin(ScrollTrigger)

const HERO_IMAGE = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=85'

const OFFERINGS = [
  {
    num: '01',
    title: 'Web Development',
    desc: 'Full-stack React applications, APIs, dashboards, and e-commerce — built to perform and scale.',
    items: ['React / Next.js', 'REST & GraphQL APIs', 'Performance optimization', 'Vercel / Netlify deploy'],
  },
  {
    num: '02',
    title: 'UI/UX Design',
    desc: 'From wireframes to pixel-perfect interfaces. Every decision is grounded in user behaviour.',
    items: ['Figma prototypes', 'Design systems', 'Mobile-first layouts', 'Accessibility (WCAG)'],
  },
  {
    num: '03',
    title: 'Motion & Animation',
    desc: 'GSAP-powered scroll experiences, micro-interactions, and animated interfaces that feel alive.',
    items: ['GSAP / ScrollTrigger', 'CSS keyframes', 'Lottie animations', 'Page transitions'],
  },
  {
    num: '04',
    title: 'Consultation',
    desc: 'Strategy sessions, codebase audits, and technical direction for teams moving fast.',
    items: ['Tech stack review', 'Architecture planning', 'Code review', 'Hourly or retainer'],
  },
]

const WHY = [
  { label: 'Direct Line', body: 'You work with me, not an account manager. No hand-offs, no translation loss.' },
  { label: 'Fast Delivery', body: 'Most projects ship in 2–4 weeks. I work with urgency without cutting corners.' },
  { label: 'Clean Code', body: 'Production-ready, maintainable TypeScript. No spaghetti, no mystery dependencies.' },
  { label: 'Flexible Terms', body: 'Project-based or monthly retainer — whatever fits your budget and workflow.' },
]

export default function FreelancePage() {
  const { overlayRef, go } = usePageTransition()
  const { isDark, toggle } = useTheme()

  const bg          = isDark ? '#080808' : '#f5f0e8'
  const textPrimary = isDark ? '#f5f0e8' : '#1a1208'
  const textMuted   = isDark ? 'rgba(245,240,232,0.45)' : 'rgba(26,18,8,0.48)'
  const textFaint   = isDark ? 'rgba(245,240,232,0.2)'  : 'rgba(26,18,8,0.22)'
  const cardBg      = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(26,18,8,0.04)'
  const cardBdr     = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,18,8,0.1)'
  const navBg       = isDark ? 'rgba(8,8,8,0.88)'       : 'rgba(240,236,227,0.9)'
  const navBdr      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,18,8,0.08)'

  useEffect(() => {
    gsap.fromTo('body', { opacity: 0 }, { opacity: 1, duration: 0.4 })
    const ctx = gsap.context(() => {
      gsap.fromTo('.fl-card', { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.fl-grid', start: 'top 78%' } })
      gsap.fromTo('.why-row', { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.why-section', start: 'top 80%' } })
    })
    return () => ctx.revert()
  }, [])

  return (
    <>
      <Cursor />
      <div ref={overlayRef} className="page-overlay" />

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1.25rem,2rem,2rem)', zIndex: 1000,
        background: navBg, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${navBdr}` }}>
        <button onClick={() => go('/')} style={{ display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 12,
          letterSpacing: '.1em', color: textMuted, cursor: 'pointer', transition: 'color .2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--volt)')}
          onMouseLeave={e => (e.currentTarget.style.color = textMuted)}>
          <ArrowLeft size={14} strokeWidth={1.5} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={LOGO_URL} alt={SITE_NAME}
            style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: '50%' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: textFaint }}>
            FREELANCE
          </span>
        </div>
        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme" style={{ color: textPrimary }}>
          {isDark ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
        </button>
      </nav>

      <main style={{ background: bg, color: textPrimary, paddingTop: 56, minHeight: '100vh',
        transition: 'background 0.45s ease, color 0.45s ease' }}>

        {/* Hero */}
        <section style={{ position: 'relative', padding: 'clamp(6rem,12vw,12rem) clamp(1.25rem,2.5vw,2.5rem) clamp(4rem,6vw,7rem)',
          borderBottom: `1px solid ${cardBdr}`, overflow: 'hidden', isolation: 'isolate' }}>
          <img src={HERO_IMAGE} alt="" aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1,
            background: isDark
              ? 'linear-gradient(135deg,rgba(8,8,8,0.82) 0%,rgba(8,8,8,0.42) 50%,rgba(8,8,8,0.76) 100%)'
              : 'linear-gradient(135deg,rgba(240,236,227,0.86) 0%,rgba(240,236,227,0.44) 50%,rgba(240,236,227,0.8) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em',
              color: textFaint, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              {SITE_NAME} — Available for Hire
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem,10vw,9rem)',
              lineHeight: 0.88, color: textPrimary, maxWidth: 900, marginBottom: '2rem' }}>
              FREELANCE
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: textMuted, maxWidth: 520, marginBottom: '2.5rem' }}>
              Independent work done right. No agency overhead, no briefs lost in translation —
              just focused, high-quality output shipped on time.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="mailto:ahamiojejeremy@gmail.com" style={{ display: 'inline-flex', alignItems: 'center',
                gap: 8, padding: '12px 28px', background: 'var(--volt)', color: '#080808',
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '.06em',
                borderRadius: 100, textDecoration: 'none' }}>
                Hire Me <ArrowRight size={14} strokeWidth={2} />
              </a>
              <button onClick={() => go('/services')} style={{ display: 'inline-flex', alignItems: 'center',
                gap: 8, padding: '12px 24px', background: 'transparent', border: `1px solid ${cardBdr}`,
                color: textMuted, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.06em',
                borderRadius: 100, cursor: 'pointer' }}>
                View Services
              </button>
            </div>
          </div>
        </section>

        {/* Offerings */}
        <section style={{ padding: 'clamp(4rem,6vw,7rem) clamp(1.25rem,2.5vw,2.5rem)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,3rem)',
            letterSpacing: '.04em', color: textPrimary, marginBottom: '3rem' }}>
            What I Do
          </h2>
          <div className="fl-grid" style={{ display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {OFFERINGS.map(o => (
              <div key={o.num} className="fl-card" style={{ background: cardBg, border: `1px solid ${cardBdr}`,
                borderRadius: 14, padding: '28px 26px', transition: 'border-color .25s, transform .25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--volt)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cardBdr; e.currentTarget.style.transform = 'none' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em',
                  color: textFaint, marginBottom: 14 }}>{o.num}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', letterSpacing: '.04em',
                  color: textPrimary, marginBottom: 10 }}>{o.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: textMuted, marginBottom: 18 }}>{o.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {o.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8,
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', color: textMuted }}>
                      <Zap size={11} strokeWidth={1.5} color="var(--volt)" style={{ flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Why work with me */}
        <section className="why-section" style={{ padding: 'clamp(4rem,6vw,7rem) clamp(1.25rem,2.5vw,2.5rem)',
          borderTop: `1px solid ${cardBdr}` }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,3rem)',
            letterSpacing: '.04em', color: textPrimary, marginBottom: '3.5rem' }}>
            Why Freelance With Me
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {WHY.map((w, i) => (
              <div key={w.label} className="why-row" style={{ display: 'grid',
                gridTemplateColumns: '180px 1fr', gap: '2rem',
                padding: '1.8rem 0', borderBottom: `1px solid ${cardBdr}`, alignItems: 'start' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem',
                  letterSpacing: '.04em', color: textPrimary }}>
                  {String(i + 1).padStart(2, '0')}. {w.label}
                </span>
                <p style={{ fontSize: 14, lineHeight: 1.78, color: textMuted }}>{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'clamp(4rem,8vw,9rem) clamp(1.25rem,2.5vw,2.5rem)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em',
            color: textFaint, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Let's get to work
          </p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 'clamp(2rem,5vw,4rem)', color: textPrimary, marginBottom: '2.5rem', lineHeight: 1.2 }}>
            Got a project in mind?<br />Let's make it real.
          </h2>
          <a href="mailto:ahamiojejeremy@gmail.com" style={{ display: 'inline-flex', alignItems: 'center',
            gap: 10, padding: '16px 40px', background: 'var(--volt)', color: '#080808',
            fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, letterSpacing: '.08em',
            borderRadius: 100, textDecoration: 'none', transition: 'transform .22s, box-shadow .22s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 40px var(--volt-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}>
            Get In Touch <ArrowRight size={16} strokeWidth={2} />
          </a>
        </section>
      </main>
    </>
  )
}
