import { Fragment, type ReactNode } from 'react'

/**
 * Tiny dependency-free Markdown renderer.
 *
 * Supports exactly the constructs this site's blog uses: ATX headings,
 * paragraphs, horizontal rules, fenced code blocks, GFM tables, ordered /
 * unordered lists (with soft-wrapped continuation lines), and inline
 * `code` / **bold** / *italic* / [links](url). It is intentionally NOT a
 * full CommonMark implementation — just enough, styled to match the theme.
 */

export interface MarkdownColors {
  text:    string
  muted:   string
  faint:   string
  border:  string
  accent:  string
  codeBg:  string
  codeText:string
  cardBg:  string
}

/* ── Inline: `code`, **bold**, *italic*, [text](url) ── */
const INLINE_RE = /(`[^`]+`)|(\*\*[^*]+?\*\*)|(\*[^*]+?\*)|(\[[^\]]+\]\([^)]+\))/

function renderInline(text: string, c: MarkdownColors, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let rest = text
  let i = 0

  while (rest.length) {
    const m = INLINE_RE.exec(rest)
    if (!m) { nodes.push(rest); break }

    if (m.index > 0) nodes.push(rest.slice(0, m.index))
    const token = m[0]
    const key = `${keyBase}-${i++}`

    if (token.startsWith('`')) {
      nodes.push(
        <code key={key} style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.86em',
          background: c.codeBg, color: c.codeText,
          padding: '2px 6px', borderRadius: 5, whiteSpace: 'nowrap',
        }}>
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('**')) {
      nodes.push(
        <strong key={key} style={{ color: c.text, fontWeight: 700 }}>
          {renderInline(token.slice(2, -2), c, key)}
        </strong>
      )
    } else if (token.startsWith('*')) {
      nodes.push(
        <em key={key} style={{ fontStyle: 'italic' }}>
          {renderInline(token.slice(1, -1), c, key)}
        </em>
      )
    } else {
      // [text](url)
      const lm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
      if (lm) {
        nodes.push(
          <a key={key} href={lm[2]} target="_blank" rel="noopener noreferrer"
            style={{ color: c.accent, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {lm[1]}
          </a>
        )
      } else {
        nodes.push(token)
      }
    }
    rest = rest.slice(m.index + token.length)
  }

  return nodes
}

/* ── Block-level parse ── */
const isBlank   = (l: string) => l.trim() === ''
const isHr      = (l: string) => /^-{3,}\s*$/.test(l.trim())
const isHeading = (l: string) => /^#{1,6}\s/.test(l)
const isUl      = (l: string) => /^\s*-\s+/.test(l)
const isOl      = (l: string) => /^\s*\d+\.\s+/.test(l)
const isTableSep = (l: string) => /^\s*\|?[\s:|-]*-[\s:|-]*$/.test(l) && l.includes('-')

function splitRow(row: string): string[] {
  let r = row.trim()
  if (r.startsWith('|')) r = r.slice(1)
  if (r.endsWith('|')) r = r.slice(0, -1)
  return r.split('|').map(s => s.trim())
}

export default function Markdown({ content, colors }: { content: string; colors: MarkdownColors }) {
  const c = colors
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let k = 0
  const nextKey = () => `b${k++}`

  while (i < lines.length) {
    const line = lines[i]

    // blank
    if (isBlank(line)) { i++; continue }

    // fenced code
    const fence = /^```(\w*)\s*$/.exec(line.trim())
    if (fence) {
      const body: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) { body.push(lines[i]); i++ }
      i++ // skip closing fence
      blocks.push(
        <pre key={nextKey()} style={{
          background: c.codeBg, border: `1px solid ${c.border}`, borderRadius: 10,
          padding: '16px 18px', overflowX: 'auto', margin: '1.6rem 0',
        }}>
          <code style={{
            fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.65,
            color: c.codeText, whiteSpace: 'pre',
          }}>
            {body.join('\n')}
          </code>
        </pre>
      )
      continue
    }

    // horizontal rule
    if (isHr(line)) {
      blocks.push(<hr key={nextKey()} style={{ border: 'none', borderTop: `1px solid ${c.border}`, margin: '2.6rem 0' }} />)
      i++
      continue
    }

    // heading
    const hm = /^(#{1,6})\s+(.*)$/.exec(line)
    if (hm) {
      const level = hm[1].length
      const txt = hm[2].trim()
      const isMajor = level <= 2
      blocks.push(
        isMajor ? (
          <h2 key={nextKey()} style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem,3.4vw,2.6rem)',
            letterSpacing: '.02em', color: c.text, lineHeight: 1.08,
            margin: '3.2rem 0 1.1rem',
          }}>
            {renderInline(txt, c, nextKey())}
          </h2>
        ) : (
          <h3 key={nextKey()} style={{
            fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '.04em',
            color: c.accent, textTransform: 'uppercase',
            margin: '2.4rem 0 0.9rem',
          }}>
            {renderInline(txt, c, nextKey())}
          </h3>
        )
      )
      i++
      continue
    }

    // table
    if (line.trim().startsWith('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitRow(line)
      i += 2 // header + separator
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]))
        i++
      }
      blocks.push(
        <div key={nextKey()} style={{ overflowX: 'auto', margin: '1.8rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr>
                {header.map((h, hi) => (
                  <th key={hi} style={{
                    textAlign: 'left', padding: '10px 14px',
                    borderBottom: `1px solid ${c.accent}`, color: c.text,
                    fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '.04em',
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {renderInline(h, c, `th${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((cell, ci) => (
                    <td key={ci} style={{
                      padding: '11px 14px', borderBottom: `1px solid ${c.border}`,
                      color: c.muted, lineHeight: 1.6, verticalAlign: 'top',
                    }}>
                      {renderInline(cell, c, `td${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // unordered / ordered list
    if (isUl(line) || isOl(line)) {
      const ordered = isOl(line)
      const marker = ordered ? /^\s*\d+\.\s+/ : /^\s*-\s+/
      const items: string[] = []
      while (i < lines.length && !isBlank(lines[i])) {
        const l = lines[i]
        if (marker.test(l)) {
          items.push(l.replace(marker, ''))
        } else if (isHeading(l) || isHr(l) || /^```/.test(l.trim())) {
          break
        } else {
          // soft-wrapped continuation of the current item
          if (items.length) items[items.length - 1] += ' ' + l.trim()
          else items.push(l.trim())
        }
        i++
      }
      const ListTag = ordered ? 'ol' : 'ul'
      blocks.push(
        <ListTag key={nextKey()} style={{
          margin: '1.2rem 0', paddingLeft: '1.4rem',
          display: 'flex', flexDirection: 'column', gap: 10,
          color: c.muted, fontSize: 15.5, lineHeight: 1.72,
          listStyleType: ordered ? 'decimal' : 'disc',
        }}>
          {items.map((it, ii) => (
            <li key={ii} style={{ paddingLeft: 4 }}>
              {renderInline(it, c, `li${ii}`)}
            </li>
          ))}
        </ListTag>
      )
      continue
    }

    // paragraph — gather consecutive non-blank, non-block lines
    const para: string[] = []
    while (
      i < lines.length && !isBlank(lines[i]) &&
      !isHeading(lines[i]) && !isHr(lines[i]) && !/^```/.test(lines[i].trim()) &&
      !isUl(lines[i]) && !isOl(lines[i]) &&
      !(lines[i].trim().startsWith('|') && i + 1 < lines.length && isTableSep(lines[i + 1]))
    ) {
      para.push(lines[i])
      i++
    }
    const text = para.join(' ')
    blocks.push(
      <p key={nextKey()} style={{ color: c.muted, fontSize: 15.5, lineHeight: 1.78, margin: '1.2rem 0' }}>
        {renderInline(text, c, nextKey())}
      </p>
    )
  }

  return <Fragment>{blocks}</Fragment>
}
