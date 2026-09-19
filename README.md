# Ministry Report Hub

A congregation ministry-report web app: publishers submit a Yes/No field
service report each month, pioneers (regular, auxiliary, special) log hours
and Bible studies, and the secretary gets a live roll-up with Excel/PDF
export. Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**
on the frontend and **Supabase** (Postgres, Auth, Realtime, Storage, Edge
Functions) on the backend. Deploys to **Vercel**.

---

## 1. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router, TypeScript |
| Styling | Tailwind CSS, hand-rolled shadcn-style primitives (`components/ui`) |
| Auth | Supabase Auth (email + password), session cookies via `@supabase/ssr` |
| Database | Supabase Postgres, Row Level Security on every table |
| Realtime | Supabase Realtime — secretary dashboard updates live as reports come in |
| Storage | Supabase Storage `avatars` bucket for profile pictures |
| Serverless | One Supabase Edge Function (`assign-role`) to gate secretary sign-up |
| Exports | Client-side `html-to-image` (report card PNG), `xlsx` (Excel), `jspdf` (PDF) |
| Hosting | Vercel |

---

## 2. Project structure

```
app/                    Routes (App Router)
  login/ register/      Auth pages
  dashboard/             Publisher/pioneer dashboard (server component)
  secretary/             Secretary roll-up dashboard (server component)
  robots.ts sitemap.ts   Generated discovery files
  not-found.tsx          Custom 404
components/
  ui/                    Button, Input, Select, Textarea, Card, Badge, Label
  auth/                  Login & register forms (client)
  dashboard/             Publisher dashboard (client)
  secretary/             Secretary dashboard + edit dialog (client)
  site-header.tsx         Server component: reads session, renders account chip
lib/
  supabase/               Browser client, server client, middleware session refresh
  types.ts constants.ts utils.ts
supabase/
  migrations/0001_init.sql   Tables, RLS policies, triggers, storage policies
  functions/assign-role/     Edge Function used during secretary sign-up
public/                  Favicons (all sizes), OG image, manifest, llms.txt
```

---

## 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **Database** — open the SQL editor and run `supabase/migrations/0001_init.sql`
   (or, with the Supabase CLI installed: `supabase link --project-ref <ref>`
   then `supabase db push`). This creates `profiles` and `reports`, enables
   RLS with the correct policies, creates the `avatars` storage bucket, and
   adds `reports` to the realtime publication.
3. **Auth** — under *Authentication → Providers → Email*, decide whether to
   require email confirmation. For a congregation where members should be
   able to register and start reporting immediately, turn **Confirm email
   off**. If you leave it on, new users are told to check their inbox before
   they can log in.
4. **Edge Function** — this gates who can register as Secretary:
   ```bash
   supabase functions deploy assign-role
   supabase secrets set SECRETARY_ACCESS_CODE="choose-a-private-code"
   ```
   Share that code only with the people who should have secretary access.
5. **API keys** — from *Project Settings → API*, copy the Project URL and
   the `anon` public key into your `.env.local` (see below). Never put the
   `service_role` key in this app — it's only used inside the Edge Function.

---

## 4. Local development

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# NEXT_PUBLIC_CONGREGATION_NAME

npm install
npm run dev
```

Visit `http://localhost:3000`, register a Publisher account and a Secretary
account (using the access code you set above), and try submitting a report.

---

## 5. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Ministry Report Hub"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

`.env.local` is git-ignored by default — never commit real Supabase keys.

---

## 6. Deploy to Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Add the same environment variables from `.env.local` in
   *Project Settings → Environment Variables*:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_CONGREGATION_NAME`
   - `NEXT_PUBLIC_SITE_URL` (your production URL, e.g. `https://reports.yourcongregation.org`) — used by the sitemap and OpenGraph tags
3. Deploy. Vercel builds with `npm run build` automatically.
4. **Custom domain** — under *Project Settings → Domains*, add your own
   domain and point its DNS at Vercel, instead of relying on the default
   `*.vercel.app` subdomain.

---

## 7. Pre-launch checklist coverage

Mapped against your `PRE_LAUNCH_CHECKLIST.md`:

- **Infrastructure** — custom domain: connect it in Vercel (step 6.4) before
  going live; routing is handled by the App Router (no placeholder routes);
  custom 404 is `app/not-found.tsx`.
- **On-page SEO** — every route exports its own `title`/`description` via
  Next.js Metadata; `alternates.canonical` is set on public pages; each page
  renders exactly one `<h1>`.
- **Discovery files** — `app/sitemap.ts` → `/sitemap.xml`, `app/robots.ts` →
  `/robots.txt` (disallows the private `/dashboard` and `/secretary`
  routes), `public/llms.txt`, and a full favicon set
  (16/32/180/192/512 + `.ico`) all generated and included.
- **Structured data** — this is an internal, auth-gated tool rather than
  public content, so Article/Product schema doesn't apply; add
  `Organization`/`LocalBusiness` JSON-LD to `app/page.tsx` only if you make
  the marketing page public-facing.
- **Social share images** — `public/og-image.png` wired into `openGraph`
  and `twitter` metadata in `app/layout.tsx`.
- **Accessibility & images** — every `<img>` has descriptive `alt` text
  (profile photos use the person's name); focus states are visible
  (`:focus-visible` in `globals.css`); `prefers-reduced-motion` respected.
- **Technical cleanup** — no placeholder/lorem-ipsum content; tab title is
  the site name, never the framework; run `npm run build` before shipping
  to confirm zero console warnings and check the reported bundle size.
- **Bar** — no TODOs left in the codebase. Before you ship, walk this list
  once more with production data.

---

## 8. Notes & next steps

- **Row Level Security** is the real access control — the client-side
  "locked" UI is a courtesy, but the database itself rejects publisher
  updates to submitted reports (only the secretary role can update/delete).
- **Regenerate types** once your schema evolves:
  `supabase gen types typescript --linked > lib/types.generated.ts` (the
  hand-written `lib/types.ts` in this starter is enough to build, but
  generated types will catch schema drift).
- **Multiple congregations**: this schema assumes one congregation per
  Supabase project. To support several, add a `congregation_id` column to
  `profiles`/`reports` and extend the RLS policies accordingly.
