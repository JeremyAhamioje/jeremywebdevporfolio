import { ArrowUpRight, Clock } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { BLOG_POSTS, formatPostDate } from '@/lib/blog'

/**
 * Home-page Journal teaser. Surfaces the latest post(s) and links into the
 * dedicated `/blog` area. Navigation is handled by the parent via page
 * transitions (`onOpen` / `onViewAll`).
 */
export default function Journal({
  onOpen,
  onViewAll,
}: {
  onOpen: (slug: string) => void
  onViewAll: () => void
}) {
  const { isDark } = useTheme()
  const posts = BLOG_POSTS.slice(0, 2)

  const textColor  = isDark ? 'var(--text)' : '#1a1208'
  const mutedColor = isDark ? 'var(--text-muted)' : 'rgba(26,18,8,0.55)'
  const faintColor = isDark ? 'var(--text-faint)' : 'rgba(26,18,8,0.3)'
  const cardBg     = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(26,18,8,0.04)'
  const cardBdr    = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,18,8,0.1)'
  const labelClass = isDark ? 'sec-label' : 'sec-label sec-label-dark'
  const labelColor = isDark ? undefined : 'rgba(26,18,8,0.4)'

  return (
    <section id="journal" style={{ padding: '8rem 2.5rem' }}>
      {/* Section label */}
      <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className={labelClass} style={{ marginBottom: 0, border: 'none', paddingBottom: 0, color: labelColor }}>
          06 — Journal
        </div>
        <button
          onClick={onViewAll}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: faintColor,
            cursor: 'pointer', transition: 'color .2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--volt)')}
          onMouseLeave={e => (e.currentTarget.style.color = faintColor)}
        >
          Read the journal <ArrowUpRight size={13} strokeWidth={1.5} />
        </button>
      </div>

      {/* Posts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 22,
        maxWidth: 1100 }}>
        {posts.map((post, idx) => (
          <button
            key={post.slug}
            onClick={() => onOpen(post.slug)}
            style={{ textAlign: 'left', cursor: 'pointer', background: cardBg, border: `1px solid ${cardBdr}`,
              borderRadius: 16, overflow: 'hidden', padding: 0, transition: 'border-color .25s, transform .25s',
              display: 'flex', flexDirection: 'column' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--volt)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = cardBdr; e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ height: 168, position: 'relative',
              background: `url(${post.cover}) center/cover no-repeat` }}>
              <div style={{ position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent 55%)' }} />
              <span style={{ position: 'absolute', top: 14, left: 14, fontFamily: 'var(--font-mono)',
                fontSize: 10, letterSpacing: '.1em', color: '#fff', background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: '4px 10px',
                borderRadius: 20 }}>
                {String(idx + 1).padStart(2, '0')} — Latest
              </span>
            </div>
            <div style={{ padding: '1.5rem 1.6rem 1.7rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                {post.tags.slice(0, 3).map(t => (
                  <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '.06em',
                    padding: '3px 9px', border: `1px solid ${cardBdr}`, borderRadius: 100, color: mutedColor }}>
                    {t}
                  </span>
                ))}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', letterSpacing: '.01em',
                lineHeight: 1.06, color: textColor, marginBottom: 12 }}>
                {post.title}
              </h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.68, color: mutedColor, marginBottom: 18,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.excerpt}
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.06em', color: faintColor }}>
                  {formatPostDate(post.date)}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.06em', color: faintColor }}>
                  <Clock size={11} strokeWidth={1.5} /> {post.readMins} min
                </span>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.08em', color: textColor }}>
                  Read <ArrowUpRight size={12} strokeWidth={1.5} />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
