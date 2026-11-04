# AIcuriosKids – Marketing + Enrollment Website

Production-ready Next.js site for a children’s AI education brand.

**Tagline:** Think. Create. Build with AI.

## Stack

- Next.js 16.4.3 (App Router) + JavaScript + Tailwind CSS v4
- Supabase (Postgres) – leads, batches, enrollments, payments
- Razorpay – Orders API + Checkout.js
- Resend – transactional email
- GA4 + Meta Pixel (after cookie consent)

## Quick start

```bash
cd ai-edu-site
cp .env.example .env.local
# Fill in all values in .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Manual setup steps

### 1. Supabase

1. Create a project at https://supabase.com
2. Copy Project URL, anon key, and **service role** key into `.env.local`
3. In SQL Editor, run the full contents of `supabase/migrations/001_initial.sql`
4. Confirm RLS is enabled and there are **no public policies**
5. Edit the seed batch (dates, price, seat limit) or insert your real batches

### 2. Razorpay

1. Create account, get Key ID + Key Secret (test then live)
2. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`
3. Webhooks → Add endpoint: `https://yourdomain.com/api/razorpay/webhook`
4. Subscribe to: `payment.captured`, `order.paid`, `payment.failed`
5. Copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`

### 3. Resend

1. Create account, verify your domain
2. Create API key → `RESEND_API_KEY`
3. Set `RESEND_FROM_EMAIL` to a verified sender
4. Set `ADMIN_EMAIL` for enrollment notifications

### 4. Deploy (Vercel recommended – free tier)

```bash
npm run build
# or connect the repo to Vercel and set all env vars in the dashboard
```

Set the same environment variables in the host. After deploy, update the Razorpay webhook URL to the production domain.

### 5. Admin

Phase 1 uses a shared secret header (`ADMIN_API_SECRET`). Call:

```
GET /api/admin/data
Header: x-admin-secret: <your secret>
```

Later: add Supabase Auth email login + allowlist for `ADMIN_EMAIL` and protect `/admin`.

## Placeholders you still need to fill

| Placeholder | Where |
|-------------|--------|
| `AIcuriosKids` | Header, footer, metadata, emails, legal |
| `hello@aicurioskids.in]`, `[phone]` | Footer, contact, legal |
| `[WhatsApp number]` | `.env` → `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| `[Amazon URL]` | `.env` → `NEXT_PUBLIC_AMAZON_URL` |
| `[₹X]` price | Course page display + **batches.price_inr** in DB |
| Batch size, sessions, next batch date | Course page + batches table |
| `[X]` seat numbers | Batches table |
| Missed class policy | FAQ |
| Safety/supervision details | FAQ |
| Refund window details | Refund policy + FAQ |
| Founder photos / bios / credentials | About |
| Testimonials | Home + Course (keep hidden until real) |
| Video lectures / certificate / doubt support | Course “What’s included” – only if true |
| Instagram handle | Footer |
| WhatsApp group link | Thank-you page |
| Governing city for terms | Terms |
| Domain for Resend + Site URL | Env |

## Design system (quick ref)

- Primary navy `#1F2A5C`
- Accent amber `#F5A524` (CTA buttons only; text navy)
- Secondary teal `#1FA2A6`
- Background `#FAF8F4`, section tint `#EEF1FB`
- Fonts: Fraunces (headings), DM Sans (body)

## Later ideas (not in phase 1)

- Parent accounts / login
- Course player / recordings portal
- Blog / content marketing
- Full Supabase Auth for admin
- Cloudflare Turnstile instead of honeypot
- Multi-batch calendar UI
- Automated seat-waitlist emails

## Security notes

- All DB access uses the **service role key on the server only**
- Prices and seat checks are always server-side
- Webhook is the source of truth for payment status (idempotent)
- Never log PII or full payment payloads in plain logs
- Have Privacy / Terms / Refund reviewed by a lawyer (DPDP Act)
