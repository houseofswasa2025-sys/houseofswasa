@AGENTS.md

# House of Swasa — project context

E-commerce site for a home-based saree boutique (client: Swathi, contact
swathi.pisarla98@gmail.com / WhatsApp +919652282268). Built end-to-end in
this repo: storefront, cart/checkout (COD only), and a full admin panel.

**Live**: https://house-of-swasa-xi.vercel.app
**Repo**: github.com/houseofswasa2025-sys/houseofswasa (main branch auto-deploys)
**Admin login**: `/admin/login` — email `houseofswasa2025@gmail.com`,
password `Swasa@0406` (seeded in `prisma/seed.ts`; change if this ever
becomes a real production credential concern).

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4
- Prisma 7 + `@prisma/adapter-pg` (driver adapter is **required** in Prisma 7 —
  see `src/lib/prisma.ts`). `npm run build` runs `prisma generate` first
  since the generated client (`src/generated/prisma/`) is gitignored.
- Postgres via Neon, provisioned through Vercel's native integration
  (not the old "Vercel Postgres" product — same thing now, just Neon-branded)
- Vercel Blob for product images (compressed to WebP via `sharp` on upload)
- NextAuth v5 (credentials provider, JWT sessions) — one `User` table with
  `role: CUSTOMER | ADMIN`; login accepts email *or* phone as identifier
- `motion` (framer-motion successor) for animations
- `zustand` for the client-side cart store (persisted to localStorage)

## Data model highlights

- **Per-color variants**: `Product` no longer has `colors`/`stock` fields —
  each color is a `ProductColor` row (`name`, `images[]`, `stock`,
  `sortOrder`) with its own photos and independently-tracked stock.
  Checkout/cart/order-cancel-restore all resolve and mutate stock at the
  `ProductColor` level, never the product as a whole.
- `Order.source`: `WEBSITE` vs `WHATSAPP` — the latter comes from the admin's
  manual "Log Order" flow (`/admin/orders/new`) for sales closed over chat.
- `WhatsAppClick`: fire-and-forget log of every "Order on WhatsApp"/chat-
  bubble click (see `src/lib/track-whatsapp-click.ts` and
  `src/components/whatsapp-tracked-link.tsx`), surfaced at `/admin/whatsapp`.
  This is interest tracking only — there's no real WhatsApp Business API
  integration, so a click doesn't confirm a sale.

## Local dev

Local Postgres (not Neon) via Homebrew, kept separate from production on
purpose so local testing never touches real data:

```bash
brew services start postgresql@16   # if not already running
npx prisma migrate dev              # apply schema
npx prisma db seed                  # seed products/colors/reviews/admin user
npm run dev -- -p 3210              # 3210 avoids clashing with other local projects
```

`.env` holds the local `DATABASE_URL` + a dev `AUTH_SECRET`. `.env.local`
only holds `BLOB_READ_WRITE_TOKEN` (pulled from Vercel) so image uploads
work locally against the real Blob store — `DATABASE_URL`/`POSTGRES_*`/
`NEON_*` are deliberately **not** in `.env.local`, otherwise Next.js would
prefer them over `.env` and local dev would hit production data.

## Deployment / infra notes

- GitHub push uses a dedicated SSH key or key alias (`github-houseofswasa`
  → `~/.ssh/id_ed25519_houseofswasa`), not the machine's default key —
  this repo's GitHub account is separate from other projects on this machine.
- Vercel project `houseofswasa/house-of-swasa` lives under a **different**
  Vercel account than this machine's default CLI login. Don't run plain
  `vercel <cmd>` expecting it to hit the right account/project — either the
  global CLI session needs to already be on that account, or use an
  account-scoped Personal Access Token with `--token` and `--scope
  team_R5iJe3upzCXfH4qvCF4PZ29z` on every command (regenerate a token from
  the Vercel dashboard → Settings → Tokens if needed; never commit one).
- **Never run a manual `vercel deploy` from this directory without checking
  `.vercelignore` first** — it uploads the local working tree as-is
  (unlike git-triggered deploys, which only include tracked files), so a
  local-only `.env` value can leak into production. This already happened
  once (an `AUTH_URL=http://localhost:3000` in `.env` broke prod login
  redirects) — `.vercelignore` now excludes `.env*`, but stay alert for any
  other local-only file that isn't gitignored.
- Prisma migrations that change/drop columns with live data need the
  two-step pattern used for the `ProductColor` migration: additive
  migration → backfill script (raw SQL against prod, since the generated
  client no longer knows about soon-to-be-dropped columns) → drop-column
  migration. Don't just let `prisma migrate dev` auto-generate a single
  destructive migration against a DB with real rows.

## Working notes for future sessions

- Every admin Server Action must call `requireAdmin()` (`src/lib/require-
  admin.ts`) itself — Next.js Server Actions are independently invokable
  and are **not** protected just because the page that renders their form
  is behind `middleware.ts`/the admin layout's auth check. This was a real
  vulnEnerability found in a security audit and fixed; keep the pattern for
  any new admin action.
- Checkout/order pricing is always recomputed server-side from the DB
  (`ProductColor`/`Product`), never trusted from client input — same
  reasoning as above (client-tamperable cart state).
- Seed placeholder images are generated locally
  (`public/images/placeholders/*.jpg`, one per fabric) rather than fetched
  from picsum.photos — picsum couldn't reliably serve ~20+ concurrent
  distinct images when the admin products page loaded all thumbnails at
  once. Real product photos should replace these via the admin panel
  per-color image uploader when the client has them.
- When testing checkout/admin flows with Claude in Chrome, prefer
  coordinate-based clicks over `find`-tool ref clicks for form
  interactions — ref-based clicks on this app have intermittently failed
  to register (especially on animated/motion-wrapped buttons) without any
  visible error, while the same click by pixel coordinate works.
