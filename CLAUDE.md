# Dental Art Yerevan — Project Guide

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
| `app/layout.tsx` | Root layout, fonts, header/footer |
| `app/globals.css` | All CSS — design tokens, component styles, responsive breakpoints |
| `lib/translations.ts` | All UI text in Armenian / English / Russian |
| `lib/config.ts` | Business constants (name, phone, address) + `TZ_OFFSET = '+04:00'` |
| `lib/types.ts` | Shared TypeScript types (Booking, Staff, Service, BlockedSlot) |
| `lib/supabase.ts` | Browser Supabase client |
| `lib/supabase-server.ts` | Server Supabase client (service role, for API routes) |
| `lib/email.ts` | Resend email templates (customer confirmation + staff notification) |
| `contexts/LanguageContext.tsx` | Language state (`useTranslation()` hook, persists to localStorage) |
| `middleware.ts` | Protects `/admin/*` routes — redirects to `/admin/login` if no session |
| `components/Header.tsx` | Sticky header + language switcher + mobile menu |
| `components/booking/BookingWidget.tsx` | 6-step booking flow (client component) |
| `app/book/page.tsx` | `/book` page hosting the widget |
| `app/api/available-slots/route.ts` | Returns available + busy time slots for a staff/date/service |
| `app/api/bookable-days/route.ts` | Returns which calendar days have at least one open slot |
| `app/api/bookings/route.ts` | POST: inserts booking + sends confirmation emails |
| `app/admin/login/page.tsx` | Admin login (Supabase Auth) |
| `app/admin/dashboard/page.tsx` | Today's bookings overview |
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
- `--accent: #C9A96E` (gold)
- `--bg: #FAFAF8`, `--section-bg: #F2F0EC`

Fonts loaded via `next/font/google` in `app/layout.tsx`:
- Brand: Cormorant Garamond (`--font-brand`)
- Headings: Noto Serif Armenian (`--font-heading-hy`)
- Body: Inter

Service card images live in `public/services/` (16:9, shown at top of each card).
To swap a photo: replace the file at `public/services/<name>.png`.
Image paths are in the `SERVICE_IMAGES` array at the top of `app/page.tsx`.

---

## Timezone
Armenia is **permanently UTC+4** (no DST).
`TZ_OFFSET = '+04:00'` in `lib/config.ts` is used in both API routes to ensure:
- Working hours from the DB (stored as local time strings like `"09:00:00"`) are correctly converted to UTC timestamps
- Slots returned to the browser are proper UTC ISO strings (with `Z`), so browsers display them in local Armenia time automatically
- Admin-blocked slots (stored as UTC via browser `.toISOString()`) correctly overlap with generated slots

---

## Multilingual (i18n)
All UI text is in `lib/translations.ts` — three top-level keys: `hy`, `en`, `ru`.
The `booking` section of each language includes:
- `svcNameMap`: maps English DB service names → translated display names
- `svcDescMap`: maps English DB service names → translated descriptions
- `minLabel`, `dayNames`, `slotBusy`: small booking UI strings

When adding a new language string, add it to all three language objects.
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
