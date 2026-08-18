# House of Swasa

Saree & dress material e-commerce site. Next.js (App Router) + Prisma/Postgres (Neon via Vercel) + Vercel Blob + NextAuth, deployed on Vercel.

## Stack

- Next.js 16, TypeScript, Tailwind CSS
- Postgres via Vercel's Neon integration (Prisma ORM)
- Vercel Blob for product images
- NextAuth (credentials) for customer + admin login
- Cash on Delivery checkout, WhatsApp ordering, admin dashboard, installable admin PWA

## Local development

```bash
npm install
npm run dev
```

Local dev uses a Postgres database on `DATABASE_URL` in `.env` (defaults to a local Postgres instance — install with `brew install postgresql@16` and `brew services start postgresql@16`, then `createdb houseofswasa`).

```bash
npx prisma migrate dev   # apply schema
npx prisma db seed       # seed sample sarees, dress materials, admin user, reviews
```

Seeded admin login: phone `9652282268`, password `swasa@admin123` — **change this after first login** (there's no "change password" UI yet, so update it directly via `npx prisma studio` or a new migration/script until one is added).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | NextAuth session signing secret (`openssl rand -base64 32`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token (for product image uploads) |

On Vercel, `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` are already provisioned via the linked Neon + Blob storage integrations; `AUTH_SECRET` is set on the project for all environments.

## Deployment

The project is linked to Vercel (`iraava/house-of-swasa`) and connected to this GitHub repo — pushes to `main` auto-deploy. Production DB schema and seed data have already been applied to the linked Neon database.

## Admin

Visit `/admin/login`. From the dashboard you can manage products & stock, view/update orders, moderate reviews, and edit the 5 social media links. The admin section can be installed as a PWA from a phone browser for on-the-go order tracking.
