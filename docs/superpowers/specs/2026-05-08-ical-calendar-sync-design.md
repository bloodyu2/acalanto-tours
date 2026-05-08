# iCal Calendar Sync — Design Spec

## Goal

Two-way iCal synchronization between partner accommodation listings and external calendars (Google Calendar, Airbnb, Booking.com, etc.), managed from the partner dashboard.

## Problem

Partners managing accommodations on multiple platforms risk double-bookings because availability is siloed. There is no mechanism to:
1. Import blocked dates from external platforms into Acalanto
2. Export Acalanto bookings back to the partner's external calendars

The existing `CalendarSyncBar` on the public hotel page (`/hotelaria/[slug]`) was misplaced and misrepresented — it belongs to the partner's private dashboard, not the public-facing property page.

---

## Two-Way Sync Model

### Direction 1 — Import (External → Acalanto)
Partner pastes one or more iCal URLs (from Google Calendar, Airbnb, Booking.com, VRBO, etc.). The system fetches those URLs periodically, parses events, and inserts blocked dates into `accommodation_availability` with `source = 'ical'`.

### Direction 2 — Export (Acalanto → External)
The system exposes a public `.ics` endpoint per listing. The partner subscribes to this URL in Google Calendar / Airbnb / Booking.com. Those services fetch the URL on their own schedule and display Acalanto bookings in the partner's calendar.

---

## Architecture

### New Database Table: `accommodation_ical_sources`

```sql
CREATE TABLE accommodation_ical_sources (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id     uuid NOT NULL REFERENCES partner_listings(id) ON DELETE CASCADE,
  label          text NOT NULL,          -- e.g. "Airbnb", "Google Calendar"
  url            text NOT NULL,
  active         boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  last_sync_count int,                   -- number of dates blocked in last sync
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- RLS: partners can only manage their own listing's sources
ALTER TABLE accommodation_ical_sources ENABLE ROW LEVEL SECURITY;
```

### Export Endpoint: `GET /api/ical/[slug].ics`

- Public endpoint, no auth required (URL is unguessable enough via the listing slug)
- Returns a valid `text/calendar` response (VCALENDAR + VEVENT per booked date)
- Sources: `accommodation_availability` rows where `status = 'booked'` + `bookings` rows where `status = 'confirmed'` for that listing
- Events use DTSTART/DTEND with date-only format (all-day events)
- VEVENT summary: "Reservado — Acalanto Turismo"

### Sync Endpoint: `POST /api/ical/sync`

- Protected by `CRON_SECRET` header (Vercel Cron + manual trigger)
- Accepts optional `listingId` query param for single-listing sync; defaults to all active sources
- For each active `accommodation_ical_sources` row:
  1. Fetch the iCal URL (with 10s timeout)
  2. Parse with `ical.js` — extract VEVENT entries where DTSTART is in the future (or within last 90 days for catches)
  3. For each event date range, generate daily rows
  4. Upsert into `accommodation_availability` with `source = 'ical'`, `status = 'booked'`
  5. Update `last_synced_at` and `last_sync_count`
- Errors per-source are logged and do not abort the full run

### Vercel Cron

```json
// vercel.json
{
  "crons": [
    { "path": "/api/ical/sync", "schedule": "0 */6 * * *" }
  ]
}
```

Runs every 6 hours. The `CRON_SECRET` env var gates access.

---

## Partner Dashboard UI

Location: `/conta/parceiro/anuncios` — inside each listing card that has `type === 'hospedagem'` and `status === 'approved'`, a new collapsible section "Sincronização de calendário" appears below the existing edit form.

### Section: "Seu calendário no Acalanto"
Displays the export URL (`https://acalantoturismo.com.br/api/ical/[slug].ics`) with a copy button and brief instructions:
> "Cole esta URL no seu Google Calendar, Airbnb ou Booking.com para ver as reservas do Acalanto no seu calendário."

### Section: "Calendários externos"
Lists all `accommodation_ical_sources` for this listing:
- Label (ex: "Airbnb")
- URL (truncated)
- Last synced: "há 3 horas — 4 datas bloqueadas" or "Nunca sincronizado"
- Delete button

"+ Adicionar calendário" opens an inline form: label + URL fields + "Adicionar" button.

"Sincronizar agora" button calls `POST /api/ical/sync?listingId=...` and shows a loading state + result toast.

### Visibility rules
- Section only renders for `type === 'hospedagem'`
- Section only renders when listing `status === 'approved'` (no point syncing pending/rejected listings)

---

## Removal

`CalendarSyncBar` component is removed from `/app/hotelaria/[slug]/page.tsx`. The component file itself (`components/hotelaria/CalendarSyncBar.tsx`) can be deleted.

---

## Data Model Interaction

`accommodation_availability` rows inserted by iCal sync use `source = 'ical'`. This distinguishes them from:
- `source = 'acalanto'` — bookings confirmed via payment
- `source = 'manual'` — future manual blocks by partner

This allows future features to delete/overwrite only `source = 'ical'` rows on re-sync without touching manual or confirmed-booking blocks.

---

## Error Handling

- Fetch timeout (10s): mark source with `last_sync_error`, skip to next source
- Invalid iCal response: same — log and continue
- Duplicate dates: upsert handles via `ON CONFLICT (room_id, date) WHERE room_id IS NOT NULL`
- Partner-visible errors: "Última sincronização falhou — verifique a URL" shown in dashboard

---

## Dependencies

- `ical.js` — iCal parser (npm: `ical.js` or `node-ical`)
- `CRON_SECRET` — new env var for Vercel Cron auth
- `NEXT_PUBLIC_SITE_URL` — already exists, used to build the export URL

---

## Out of Scope (future)

- Booking.com / Airbnb API integration (OAuth-based, not iCal)
- Conflict detection UI (warn partner when an Acalanto booking overlaps an incoming iCal block)
- Per-room iCal export (current export is per-listing; room-level is a future enhancement)
- Automatic deletion of stale iCal blocks on re-sync
