/* ─── Blog / Journal posts ─── */
import parkingArbitrageEngine from '@/content/parking-arbitrage-engine.md?raw'
import quickcartArchitecture from '@/content/quickcart-architecture.md?raw'

export interface BlogPost {
  slug:     string
  title:    string
  excerpt:  string
  date:     string   // ISO yyyy-mm-dd
  readMins: number
  tags:     string[]
  cover:    string
  content:  string   // raw markdown
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'building-a-parking-arbitrage-engine',
    title: 'Building a Parking-Arbitrage Engine: Architecture & War Stories',
    excerpt:
      'Real-time parking price intelligence across SpotHero, ParkWhiz & Way.com — and the engineering around the scrapers: beating three anti-bot systems, modeling event context on a flat price feed, and the ops decisions that decide whether a 3 AM cron failure pages you or silently rots.',
    date: '2026-06-23',
    readMins: 14,
    tags: ['Engineering', 'Web Scraping', 'Architecture', 'Postgres'],
    cover: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1600&q=80',
    content: parkingArbitrageEngine,
  },
  {
    slug: 'building-quickcart-architecture',
    title: 'Building QuickCart — Architecture, Decisions, and the Why Behind the How',
    excerpt:
      'A full-stack gymwear e-commerce build on Next.js — every significant architecture decision, what was chosen, what was rejected, and why: a colocated App Router API, MongoDB’s embedded cart, Clerk user IDs as the Mongo _id, Paystack’s dual-confirmation payment flow, Cloudinary, and Inngest background jobs.',
    date: '2026-06-23',
    readMins: 11,
    tags: ['Next.js', 'E-Commerce', 'MongoDB', 'Payments'],
    cover: 'https://res.cloudinary.com/dz6kxumoo/image/upload/f_auto,q_auto/v1782245605/Screenshot_2026-06-23_211255_gpeflb.png',
    content: quickcartArchitecture,
  },
]

export const getPost = (slug: string): BlogPost | undefined =>
  BLOG_POSTS.find(p => p.slug === slug)

/** Human-friendly date, e.g. "Jun 23, 2026". */
export function formatPostDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
