import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface Props { onDone: () => void }

const NEW_PORTFOLIO_URL = 'https://jeremybuilds.online'

export default function Preloader({ onDone }: Props) {
  const ref        = useRef<HTMLDivElement>(null)
  const textRef    = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const doneRef    = useRef(false)
  const [hovered, setHovered] = useState<'new' | 'old' | null>(null)

  /* Intro sequence — settles and holds. No auto-dismiss: the gate stays
     up until the visitor picks one of the two doors. */
  useEffect(() => {
    const text    = textRef.current
    const actions = actionsRef.current
    if (!text || !actions) return

    const tl = gsap.timeline()

    tl.fromTo(text,
      { opacity: 0, y: 18, letterSpacing: '0.4em' },
      { opacity: 1, y: 0, letterSpacing: '0.18em', duration: 1.1, ease: 'power3.out' }
    )
    .fromTo(actions,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.35'
    )

    return () => { tl.kill() }
  }, [])

  /* Hold the page still while the gate is up */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const enterOld = () => {
    const el = ref.current
    if (!el || doneRef.current) return

    gsap.to(el, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        if (!doneRef.current) { doneRef.current = true; onDone() }
      },
    })
  }

  const btnBase: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(0.62rem, 1.6vw, 0.75rem)',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    padding: '0.9rem 1.7rem',
    border: '1px solid transparent',
    borderRadius: 2,
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'background 0.35s ease, color 0.35s ease, border-color 0.35s ease, transform 0.35s ease',
  }

  return (
    <div ref={ref} style={{
      position: 'fixed', inset: 0, background: 'var(--color-ink)',
      zIndex: 99990, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '0.5rem', padding: '2rem',
    }}>
      {/* Logo mark */}
      <img
        src="https://res.cloudinary.com/dz6kxumoo/image/upload/f_auto,q_auto/v1778837798/Gemini_Generated_Image_alhhftalhhftalhh-removebg-preview_zpil3k.png"
        alt="Jeremy Ahamioje"
        style={{
          width: 'clamp(150px, 34vw, 232px)',
          height: 'clamp(150px, 34vw, 232px)',
          objectFit: 'contain',
          opacity: 0.9,
        }}
      />

      <div ref={textRef} style={{ opacity: 0 }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)',
          letterSpacing: '0.18em',
          color: 'rgba(245,240,232,0.55)',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          Portfolio Has Been Migrated
        </p>
      </div>

      <div ref={actionsRef} style={{
        opacity: 0,
        marginTop: '1.75rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.75rem',
      }}>
        <a
          href={NEW_PORTFOLIO_URL}
          onMouseEnter={() => setHovered('new')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background: 'var(--volt)',
            color: 'var(--color-ink)',
            borderColor: 'var(--volt)',
            transform: hovered === 'new' ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: hovered === 'new' ? '0 0 24px var(--volt-glow)' : 'none',
          }}
        >
          View New Portfolio
        </a>

        <button
          type="button"
          onClick={enterOld}
          onMouseEnter={() => setHovered('old')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background: hovered === 'old' ? 'var(--surface-hover)' : 'transparent',
            color: hovered === 'old' ? 'var(--text)' : 'var(--cta-btn-text)',
            borderColor: hovered === 'old' ? 'var(--border-mid)' : 'var(--cta-btn-bdr)',
            transform: hovered === 'old' ? 'translateY(-2px)' : 'translateY(0)',
          }}
        >
          Enter Old Portfolio
        </button>
      </div>
    </div>
  )
}
