import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, ArrowUpRight, Sun, Moon, Clock } from 'lucide-react'
import Cursor from '@/components/ui/Cursor'
import { LOGO_URL, SITE_NAME } from '@/lib/constants'
import { BLOG_POSTS, formatPostDate } from '@/lib/blog'
import { usePageTransition } from '@/hooks/usePageTransition'
import { useTheme } from '@/contexts/ThemeContext'

gsap.registerPlugin(ScrollTrigger)

export default function Blog() {
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
      gsap.fromTo('.blog-card', { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.blog-list', start: 'top 85%' } })
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
            JOURNAL
          </span>
        </div>
        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme" style={{ color: textPrimary }}>
          {isDark ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
        </button>
      </nav>

      <main style={{ background: bg, color: textPrimary, paddingTop: 56, minHeight: '100vh',
        transition: 'background 0.45s ease, color 0.45s ease' }}>

        {/* Hero */}
        <section style={{ padding: 'clamp(5rem,10vw,9rem) clamp(1.25rem,2.5vw,2.5rem) clamp(3rem,5vw,5rem)',
          borderBottom: `1px solid ${cardBdr}` }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em',
            color: textFaint, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            {SITE_NAME} — Writing & Engineering Notes
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem,10vw,9rem)',
            lineHeight: 0.88, color: textPrimary, marginBottom: '1.5rem' }}>
            JOURNAL
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: textMuted, maxWidth: 560 }}>
            Long-form write-ups on the systems I build — architecture decisions, the
            bugs that taught me something, and the war stories worth keeping.
          </p>
        </section>

        {/* Post list */}
        <section className="blog-list" style={{ padding: 'clamp(3rem,5vw,5rem) clamp(1.25rem,2.5vw,2.5rem)',
          display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto', width: '100%' }}>
          {BLOG_POSTS.map(post => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="blog-card"
              onClick={e => { e.preventDefault(); go(`/blog/${post.slug}`) }}
              style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 0,
                textDecoration: 'none', background: cardBg, border: `1px solid ${cardBdr}`,
                borderRadius: 16, overflow: 'hidden', transition: 'border-color .25s, transform .25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--volt)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = cardBdr; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)',
                gap: 0 }} className="blog-card-grid">
                <div style={{ padding: 'clamp(1.5rem,3vw,2.4rem)', minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {post.tags.map(t => (
                      <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em',
                        padding: '4px 11px', border: `1px solid ${cardBdr}`, borderRadius: 100, color: textMuted }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem,3.4vw,2.6rem)',
                    letterSpacing: '.01em', lineHeight: 1.04, color: textPrimary, marginBottom: 14 }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: 14, lineHeight: 1.72, color: textMuted, marginBottom: 20,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', color: textFaint }}>
                      {formatPostDate(post.date)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', color: textFaint }}>
                      <Clock size={12} strokeWidth={1.5} /> {post.readMins} min read
                    </span>
                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em', color: textPrimary }}>
                      Read <ArrowUpRight size={13} strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
                <div className="blog-card-cover" style={{ position: 'relative', minHeight: 200,
                  background: `url(${post.cover}) center/cover no-repeat` }}>
                  <div style={{ position: 'absolute', inset: 0,
                    background: isDark
                      ? 'linear-gradient(90deg,rgba(8,8,8,0.55),transparent 40%)'
                      : 'linear-gradient(90deg,rgba(245,240,232,0.45),transparent 40%)' }} />
                </div>
              </div>
            </a>
          ))}
        </section>
      </main>
    </>
  )
}
