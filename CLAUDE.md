# Dental Art Yerevan — Project Guide

## Skills
Load the right skill automatically based on what's being done — don't wait for the user to ask.

| Skill | Load when… |
|-------|-----------|
| `frontend-design` | Any new component, page, or UI styling work |
| `redesign-skill` | User asks to improve, modernize, or redesign an existing section |
| `taste-skill` | Creating an entirely new page or major visual overhaul |
| `soft-skill` | Adding premium animations, micro-interactions, or motion design |
| `playwright` | After any UI change — screenshot desktop + mobile (390×844) to verify visually |
| `lighthouse` | After deploying — audit performance ≥80, accessibility ≥90, SEO ≥90 |
| `vercel-deploy` | Troubleshooting deployments, configuring env vars, or build errors |
| `output-skill` | Generating large files — prevents truncated or placeholder output |
| `ui-ux-pro-max-skill` | Design system decisions — run `search.py` for style/color/typography/UX recommendations |

## What this project is
A Next.js 14 website for **Dental Art Yerevan**, a dental clinic in Yerevan, Armenia.
- Public site with multilingual support (Armenian 🇦🇲 / English / Russian)
- Online appointment booking system
- Admin panel for managing bookings, staff, services, and calendar

Live site: deployed on Vercel (auto-deploys on push to `main`)
GitHub: https://github.com/Ero44zz44/dental-art-yerevan

---

## Tech stack
- **Framework**: Next.js 14 App Router, TypeScript
- **Styling**: Tailwind CSS + custom CSS properties in `app/globals.css`
- **Database + Auth**: Supabase (PostgreSQL + Row Level Security + Auth)
- **Emails**: Resend
- **Date logic**: date-fns (with `hy`, `ru`, `enUS` locales)
- **Deployment**: Vercel

---

## Key files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Homepage (Hero, InfoBar, Services, About, Contact) |
| `app/layout.tsx` | Root layout, fonts — renders `SiteShell` which conditionally shows Header/Footer |
| `app/globals.css` | All CSS — design tokens, component styles, responsive breakpoints |
| `components/SiteShell.tsx` | Client wrapper — hides public Header/Footer on `/admin/*` routes |
| `components/Header.tsx` | Sticky header + language switcher + mobile menu |
| `components/Footer.tsx` | Footer |
| `lib/translations.ts` | All UI text in Armenian / English / Russian |
| `lib/config.ts` | Business constants (name, phone, address) + `TZ_OFFSET = '+04:00'` |
| `lib/types.ts` | Shared TypeScript types (Booking, Staff, Service, BlockedSlot) |
| `lib/supabase.ts` | Browser Supabase client |
| `lib/supabase-server.ts` | Server Supabase client (service role, for API routes) |
| `lib/email.ts` | Resend email templates (customer confirmation + staff notification) |
| `contexts/LanguageContext.tsx` | Language state (`useTranslation()` hook, persists to localStorage) |
| `middleware.ts` | Protects `/admin/*` routes — redirects to `/admin/login` if no session |
| `components/booking/BookingWidget.tsx` | 6-step booking flow (client component) |
| `app/book/page.tsx` | `/book` page hosting the widget |
| `app/api/available-slots/route.ts` | Returns available + busy time slots for a staff/date/service |
| `app/api/bookable-days/route.ts` | Returns which calendar days have at least one open slot |
| `app/api/bookings/route.ts` | POST: inserts booking + sends confirmation emails |
| `app/admin/layout.tsx` | Admin shell — fixed sidebar with SVG nav icons, logout, link to public site |
| `app/admin/login/page.tsx` | Admin login (Supabase Auth) |
| `app/admin/dashboard/page.tsx` | Today / This week / Tomorrow booking counts + today's appointment table |
| `app/admin/calendar/page.tsx` | Week calendar — view/cancel bookings, block time, add manual bookings |
| `app/admin/staff/page.tsx` | CRUD staff, working hours, assigned services |
| `app/admin/services/page.tsx` | CRUD services |
| `app/admin/settings/page.tsx` | Business settings |
| `supabase/migrations/` | SQL schema (tables + RLS policies) |
| `supabase/seed.sql` | Sample data (2 staff, 3 services, working hours) |

---

## Design system
Colors are CSS custom properties defined in `app/globals.css`:
- `--primary: #1B3A4B` (dark teal)
- `--accent: #6B9FA0` (sage teal — replaced gold `#C9A96E` in the redesign)
- `--bg: #F7FAFA`, `--section-bg: #EDF2F2`

Fonts loaded via Google Fonts `<link>` in `app/layout.tsx`:
- Brand: DM Serif Display (`--font-brand`)
- Headings: Noto Serif Armenian (`--font-heading-hy`)
- Body: Noto Sans Armenian (`--font-body-hy`)

Service card images live in `public/services/` (16:9, shown at top of each card).
To swap a photo: replace the file at `public/services/<name>.png`.
Image paths are in the `SERVICE_IMAGES` array at the top of `app/page.tsx`.

Doctor photo: `public/doctor-armen.png` — used in the About section.

### Section header conventions
- Most section headers: centered, eyebrow label + h2 + paragraph (`.section-header`)
- Services section: **left-aligned, no eyebrow label** (`.section-header.section-header--left`)
- About section: **no section header element** — doctor name + gold title line serve as the heading

---

## Timezone
Armenia is **permanently UTC+4** (no DST).
`TZ_OFFSET = '+04:00'` in `lib/config.ts` is used in both API routes to ensure:
- Working hours from the DB (stored as local time strings like `"09:00:00"`) are correctly converted to UTC timestamps
- Slots returned to the browser are proper UTC ISO strings (with `Z`), so browsers display them in local Armenia time automatically
- Admin-blocked slots (stored as UTC via browser `.toISOString()`) correctly overlap with generated slots

---

## Armenian Translation Rules

Use **modern spoken Eastern Armenian (Yerevan dialect)** — not literary/formal Armenian. Write the way a real Yerevan business owner would write it: direct, conversational, short sentences.

### Correct vocabulary

| English | ❌ Don't use | ✅ Use this |
|---------|-------------|------------|
| Book appointment | Կատարել ամրագրում | Գրանցվել |
| Contact us | Կապ հաստատել | Կապվել մեզ հետ |
| Get in touch | Հաղորդակցվել | Կապ հաստատեք |
| Our services | Մեր ծառայությունները | Մեր ծառայությունները |
| Learn more | Ավելին իմանալ | Իմանալ ավելին |
| Send message | Ուղղարկել | Ուղարկել |
| Working hours | Աշխատաժամեր | Աշխատանքային ժամեր |
| Appointment | Ամրագրում | Ժամադրություն |
| Patient | Հիվանդ | Հաճախորդ |
| Treatment | Բուժում | Բուժում (ok) |
| Price / Cost | Արժեք | Գին |
| Free consultation | Անվճար խորհրդատվություն | Անվճար խորհրդատվություն (ok) |
| Call us | Զանգ կատարել | Զանգահարեք |
| Address | Հասցե | Հասցե (ok) |
| Thank you | Շնորհակալություն | Շնորհակալություն (ok, but keep short) |
| Welcome | Բարի գալուստ | Բարի եկաք |
| Confirm | Հաստատել | Հաստատել (ok) |
| Cancel | Չեղարկել | Չեղարկել (ok) |
| Back | Հետ | Վերադառնալ |
| Choose | Ընտրություն կատարել | Ընտրեք |
| Our doctor | Մեր բժիշկը | Մեր բժիշկը (ok) |

### Banned words (sound robotic/AI-translated)
- **Իրականացնել** — use a simpler verb instead
- **Բարձրորակ** — overused filler, cut it
- **Մատուցել** — too formal for web copy
- **Համակարգված** — sounds Soviet-era formal

### Tone rules
- Short sentences — max 15 words per sentence in UI copy
- Active voice always
- No "we strive to..." type phrases — just state the fact
- Numbers stay as digits (15 not spelled out)
- Brand name stays as "Dental Art Yerevan" (not translated)

---

## Multilingual (i18n)
All UI text is in `lib/translations.ts` — three top-level keys: `hy`, `en`, `ru`.

**Critical rule: any page that renders translated strings must be `'use client'` and use `useTranslation()`.**
Server components cannot read localStorage, so they always render the default language (Armenian).
This is not a bug — it's a Next.js constraint. Converting to a client component is the fix.

Current top-level translation sections (all three languages must have matching keys):
- `hero`, `nav`, `infoBar`, `services`, `about`, `contact`, `footer` — homepage sections
- `bookPage` — `/book` page hero + trust sidebar + emergency card
- `booking` — booking widget UI, including:
  - `svcNameMap`: English DB service name → translated display name
  - `svcDescMap`: English DB service name → translated description
  - `minLabel`, `dayNames`, `slotBusy`, `summaryRef`: small UI strings

The `contact` section of each language includes `address` (translated street address).

When adding a new page with text: add a new section key to all three language objects, then use `useTranslation()` in a `'use client'` component.
The `Translations` type is auto-inferred from `typeof T['en']`.

---

## Database tables (Supabase)
- `staff` — dentists
- `working_hours` — per staff per day-of-week, `start_time`/`end_time` are local Armenia time strings
- `services` — service name (English in DB), duration, price
- `staff_services` — many-to-many join
- `bookings` — customer bookings; `start_time`/`end_time` stored as UTC
- `blocked_slots` — admin-blocked times; `start_time`/`end_time` stored as UTC

RLS policies: public can SELECT staff/services/working_hours/staff_services, anon can INSERT bookings, authenticated users have full access to everything.

---

## Animation conventions
All animations live in `app/globals.css` as `@keyframes` + class rules — no JS animation libraries.
Use `transform` and `opacity` only (GPU-accelerated). Never animate `top`, `left`, `height`, or `width`.

Established easing vocabulary:
- **Spring pop** `cubic-bezier(0.34, 1.56, 0.64, 1)` — buttons, calendar days, stepper dots, icon hovers
- **Fast slide** `cubic-bezier(0.16, 1, 0.3, 1)` — mobile overlay slide-in (snappy, no bounce)
- **Refined ease-out** `ease-out` — language switcher (medical site, no overshoot)

Key animation patterns already in place:
- Scroll progress bar: `.scroll-progress` div in `Header.tsx`, state-driven `width %`
- Mobile menu: `.mobile-menu-overlay` uses `visibility + transform: translateX(100%)` — NOT `display:none` — so the CSS transition works
- Hamburger → X morph: `.hamburger.is-open span:nth-child(n)` CSS transforms (no separate close button)
- Button shimmer: `.btn-primary::before` pseudo-element with `btn-shimmer` keyframes, loops every 3.8s
- Hero aurora: `#hero::before` and `::after` are large blurred radial-gradient blobs with `aurora-drift-1/2` keyframes (14s/18s) — NOT ring outlines
- Floating doctor: `.about-image-wrap.visible` with `float-gentle` keyframes (5s infinite)
- Scroll-triggered line draw: `.section-label::before` scales from 0→1 when `.fade-in-up.visible` is applied by IntersectionObserver

---

## Admin panel notes
- Admin layout (`app/admin/layout.tsx`) is a fully independent shell — fixed 220px sidebar, main content area with `marginLeft: 220`.
- The public Header/Footer are suppressed on all `/admin/*` routes via `components/SiteShell.tsx`.
- Sidebar nav uses SVG icons (no emojis).
- Calendar: empty cells show a hover-only `+` button to add a booking — clicking the cell itself does nothing, preventing accidental modal triggers.
- Dashboard shows three stat cards: **Today**, **This week**, **Tomorrow**.

---

## Admin access
Admin users are created manually in the Supabase dashboard:
**Authentication → Users → Add user**
There is no self-registration — only manually created users can log in at `/admin/login`.

---

## Env variables required (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_SITE_URL=
```
