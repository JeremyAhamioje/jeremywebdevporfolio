# Building a Parking-Arbitrage Engine: Architecture & War Stories

## TL;DR

We built a system that watches parking prices across **SpotHero, ParkWhiz, and
Way.com** for ~50 major event venues, ties those prices to the events that move
them (concerts, games, shows), and surfaces arbitrage opportunities — lots whose
price spikes 100%+ on event nights, and events whose tickets aren't on sale yet
(your window to lock in cheap parking before demand hits).

The interesting parts aren't the scrapers. They're everything *around* them:
beating three different anti-bot systems with three different network strategies,
modeling event context on top of a flat price feed, and the small operational
decisions that decide whether a 3 AM cron failure pages you or silently rots.

---

## What it does

- **Monitors** parking inventory + pricing for a curated list of venues, on a
  schedule, across three marketplaces.
- **Discovers** upcoming events at those venues (via Ticketmaster) and correlates
  them with parking-price movements.
- **Detects** significant changes — price spikes, inventory drops — and raises
  alerts with the likely cause attached ("United Center: price up 77% — Dave
  Chappelle in 1 day. Secure passes now.").
- **Serves** a live, on-demand query engine ("show me parking for *this* event at
  *this* venue right now") and a sheet-enrichment pipeline (upload a messy XLSX of
  lots, get live prices appended per platform).
- **Presents** all of it in a Google-Trends-inspired dashboard.

---

## System architecture

Three deployables, one Postgres (Supabase) database in the middle:

```
                     ┌───────────────────────────────────────────┐
                     │              Supabase (Postgres)            │
                     │  venues · events · snapshots · facility_stats │
                     │  alerts · scrape_runs · event_sentiment      │
                     └───────────────────────────────────────────┘
                          ▲                 ▲                 │
              writes      │                 │ writes          │ reads
                          │                 │                 ▼
   ┌──────────────────────┴───┐   ┌─────────┴─────────┐   ┌───────────────┐
   │  parking-arbitrage        │   │  (Ticketmaster     │   │  parking-api   │
   │  • batch scrapers         │   │   discovery, in    │   │  Express,      │
   │  • live engine (Express)  │   │   the same repo)   │   │  read-only,    │
   │  • change detection       │   └───────────────────┘   │  on Render     │
   │  • sheet pipeline (Gemini)│                            └───────┬───────┘
   └───────────────────────────┘                                    │ HTTP
        scrapers run on GitHub Actions + a US VPS                    ▼
                                                          ┌────────────────────┐
                                                          │ parking-arbitrage-ui│
                                                          │ Next.js 14, Vercel  │
                                                          └────────────────────┘
```

**Why three repos?** Clean blast-radius boundaries. The scraper repo holds
credentials and headed browsers and runs on infrastructure we control. The API is
a thin, read-only projection of the database with **no write paths and no
scraper secrets** — safe to expose publicly and to scale independently on Render.
The UI is a static-ish Next.js app on Vercel that only ever talks to the API (and
the live engine for on-demand fetches). A compromise or a bad deploy in one layer
doesn't reach into the others.

The database is the contract between them. Everything else is replaceable.

---

## War story #1: Anti-bot is a *per-platform* problem

The single biggest architectural force in this system is that **each marketplace
defends itself differently**, and the "obvious" deployment (run all scrapers in
CI) fails for two of the three.

| Platform | Defense | What clears it |
|----------|---------|----------------|
| **SpotHero** | Light; tolerant of rotating IPs | GitHub Actions runners (no proxy) |
| **ParkWhiz** | AWS-ELB WAF — 403s non-US / datacenter IPs | A residential-reputation **US IP**, *no* proxy |
| **Way.com** | Cloudflare challenge (JS + cookie) | **Headed** Chromium + **residential** proxy |

We discovered this the hard way: ParkWhiz and Way wrote **zero rows, ever**, from
GitHub Actions. ParkWhiz's WAF (`Server: awselb/2.0`) returns a clean 403 to the
runner's datacenter IP. Way's residential proxy *refuses* the runner IP outright
(`net::ERR_TUNNEL_CONNECTION_FAILED`). Meanwhile SpotHero was perfectly happy on
the same runners.

So the deployment split along the grain of the defenses, not along tidiness:

- **SpotHero → GitHub Actions.** Free, ephemeral, rotating IPs. Good enough.
- **ParkWhiz + Way → a US VPS** with cron. ParkWhiz runs with the proxy
  *explicitly blanked* so it uses the box's own clean US IP. Way runs **headed**
  (Chromium needs a real display to pass Cloudflare) under a virtual framebuffer
  (`xvfb-run`), through the residential proxy.

The ParkWhiz detection is almost funny in its simplicity:

```js
// A US datacenter proxy returns 200 from the real nginx origin.
// A flagged IP gets the WAF: Server: awselb/2.0 + 403. That's our signal.
if (res.status === 403 && /awselb/i.test(res.headers.get('server') || '')) {
  return { status: 'blocked' }   // rotate IP and retry
}
```

**Lesson:** "where does this run" is not an ops afterthought — for scrapers it's a
*design constraint* set by the target's defenses. We let the network strategy
drive the topology instead of forcing one runtime to do everything.

---

## War story #2: One `events` table, two writers

Events get into the database two completely different ways:

1. The **SpotHero scraper** discovers events as a side effect of scraping (the
   listings pages mention them) and upserts `spothero.com`-flavored rows.
2. A separate **Ticketmaster discovery** job polls each venue's TM event list and
   upserts `ticketmaster.com`-flavored rows with a real `ticketmaster_id`,
   presale/on-sale dates, segment classification, etc.

Both write the same `events` table. This is fine — until a UI feature that's
branded "Ticketmaster events" naively reads the table and shows a pile of
SpotHero rows with broken links, because *most* of the rows aren't from
Ticketmaster.

The fix is a one-liner, but it's the kind of one-liner you only write after it
bites you in production:

```js
// TM-branded feeds MUST filter to rows that actually came from Ticketmaster.
let q = supabase.from('events').select('...').not('ticketmaster_id', 'is', null)
```

**Lesson:** when a table has multiple writers, the *reader* has to know which
writer it wants. We now treat `ticketmaster_id IS NOT NULL` as the canonical
"this is a real TM event" predicate, and it's documented next to the table.

---

## War story #3: Event context, and why "top 3 events" was the wrong budget

Raw parking prices are nearly useless without context. $40 at United Center means
nothing; **$40 vs a $9 normal-night baseline, on a Dave Chappelle night** is the
whole game. So beyond the generic nightly scrape, we scrape each venue's upcoming
**event dates** and tag those snapshots with an `event_id`. That lets the
analytics layer compute a per-event *premium* (`event_avg_price` vs
`generic_avg_price`).

The first cut budgeted this as "scrape the soonest **3 events** per venue." It
looked reasonable and was quietly broken. The ticket feed imports many *same-day
variants* of one game as separate events:

```
Yankee Stadium, soonest 3 events:
  • New York Yankees v. Cincinnati Reds * Premium Seating *   (2026-06-19)
  • New York Yankees vs. Cincinnati Reds                      (2026-06-19)
  • Pinstripe Pass * Yankees v. Reds                          (2026-06-19)
```

All three are the *same game on the same date*. The budget of 3 was spent on one
day. Busy venues never got coverage past their nearest game.

The fix was to **budget by distinct dates, not event rows** — each date is exactly
one scrape, and every event that lands on that date rides the same scrape for
free:

```js
// Keep every event on the soonest N DISTINCT dates. Duplicate same-day
// variants don't burn the budget; they all get tagged off that day's one scrape.
const seenDates = new Set()
const out = []
for (const e of eventsByDate) {
  const d = e.event_date.slice(0, 10)
  if (!seenDates.has(d)) { if (seenDates.size >= maxDates) break; seenDates.add(d) }
  out.push(e)
}
```

Result: Yankee Stadium went from *3 events on 1 date* to *34 events across 6
dates*, at the same scrape cost.

A related realization: the **horizon** (how far ahead we look) is a *free*
coverage lever, because cost is bounded by the date budget, not the window. We
widened it from 10 days to **730 days** — for busy venues it changes nothing (their
soonest dates are near), but sparse venues (next show months out) finally get
covered and we start reading a show's parking *early*, which is the entire
"secure parking before the rush" thesis.

**Lesson:** pick the unit your cost is actually denominated in (here, *scrapes =
distinct dates*) and budget in that unit. Budgeting in the wrong unit ("events")
silently wasted the whole allowance on duplicates.

---

## War story #4: The fake-green outage

Every scraper entry point ended like this:

```js
run().catch(console.error)   // ← looks fine. is a trap.
```

When a required secret (`SUPABASE_URL`) went missing, the scraper threw
immediately, `console.error` logged it... and the process **exited 0**. GitHub
Actions saw a green check. The dashboard quietly stopped updating. Nobody got
paged, because by every signal we were watching, everything was *fine*.

The SpotHero job hid a total outage behind a green checkmark for who-knows-how-long.

```js
// Fail LOUDLY. A fatal error must be a non-zero exit, or your CI lies to you.
run().catch(e => { console.error(e); process.exit(1) })
```

**Lesson:** "it logged the error" is not the same as "it reported failure." For
anything scheduled, an unhandled fatal **must** exit non-zero. Green has to mean
green. We now also distinguish *intentional* skips (a `flock` lock held by a still-
running previous job) from real failures, with a dedicated exit code, so a slow
run that overlaps the next tick doesn't look like a crash.

---

## War story #5: The tables that were never there

`change-detection.js` was written against two tables — `parking_snapshots` and
`venue_signals` — that existed only in a `schema-mvp3.sql` file that had never been
applied to production. The job had been failing on `relation does not exist` for
long enough that everyone had stopped reading its logs.

Rather than retro-create dead tables, we re-pointed the logic at what *actually*
exists and is maintained:

- Price-spike detection now reads **`facility_stats`** (one row per venue+facility,
  6,000+ rows) and its rolling `price_history` window. A spike is a z-score against
  that lot's own recent history — not a fixed threshold, so a volatile lot and a
  stable lot are judged on their own terms.
- Inventory drops compare the latest `available_spaces` to the previous value.
- A cooldown reads recent `alerts` so we don't re-fire the same spike hourly.
- Event correlation joins to the `events` table — **filtered to Ticketmaster rows**
  (see war story #2) — so the alert can name the show that's driving the spike.

The `alerts` table itself had two more landmines: a strict 4-value enum
(`price_spike`, `availability_drop`, `new_event`, `price_drop` — uppercase or
invented values are *rejected* by Postgres), and a column actually named
`is_read`, not `read`. Selecting the wrong column name errored the *entire* query
and emptied the feed. The rich human label ("Price up 77% — …") lives in a free-
text `metadata` field; the enum stays small and strict.

**Lesson:** your code's mental model of the schema drifts from reality. The
truth is `information_schema`, not the `.sql` file in the repo. When a background
job has been red for a while, the first question is "do these tables even exist?"

---

## War story #6: The summary layer (`facility_stats`)

Raw `snapshots` is an append-only firehose (70k+ rows for SpotHero alone). The UI
and the change-detector should never scan it directly. So there's a derived
**summary table**, `facility_stats` — one row per (venue, facility) — maintained
on every scrape:

- latest + previous price and spaces, deltas
- a **rolling `price_history`** array (recent prices) → cheap volatility + spike math
- `min` / `max` / `avg`, a `trend` classification
- **`generic_avg_price` vs `event_avg_price`** and a derived **`event_premium_pct`**
- a `source` tag so one platform's rows can be filtered out of the shared table

This is a classic write-time-vs-read-time tradeoff: we pay a little extra on each
scrape to upsert the summary, so that *every read* — the dashboard, the alerts, the
LLM buy/wait model — is a single indexed lookup instead of a time-series scan over
the firehose. The raw snapshots stay for audit and re-derivation; the summary is
what everything actually queries.

---

## The live engine: typo-tolerant, on-demand

Beyond the scheduled batch, there's an Express **live engine** that answers
real-time queries: "parking for *this event* at *this venue*, right now," fanned
out across all three platforms in parallel. Two design notes:

- **Fuzzy matching with confidence.** Users type venues and events with typos,
  abbreviations, and inconsistent punctuation. The engine resolves "vnue"→"venue",
  "evt"→"event" via subsequence matching and scores each match 0–100, surfacing the
  platform's real event titles as clickable candidates when confidence is low,
  rather than silently guessing wrong.
- **A sheet-enrichment pipeline.** Upload a messy XLSX/CSV of lots; the engine
  auto-detects your columns (with Gemini as a tiebreaker), fetches live parking per
  row, matches it back, and **appends** enriched columns *without touching your
  original data*. A subtle-but-real UX decision lived in the column order: we
  group the appended columns **platform-major** (`Live Spot SpotHero | Live Spot
  Price SpotHero | …` then ParkWhiz, then Way) so each platform's spot sits beside
  its own price — instead of "all spots, then all prices," which forced users to
  scroll back and forth.

The engine also uses **Gemini for event-match judging and sentiment**, but only
ever to *interpret numbers the database already computed* — the model never invents
data, it narrates signals we derived deterministically. Sentiment results are
fingerprinted and cached, so we only pay for the LLM call when the underlying
signals actually changed.

---

## The product framing: "secure early," not "the full calendar"

A subtle product decision shaped a chunk of the backend. The events page does
**not** show the full event calendar. It shows only events **whose tickets aren't
on sale yet** (a future on-sale date, or an on-sale-TBD placeholder), ranked by
soonest on-sale. The user is a parking reseller; "secure passes early" means
locking in *parking* before tickets drop and demand — and parking prices — spike.

That framing forced a real SQL subtlety. The naive approach — fetch the N soonest
events by date, then filter to "tickets not yet on sale" in JS — silently drops
far-future on-sale shows that fall past the row cutoff. The filter has to happen
**in the query** (`WHERE onsale_start > now()`), not after a date-ordered
`LIMIT`. Get the order of operations wrong and your most valuable rows (the big
show announced months out) vanish.

We also had to defang on-sale placeholder dates: `1900-01-01` means "no info"
(excluded), `9999-12-31` means "on-sale TBD" (kept, shown as "To be announced") —
otherwise the UI cheerfully renders "on sale in 2,912,273 days."

---

## The UI: a Google-Trends-inspired dashboard

The front end is a Next.js 14 app styled after Google Trends — clean cards, a
restrained palette, light/dark theming, and a hero with a **canvas-animated trend
graph**: a spiky "search-interest" line that sweeps in from the left, fades to a
grey trail, and hands off to the next color, cycling through four series. The
animation runs in a single `requestAnimationFrame` loop that reads its state
(active series, paused) from refs so React re-renders never restart it, and it's
DPR-scaled for crisp lines and theme-aware.

Per-platform data pages mirror a shared "By Lot / By Event" toggle, where the
"By Event" view is the same component scoped to one platform via a
`?source=` filter on the API — so the per-event premiums (a $14 lot that becomes
$268 for a World Cup match) show up exactly where you'd look for them.

---

## Operational details that matter more than they should

- **`flock`-guarded cron.** A slow scrape must never overlap the next tick. Each
  box job runs under `flock -n`; an overlap is skipped with a *distinct* exit code
  so it's never mistaken for a failure.
- **Stray async errors.** Headed browsers and proxy-chain relays emit late async
  errors *after* a per-venue `try/catch` has already handled the result. Without a
  global `unhandledRejection`/`uncaughtException` handler, Node escalates those to
  a process kill and takes down a 50-venue run over one already-handled socket
  reset. We log-and-continue; the per-venue handler owns the real outcome.
- **Observability beats cleverness.** An early version of event-context scraping
  swallowed every failure and logged *nothing* unless it succeeded — so a run that
  produced zero rows gave zero signal and was undebuggable. Now every step logs its
  status, even (especially) the boring "found 0 events" case.
- **Name suffix normalization.** Venue names carry a `— City, ST` suffix that
  breaks both Ticketmaster venue resolution and ParkWhiz URL slugs. One careful
  split (`/\s+[—–-]\s+|,/` — a *space-surrounded* dash or a comma) strips it while
  preserving hyphenated names like "T-Mobile Arena."

---

## Lessons, distilled

1. **Let the target's defenses drive your topology.** Don't force one runtime to
   scrape three sites with three different anti-bot systems.
2. **Budget in the unit your cost is actually denominated in.** "3 events" was the
   wrong unit; "distinct dates" (= scrapes) was right.
3. **A widening that's free should be wide.** Decouple coverage (horizon) from cost
   (date budget) and the horizon stops being a thing you have to ration.
4. **Green has to mean green.** Scheduled jobs must exit non-zero on fatal errors,
   and intentional skips must be distinguishable from crashes.
5. **The schema's truth is the database, not the `.sql` file.** Code drifts; verify
   against reality, especially when a job has been quietly red.
6. **Multiple writers ⇒ readers must declare intent.** `ticketmaster_id IS NOT
   NULL` is a contract, not a filter.
7. **Pay at write time so every read is cheap.** A maintained summary table beats
   scanning the firehose on every page load.
8. **The LLM narrates; it doesn't invent.** Compute signals deterministically;
   let the model interpret numbers you already trust, and cache by fingerprint.

---

## Stack summary

| Layer | Tech |
|-------|------|
| Scrapers / live engine | Node.js, Playwright, Express |
| Anti-bot | US VPS (ParkWhiz, no proxy), residential proxy + `xvfb` headed Chromium (Way), GitHub Actions rotating IPs (SpotHero) |
| Database | Supabase (Postgres) |
| AI | Gemini (column detection, match judging, event sentiment — over derived signals only) |
| API | Express, read-only, on Render |
| UI | Next.js 14, on Vercel |
| Scheduling | GitHub Actions + `flock`-guarded VPS cron |
| Discovery | Ticketmaster Discovery API |
