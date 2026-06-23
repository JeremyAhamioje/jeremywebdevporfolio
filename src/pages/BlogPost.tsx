import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowLeft, ArrowUpRight, Sun, Moon, Clock } from 'lucide-react'
import Cursor from '@/components/ui/Cursor'
import Markdown, { type MarkdownColors } from '@/components/ui/Markdown'
import { LOGO_URL, SITE_NAME } from '@/lib/constants'
import { getPost, formatPostDate } from '@/lib/blog'
import { usePageTransition } from '@/hooks/usePageTransition'
import { useTheme } from '@/contexts/ThemeContext'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPost(slug) : undefined
  const { overlayRef, go } = usePageTransition()
  const { isDark, toggle } = useTheme()

  const bg          = isDark ? '#080808' : '#f5f0e8'
  const textPrimary = isDark ? '#f5f0e8' : '#1a1208'
  const textMuted   = isDark ? 'rgba(245,240,232,0.6)'  : 'rgba(26,18,8,0.66)'
  const textFaint   = isDark ? 'rgba(245,240,232,0.28)' : 'rgba(26,18,8,0.3)'
  const cardBdr     = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,18,8,0.1)'
  const navBg       = isDark ? 'rgba(8,8,8,0.88)'       : 'rgba(240,236,227,0.9)'
  const navBdr      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,18,8,0.08)'
  const codeBg      = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(26,18,8,0.05)'

  const mdColors: MarkdownColors = {
    text: textPrimary,
    muted: textMuted,
    faint: textFaint,
    border: cardBdr,
    accent: isDark ? 'var(--volt)' : '#a86b00',
    codeBg,
    codeText: isDark ? '#e8ff9a' : '#3a2e10',
    cardBg: codeBg,
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    gsap.fromTo('body', { opacity: 0 }, { opacity: 1, duration: 0.4 })
  }, [slug])

  // Strip the leading H1 — the hero already renders the title.
  const body = post ? post.content.replace(/^\s*#\s+[^\n]*\n/, '') : ''

  return (
    <>
      <Cursor />
      <div ref={overlayRef} className="page-overlay" />

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1.25rem,2rem,2rem)', zIndex: 1000,
        background: navBg, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${navBdr}` }}>
        <button onClick={() => go('/blog')} style={{ display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 12,
          letterSpacing: '.1em', color: textMuted, cursor: 'pointer', transition: 'color .2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--volt)')}
          onMouseLeave={e => (e.currentTarget.style.color = textMuted)}>
          <ArrowLeft size={14} strokeWidth={1.5} /> Journal
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={LOGO_URL} alt={SITE_NAME}
            style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: '50%' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: textFaint }}>
            {SITE_NAME}
          </span>
        </div>
        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme" style={{ color: textPrimary }}>
          {isDark ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
        </button>
      </nav>

      <main style={{ background: bg, color: textPrimary, paddingTop: 56, minHeight: '100vh',
        transition: 'background 0.45s ease, color 0.45s ease' }}>

        {!post ? (
          <section style={{ padding: 'clamp(6rem,14vw,12rem) clamp(1.25rem,2.5vw,2.5rem)', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,7vw,5rem)', color: textPrimary, marginBottom: '1rem' }}>
              POST NOT FOUND
            </h1>
            <p style={{ fontSize: 15, color: textMuted, marginBottom: '2.5rem' }}>
              That entry doesn't exist (or moved).
            </p>
            <button onClick={() => go('/blog')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', background: 'var(--volt)', color: '#080808', border: 'none',
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '.06em',
              borderRadius: 100, cursor: 'pointer' }}>
              Back to Journal <ArrowUpRight size={14} strokeWidth={2} />
            </button>
          </section>
        ) : (
          <article>
            {/* Hero */}
            <header style={{ maxWidth: 760, margin: '0 auto', width: '100%',
              padding: 'clamp(3.5rem,7vw,6rem) clamp(1.25rem,2.5vw,2.5rem) clamp(2rem,3vw,3rem)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
                {post.tags.map(t => (
                  <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em',
                    padding: '4px 11px', border: `1px solid ${cardBdr}`, borderRadius: 100, color: textMuted }}>
                    {t}
                  </span>
                ))}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,6vw,4.4rem)',
                lineHeight: 0.98, letterSpacing: '.01em', color: textPrimary, marginBottom: 22 }}>
                {post.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.06em', color: textFaint }}>
                <span>{formatPostDate(post.date)}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={12} strokeWidth={1.5} /> {post.readMins} min read
                </span>
                <span>{SITE_NAME}</span>
              </div>
            </header>

            {/* Cover */}
            <div style={{ maxWidth: 920, margin: '0 auto', width: '100%', padding: '0 clamp(1.25rem,2.5vw,2.5rem)' }}>
              <div style={{ height: 'clamp(220px,38vw,420px)', borderRadius: 16, overflow: 'hidden',
                border: `1px solid ${cardBdr}`, background: `url(${post.cover}) center/cover no-repeat` }} />
            </div>

            {/* Body */}
            <div style={{ maxWidth: 760, margin: '0 auto', width: '100%',
              padding: 'clamp(2.5rem,5vw,4rem) clamp(1.25rem,2.5vw,2.5rem) clamp(4rem,8vw,7rem)' }}>
              <Markdown content={body} colors={mdColors} />

              {/* Footer CTA */}
              <div style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: `1px solid ${cardBdr}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <button onClick={() => go('/blog')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'none', border: `1px solid ${cardBdr}`, padding: '12px 24px', borderRadius: 100,
                  fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.06em', color: textMuted, cursor: 'pointer' }}>
                  <ArrowLeft size={13} strokeWidth={1.5} /> All posts
                </button>
                <a href="mailto:ahamiojejeremy@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 28px', background: 'var(--volt)', color: '#080808', textDecoration: 'none',
                  fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '.06em', borderRadius: 100 }}>
                  Work with me <ArrowUpRight size={14} strokeWidth={2} />
                </a>
              </div>
            </div>
          </article>
        )}
      </main>
    </>
  )
}
