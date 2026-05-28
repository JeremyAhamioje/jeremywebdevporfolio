import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, ArrowRight, Sun, Moon } from 'lucide-react'
import Cursor from '@/components/ui/Cursor'
import { LOGO_URL, SITE_NAME } from '@/lib/constants'
import { usePageTransition } from '@/hooks/usePageTransition'
import { useTheme } from '@/contexts/ThemeContext'

gsap.registerPlugin(ScrollTrigger)

const HERO_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=85'

const SERVICES = [
  { num: '01', title: 'Scroll Experiences', desc: 'GSAP ScrollTrigger animations that unfold as the user scrolls — parallax, pin, reveal, and morph.' },
  { num: '02', title: 'UI Micro-interactions', desc: 'Hover effects, state transitions, and feedback animations that make an interface feel responsive and alive.' },
  { num: '03', title: 'Page Transitions', desc: 'Full-page cinematic enters and exits that reinforce brand and create continuity across routes.' },
  { num: '04', title: 'Lottie / SVG Animation', desc: 'Lightweight vector animations exported from After Effects — perfect for loaders, icons, and illustrations.' },
  { num: '05', title: 'Video Editing', desc: 'Reels, demos, and product walkthroughs cut and graded for web delivery.' },
  { num: '06', title: 'After Effects', desc: 'Title sequences, motion graphics overlays, and export pipelines for any format.' },
]

const PROCESS = [
  { num: '01', phase: 'Storyboard', desc: 'We map every keyframe before production. Timing, easing, and intent defined up front.' },
  { num: '02', phase: 'Prototype', desc: 'A scrappy working version fast — so you can feel the motion, not just imagine it.' },
  { num: '03', phase: 'Refine', desc: 'Ease curves dialled, duration tuned, performance profiled. Motion that ships at 60fps.' },
  { num: '04', phase: 'Deliver', desc: 'Code, Lottie JSON, or video — in whatever format your pipeline needs.' },
]

export default function MotionDesignPage() {
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
      gsap.fromTo('.md-svc', { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: '.md-svc-grid', start: 'top 78%' } })
      gsap.fromTo('.md-process-row', { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.md-process', start: 'top 80%' } })
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
            MOTION DESIGN
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
              ? 'linear-gradient(135deg,rgba(8,8,8,0.85) 0%,rgba(8,8,8,0.45) 50%,rgba(8,8,8,0.8) 100%)'
              : 'linear-gradient(135deg,rgba(240,236,227,0.88) 0%,rgba(240,236,227,0.5) 50%,rgba(240,236,227,0.84) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em',
              color: textFaint, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              {SITE_NAME} — Things That Move
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,8vw,7.5rem)',
              lineHeight: 0.88, color: textPrimary, maxWidth: 900, marginBottom: '2rem' }}>
              MOTION<br />DESIGN
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: textMuted, maxWidth: 520, marginBottom: '2.5rem' }}>
              Motion is the voice of an interface. The way something moves tells you whether to trust it —
              whether to stay. Every animation I build earns its place on screen.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="mailto:ahamiojejeremy@gmail.com" style={{ display: 'inline-flex', alignItems: 'center',
                gap: 8, padding: '12px 28px', background: 'var(--volt)', color: '#080808',
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '.06em',
                borderRadius: 100, textDecoration: 'none' }}>
                Commission Work <ArrowRight size={14} strokeWidth={2} />
              </a>
              <button onClick={() => go('/projects')} style={{ display: 'inline-flex', alignItems: 'center',
                gap: 8, padding: '12px 24px', background: 'transparent', border: `1px solid ${cardBdr}`,
                color: textMuted, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.06em',
                borderRadius: 100, cursor: 'pointer' }}>
                See My Work
              </button>
            </div>
          </div>
        </section>

        {/* Services */}
        <section style={{ padding: 'clamp(4rem,6vw,7rem) clamp(1.25rem,2.5vw,2.5rem)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,3rem)',
            letterSpacing: '.04em', color: textPrimary, marginBottom: '3rem' }}>
            What I Animate
          </h2>
          <div className="md-svc-grid" style={{ display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {SERVICES.map(s => (
              <div key={s.num} className="md-svc" style={{ background: cardBg, border: `1px solid ${cardBdr}`,
                borderRadius: 14, padding: '26px 24px', transition: 'border-color .25s, transform .25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--volt)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cardBdr; e.currentTarget.style.transform = 'none' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em',
                  color: 'var(--volt)', marginBottom: 12 }}>{s.num}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', letterSpacing: '.04em',
                  color: textPrimary, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: textMuted }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="md-process" style={{ padding: 'clamp(4rem,6vw,7rem) clamp(1.25rem,2.5vw,2.5rem)',
          borderTop: `1px solid ${cardBdr}` }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,3rem)',
            letterSpacing: '.04em', color: textPrimary, marginBottom: '3.5rem' }}>
            The Process
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PROCESS.map(p => (
              <div key={p.num} className="md-process-row" style={{ display: 'grid',
                gridTemplateColumns: '64px 160px 1fr', gap: '2rem', padding: '2rem 0',
                borderBottom: `1px solid ${cardBdr}`, alignItems: 'start' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: textFaint, lineHeight: 1 }}>
                  {p.num}
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '.04em',
                  color: textPrimary, paddingTop: 4 }}>{p.phase}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.78, color: textMuted, paddingTop: 4 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'clamp(4rem,8vw,9rem) clamp(1.25rem,2.5vw,2.5rem)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em',
            color: textFaint, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Let's move something
          </p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 'clamp(2rem,5vw,4rem)', color: textPrimary, marginBottom: '2.5rem', lineHeight: 1.2 }}>
            Static is forgettable.<br />Let's make it move.
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

      <style>{`
        @media (max-width: 640px) {
          .md-process-row { grid-template-columns: 40px 1fr !important; }
          .md-process-row > h3 { grid-column: 2; }
          .md-process-row > p { grid-column: 2; }
        }
      `}</style>
    </>
  )
}
