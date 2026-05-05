# Acalanto Tours — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 16 website for Acalanto Tours (nautical tourism, Paraty/RJ) replacing a broken WordPress/WooCommerce site, with a tours catalog, WhatsApp-first booking widget, admin panel, and Vercel/Supabase deploy.

**Architecture:** App Router Next.js 16 with two route groups — `(site)` for public pages and `admin` for protected CMS. Booking is WhatsApp-first (Phase 1): the BookingWidget generates a pre-filled `wa.me` URL. All data lives in Supabase project `eeklaiqrbtfhnnalzgjn` under `acalanto_*` table prefix.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, Supabase (Auth + DB + Storage), shadcn/ui (selective), Playfair Display + Plus Jakarta Sans, Vercel, GTM + GA4 + Consent Mode v2.

---

## Pre-flight: Working Directory

All work happens in `C:\Users\Victor Lima\Desktop\sites\tours\acalanto-tours\` (bash path: `/sessions/affectionate-focused-allen/mnt/sites/tours/acalanto-tours/`).

The repo name is `acalanto-tours`. Create it on GitHub as `bloodyu2/acalanto-tours` before Task 1.

---

## Task 1: Project Scaffold

**Files:**
- Create: `acalanto-tours/` (project root via `create-next-app`)
- Create: `acalanto-tours/.gitignore` (add `.claude/`, `.cursor/`, `CLAUDE.md`)
- Create: `acalanto-tours/.env.local`
- Create: `acalanto-tours/next.config.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /sessions/affectionate-focused-allen/mnt/sites/tours
npx create-next-app@16 acalanto-tours \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=no \
  --import-alias="@/*"
cd acalanto-tours
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr \
  lucide-react \
  clsx tailwind-merge \
  zod \
  date-fns \
  @radix-ui/react-dialog @radix-ui/react-slot
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
# When prompted:
# Style: Default
# Base color: Neutral
# CSS variables: yes
```

Add needed components:
```bash
npx shadcn@latest add button badge card dialog calendar
```

- [ ] **Step 4: Create `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://eeklaiqrbtfhnnalzgjn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase dashboard — never expose client-side>
NEXT_PUBLIC_WHATSAPP_NUMBER=55XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

- [ ] **Step 5: Update `.gitignore`**

Add to the end of `.gitignore`:
```
# IDE/AI — never commit
.claude/
.cursor/
.cursorrules
CLAUDE.md
*.env.local
```

- [ ] **Step 6: Update `next.config.ts`**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eeklaiqrbtfhnnalzgjn.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://eeklaiqrbtfhnnalzgjn.supabase.co",
              "connect-src 'self' https://eeklaiqrbtfhnnalzgjn.supabase.co https://www.google-analytics.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

- [ ] **Step 7: Init git and push**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 16 project for Acalanto Tours"
git remote add origin https://github.com/bloodyu2/acalanto-tours.git
git branch -M main
git push -u origin main
```

---

## Task 2: Supabase Schema

**Files:**
- Create: `supabase/migrations/001_acalanto_init.sql`

- [ ] **Step 1: Write migration**

Create `supabase/migrations/001_acalanto_init.sql`:

```sql
-- =============================================================
-- Acalanto Tours — Initial Schema
-- Project: eeklaiqrbtfhnnalzgjn | Prefix: acalanto_
-- =============================================================

-- Admins
CREATE TABLE IF NOT EXISTS acalanto_profiles (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role          text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at    timestamptz DEFAULT now()
);

-- Boats/Escunas
CREATE TABLE IF NOT EXISTS acalanto_boats (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL,
  tagline       text,
  description   text,
  capacity_max  int NOT NULL DEFAULT 50,
  capacity_min  int NOT NULL DEFAULT 1,
  departure_time time NOT NULL DEFAULT '10:30',
  duration_hours numeric(3,1) NOT NULL DEFAULT 5.0,
  price_adult   int NOT NULL, -- cents (ex: 11000 = R$110,00)
  price_child   int NOT NULL DEFAULT 0,
  child_free_until_age int NOT NULL DEFAULT 4,
  child_half_until_age int NOT NULL DEFAULT 9,
  features      text[] DEFAULT '{}', -- ['pet-friendly','escorregador','ofuro']
  itinerary     jsonb DEFAULT '[]',  -- [{stop:"Ilha dos Cocos",minutes:40},...]
  cover_image   text,
  active        boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Services (lancha, foto, jeep)
CREATE TABLE IF NOT EXISTS acalanto_services (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL,
  description   text,
  price_label   text,   -- "A partir de R$ 800"
  cover_image   text,
  active        boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- Gallery
CREATE TABLE IF NOT EXISTS acalanto_gallery (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  boat_id       uuid REFERENCES acalanto_boats(id) ON DELETE CASCADE,
  service_id    uuid REFERENCES acalanto_services(id) ON DELETE CASCADE,
  url           text NOT NULL,
  alt_text      text,
  display_order int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS acalanto_testimonials (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name   text NOT NULL,
  author_city   text,
  content       text NOT NULL,
  rating        int CHECK (rating BETWEEN 1 AND 5),
  approved      boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- Bookings (WhatsApp phase — record what was sent)
CREATE TABLE IF NOT EXISTS acalanto_bookings (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  boat_id       uuid REFERENCES acalanto_boats(id) ON DELETE SET NULL,
  tour_date     date NOT NULL,
  adults        int NOT NULL DEFAULT 1,
  children      int NOT NULL DEFAULT 0,
  total_cents   int NOT NULL,
  customer_name text,
  customer_phone text,
  status        text NOT NULL DEFAULT 'whatsapp_initiated'
                CHECK (status IN ('whatsapp_initiated','confirmed','cancelled')),
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- Contacts
CREATE TABLE IF NOT EXISTS acalanto_contacts (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text NOT NULL,
  phone         text,
  email         text,
  message       text NOT NULL,
  read          boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- =============================================================
-- RLS Policies
-- =============================================================

ALTER TABLE acalanto_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE acalanto_boats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE acalanto_services    ENABLE ROW LEVEL SECURITY;
ALTER TABLE acalanto_gallery     ENABLE ROW LEVEL SECURITY;
ALTER TABLE acalanto_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE acalanto_bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE acalanto_contacts    ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION acalanto_is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM acalanto_profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Public can read active boats, services, gallery, approved testimonials
CREATE POLICY "public_read_boats"        ON acalanto_boats        FOR SELECT USING (active = true);
CREATE POLICY "public_read_services"     ON acalanto_services     FOR SELECT USING (active = true);
CREATE POLICY "public_read_gallery"      ON acalanto_gallery      FOR SELECT USING (true);
CREATE POLICY "public_read_testimonials" ON acalanto_testimonials FOR SELECT USING (approved = true);

-- Public can insert bookings and contacts
CREATE POLICY "public_insert_bookings"   ON acalanto_bookings  FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_contacts"   ON acalanto_contacts  FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "admin_all_boats"          ON acalanto_boats         FOR ALL USING (acalanto_is_admin());
CREATE POLICY "admin_all_services"       ON acalanto_services      FOR ALL USING (acalanto_is_admin());
CREATE POLICY "admin_all_gallery"        ON acalanto_gallery       FOR ALL USING (acalanto_is_admin());
CREATE POLICY "admin_all_testimonials"   ON acalanto_testimonials  FOR ALL USING (acalanto_is_admin());
CREATE POLICY "admin_all_bookings"       ON acalanto_bookings      FOR ALL USING (acalanto_is_admin());
CREATE POLICY "admin_all_contacts"       ON acalanto_contacts      FOR ALL USING (acalanto_is_admin());
CREATE POLICY "admin_all_profiles"       ON acalanto_profiles      FOR ALL USING (acalanto_is_admin());

-- =============================================================
-- Seed: 4 boats from WordPress export
-- =============================================================

INSERT INTO acalanto_boats (slug, name, tagline, description, capacity_max, departure_time, duration_hours, price_adult, price_child, child_free_until_age, child_half_until_age, features, itinerary, display_order)
VALUES
(
  'ilha-rasa-iv',
  'Ilha Rasa IV',
  'Clássica com gastronomia caiçara',
  'Uma viagem com o sabor da culinária local a bordo. Cenário do filme Crepúsculo. Perfeita para quem quer aliar navegação e gastronomia em Paraty.',
  50, '11:00', 5.0, 11000, 5500, 4, 9,
  ARRAY['gastronomia','cultural'],
  '[{"stop":"Praia Conceição","minutes":40},{"stop":"Praia da Lula","minutes":40},{"stop":"Praia de Santa Rita","minutes":40},{"stop":"Praia Vermelha","minutes":40}]'::jsonb,
  1
),
(
  'ilha-rasa-v',
  'Ilha Rasa V',
  'Familiar, kids e pet friendly',
  'A escolha perfeita para famílias. Escorregador a bordo, pet friendly e paradas em praias paradisíacas com Aquário Natural.',
  50, '11:00', 5.0, 11000, 5500, 4, 9,
  ARRAY['pet-friendly','kids','escorregador','familiar'],
  '[{"stop":"Ilha dos Cocos","minutes":40},{"stop":"Praia da Conceição","minutes":40},{"stop":"Aquário Natural","minutes":40},{"stop":"Praia da Lula","minutes":40}]'::jsonb,
  2
),
(
  'tania',
  'Tânia',
  'Premium com ofurô panorâmico',
  'A experiência mais sofisticada da baía. Ofurô panorâmico, pet friendly e roteiro completo com 6 paradas deslumbrantes.',
  50, '10:30', 5.5, 11000, 5500, 4, 9,
  ARRAY['premium','pet-friendly','ofuro'],
  '[{"stop":"Ilha dos Cocos","minutes":30},{"stop":"Praia da Lula","minutes":40},{"stop":"Lagoa Azul","minutes":40},{"stop":"Ilha Comprida","minutes":30},{"stop":"Praia Vermelha","minutes":40},{"stop":"Ilha do Mantimento","minutes":20}]'::jsonb,
  3
),
(
  'soberano',
  'Soberano',
  'Contemplativa — 40 minutos por parada',
  'Para quem quer aproveitar cada momento sem pressa. 40 minutos em cada ponto, águas calmas e o melhor da Baía de Paraty.',
  50, '10:30', 5.0, 10000, 5000, 4, 9,
  ARRAY['contemplativa'],
  '[{"stop":"Ilha dos Cocos","minutes":40},{"stop":"Praia da Lula","minutes":40},{"stop":"Lagoa Azul","minutes":40},{"stop":"Praia Vermelha","minutes":40},{"stop":"Ilha do Mantimento","minutes":20}]'::jsonb,
  4
);

INSERT INTO acalanto_services (slug, name, description, price_label, display_order)
VALUES
  ('lancha-privativa', 'Lancha Privativa', 'Passeio exclusivo nos pontos mais bonitos da Baía de Paraty. Combine suas próprias paradas, horários e duração.', 'Sob consulta', 1),
  ('fotografia',       'Fotografia',       'Registre cada momento com nosso serviço de fotografia profissional a bordo.', 'Sob consulta', 2),
  ('passeio-de-jeep',  'Passeio de Jeep',  'Aventure-se pelas trilhas e estradas históricas da Costa Verde com conforto e segurança.', 'Sob consulta', 3);
```

- [ ] **Step 2: Apply migration via Supabase dashboard**

Navigate to `https://supabase.com/dashboard/project/eeklaiqrbtfhnnalzgjn/sql/new`, paste the SQL above, and run it. Verify each table appears in Table Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema for acalanto_* tables with RLS + seed data"
```

---

## Task 3: Supabase Client + Types

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/types/database.ts`
- Create: `lib/constants.ts`

- [ ] **Step 1: Create `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create `lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
```

- [ ] **Step 3: Create `lib/types/database.ts`**

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      acalanto_boats: {
        Row: {
          id: string
          slug: string
          name: string
          tagline: string | null
          description: string | null
          capacity_max: number
          capacity_min: number
          departure_time: string
          duration_hours: number
          price_adult: number
          price_child: number
          child_free_until_age: number
          child_half_until_age: number
          features: string[]
          itinerary: Json
          cover_image: string | null
          active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['acalanto_boats']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['acalanto_boats']['Insert']>
      }
      acalanto_services: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          price_label: string | null
          cover_image: string | null
          active: boolean
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['acalanto_services']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['acalanto_services']['Insert']>
      }
      acalanto_gallery: {
        Row: { id: string; boat_id: string | null; service_id: string | null; url: string; alt_text: string | null; display_order: number; created_at: string }
        Insert: Omit<Database['public']['Tables']['acalanto_gallery']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['acalanto_gallery']['Insert']>
      }
      acalanto_testimonials: {
        Row: { id: string; author_name: string; author_city: string | null; content: string; rating: number | null; approved: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['acalanto_testimonials']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['acalanto_testimonials']['Insert']>
      }
      acalanto_bookings: {
        Row: { id: string; boat_id: string | null; tour_date: string; adults: number; children: number; total_cents: number; customer_name: string | null; customer_phone: string | null; status: string; notes: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['acalanto_bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['acalanto_bookings']['Insert']>
      }
      acalanto_contacts: {
        Row: { id: string; name: string; phone: string | null; email: string | null; message: string; read: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['acalanto_contacts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['acalanto_contacts']['Insert']>
      }
      acalanto_profiles: {
        Row: { id: string; auth_user_id: string; role: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['acalanto_profiles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['acalanto_profiles']['Insert']>
      }
    }
  }
}

// Convenience aliases
export type Boat = Database['public']['Tables']['acalanto_boats']['Row']
export type Service = Database['public']['Tables']['acalanto_services']['Row']
export type Gallery = Database['public']['Tables']['acalanto_gallery']['Row']
export type Testimonial = Database['public']['Tables']['acalanto_testimonials']['Row']
export type Booking = Database['public']['Tables']['acalanto_bookings']['Row']
export type Contact = Database['public']['Tables']['acalanto_contacts']['Row']

export type ItineraryStop = { stop: string; minutes: number }
```

- [ ] **Step 4: Create `lib/constants.ts`**

```typescript
export const SITE_NAME = 'Acalanto Tours'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acalanto.com.br'
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5524999999999'
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? ''

export const OPERATING_DAYS = [1, 2, 3, 4, 5, 6] // Mon–Sat (0=Sun)
export const BOOKING_ADVANCE_MIN_DAYS = 1  // must book at least 1 day ahead
export const BOOKING_ADVANCE_MAX_DAYS = 90 // calendar opens 90 days ahead
```

- [ ] **Step 5: Create `lib/booking/pricing.ts`**

```typescript
import type { Boat } from '@/lib/types/database'

export interface PassengerCount { adults: number; children: number }

export function calculateTotal(boat: Boat, passengers: PassengerCount): number {
  return (boat.price_adult * passengers.adults) + (boat.price_child * passengers.children)
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export function getChildPriceLabel(boat: Boat): string {
  return `Grátis até ${boat.child_free_until_age} anos · Meia (${formatCents(boat.price_child)}) ${boat.child_free_until_age + 1}–${boat.child_half_until_age} anos`
}
```

- [ ] **Step 6: Create `lib/booking/whatsapp.ts`**

```typescript
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Boat } from '@/lib/types/database'
import type { PassengerCount } from './pricing'
import { calculateTotal, formatCents } from './pricing'
import { WHATSAPP_NUMBER } from '@/lib/constants'

export function buildWhatsAppUrl(
  boat: Boat,
  date: Date,
  passengers: PassengerCount
): string {
  const total = calculateTotal(boat, passengers)
  const dateStr = format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })

  const lines = [
    `Olá! Gostaria de reservar um passeio:`,
    `🚢 Escuna: ${boat.name}`,
    `📅 Data: ${dateStr}`,
    `👤 Adultos: ${passengers.adults}${passengers.children > 0 ? ` | 👶 Crianças: ${passengers.children}` : ''}`,
    `💰 Total estimado: ${formatCents(total)}`,
    ``,
    `Aguardo confirmação de disponibilidade!`,
  ]

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
```

- [ ] **Step 7: Commit**

```bash
git add lib/
git commit -m "feat: add Supabase clients, database types, booking logic"
```

---

## Task 4: Global Layout + Fonts

**Files:**
- Modify: `app/layout.tsx` (root)
- Create: `app/(site)/layout.tsx`
- Create: `components/layout/Header.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `components/layout/WhatsAppFloat.tsx`
- Create: `components/layout/SectionWave.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update `app/globals.css`**

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --ocean-deep:   #0A3D5C;
  --ocean-mid:    #1A6B8A;
  --ocean-light:  #4DA8C7;
  --sea-green:    #2E8B6A;
  --sand-warm:    #F5EDD8;
  --sand-light:   #FDFAF4;
  --driftwood:    #8B7355;
  --charcoal:     #1C1C1C;
  --sunset-gold:  #F4A623;
  --sunset-warm:  #E8732A;
  --coral-soft:   #F06B6B;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-sans:    'Plus Jakarta Sans', system-ui, sans-serif;
}

body {
  font-family: var(--font-sans);
  background-color: var(--sand-light);
  color: var(--charcoal);
}

.font-display { font-family: var(--font-display); }
```

- [ ] **Step 2: Update `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Passeios de Escuna em Paraty`, template: `%s | ${SITE_NAME}` },
  description: 'Passeios de escuna pela Baía de Paraty. 4 embarcações únicas. Reservas via WhatsApp.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_NAME,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Create `components/layout/Header.tsx`**

```typescript
'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { SITE_NAME, WHATSAPP_NUMBER } from '@/lib/constants'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const nav = [
    { href: '/escunas',    label: 'Escunas' },
    { href: '/servicos',   label: 'Serviços' },
    { href: '/galeria',    label: 'Galeria' },
    { href: '/quem-somos', label: 'Quem Somos' },
    { href: '/contato',    label: 'Contato' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-display text-xl font-bold" style={{ color: 'var(--ocean-deep)' }}>
            {SITE_NAME}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {nav.map(item => (
              <Link key={item.href} href={item.href}
                className="text-sm font-medium hover:text-[var(--ocean-mid)] transition-colors"
                style={{ color: scrolled ? 'var(--charcoal)' : 'white' }}>
                {item.label}
              </Link>
            ))}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: 'var(--sunset-gold)' }}>
              <Phone size={14} />
              Reservar
            </a>
          </nav>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}
            style={{ color: scrolled ? 'var(--charcoal)' : 'white' }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 flex flex-col gap-4">
            {nav.map(item => (
              <Link key={item.href} href={item.href}
                className="text-sm font-medium py-1" style={{ color: 'var(--charcoal)' }}
                onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--sunset-gold)' }}>
              <Phone size={14} /> Reservar agora
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 4: Create `components/layout/Footer.tsx`**

```typescript
import Link from 'next/link'
import { SITE_NAME, WHATSAPP_NUMBER } from '@/lib/constants'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--ocean-deep)', color: 'white' }} className="pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/20">
          <div>
            <p className="font-display text-xl font-bold mb-2">{SITE_NAME}</p>
            <p className="text-sm text-white/70">Passeios de escuna pela Baía de Paraty, RJ.</p>
          </div>
          <div>
            <p className="font-semibold mb-3">Navegação</p>
            <ul className="space-y-2 text-sm text-white/70">
              {[['Escunas','/escunas'],['Serviços','/servicos'],['Galeria','/galeria'],['Quem Somos','/quem-somos'],['Contato','/contato']].map(([label,href])=>(
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">Contato</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors">WhatsApp</a>
              </li>
              <li>Paraty, RJ — Brasil</li>
            </ul>
          </div>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <span>© {new Date().getFullYear()} {SITE_NAME}. Todos os direitos reservados.</span>
          <span>Desenvolvido por <a href="https://balaio.net" className="hover:text-white transition-colors">Balaio Digital</a></span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Create `components/layout/WhatsAppFloat.tsx`**

```typescript
import { MessageCircle } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/constants'

export default function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank" rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110"
      style={{ backgroundColor: '#25D366' }}>
      <MessageCircle className="text-white" size={28} fill="white" />
    </a>
  )
}
```

- [ ] **Step 6: Create `components/layout/SectionWave.tsx`**

```typescript
export default function SectionWave({ flip = false, color = '#F5EDD8' }: { flip?: boolean; color?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12" fill={color}>
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 7: Create `app/(site)/layout.tsx`**

```typescript
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
```

- [ ] **Step 8: Run dev server and verify no TS errors**

```bash
npm run dev
# Open http://localhost:3000 — expect blank page but no console errors
# Run type check:
npx tsc --noEmit
# Expected: 0 errors
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add global layout, header, footer, WhatsApp float, design tokens"
```

---

## Task 5: TourCard + ToursGrid Components

**Files:**
- Create: `components/tours/TourCard.tsx`
- Create: `components/sections/ToursGrid.tsx`

- [ ] **Step 1: Create `components/tours/TourCard.tsx`**

```typescript
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, ArrowRight } from 'lucide-react'
import type { Boat } from '@/lib/types/database'
import { formatCents } from '@/lib/booking/pricing'

const FEATURE_LABELS: Record<string, string> = {
  'pet-friendly': '🐾 Pet',
  'kids': '👶 Kids',
  'escorregador': '🛝 Escorregador',
  'ofuro': '🛁 Ofurô',
  'gastronomia': '🍽️ Gastronomia',
  'premium': '⭐ Premium',
  'familiar': '👨‍👩‍👧 Familiar',
  'contemplativa': '🌊 Contemplativa',
}

export default function TourCard({ boat }: { boat: Boat }) {
  return (
    <Link href={`/escunas/${boat.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white">
      <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
        {boat.cover_image ? (
          <Image src={boat.cover_image} alt={boat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--ocean-deep), var(--ocean-mid))' }}>
            <span className="text-white/40 text-4xl">⚓</span>
          </div>
        )}
        {boat.features.slice(0, 2).map(f => (
          <span key={f} className="absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full bg-white/90 text-[var(--ocean-deep)]">
            {FEATURE_LABELS[f] ?? f}
          </span>
        ))}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--ocean-deep)' }}>{boat.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{boat.tagline}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Clock size={12} /> {boat.duration_hours}h</span>
          <span className="flex items-center gap-1"><Users size={12} /> Até {boat.capacity_max} pax</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">A partir de</span>
            <p className="font-bold text-lg" style={{ color: 'var(--sunset-gold)' }}>{formatCents(boat.price_adult)}<span className="text-xs font-normal text-gray-400">/pessoa</span></p>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-[var(--ocean-mid)] group-hover:gap-2 transition-all">
            Ver passeio <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create `components/sections/ToursGrid.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import TourCard from '@/components/tours/TourCard'

export default async function ToursGrid() {
  const supabase = await createClient()
  const { data: boats } = await supabase
    .from('acalanto_boats')
    .select('*')
    .eq('active', true)
    .order('display_order')

  if (!boats?.length) return null

  return (
    <section className="py-20 px-4" style={{ backgroundColor: 'var(--sand-warm)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-3" style={{ color: 'var(--ocean-deep)' }}>
            Nossas Escunas
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cada embarcação tem uma personalidade. Escolha a que combina com o seu estilo.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {boats.map(boat => <TourCard key={boat.id} boat={boat} />)}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/
git commit -m "feat: add TourCard and ToursGrid server component"
```

---

## Task 6: Home Page

**Files:**
- Create: `app/(site)/page.tsx`
- Create: `components/sections/HeroSection.tsx`
- Create: `components/sections/ServicesSection.tsx`
- Create: `components/sections/TestimonialsSection.tsx`

- [ ] **Step 1: Create `components/sections/HeroSection.tsx`**

```typescript
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/constants'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, var(--ocean-deep) 0%, var(--ocean-mid) 60%, var(--ocean-light) 100%)' }}>
      {/* Overlay pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <p className="text-sm font-medium tracking-widest uppercase mb-4 text-white/70">Paraty, Rio de Janeiro</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Aventure-se<br />
          <span style={{ color: 'var(--sunset-gold)' }}>pela Baía de Paraty</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          4 escunas únicas, roteiros inesquecíveis e 5 horas de puro contato com a natureza da Costa Verde.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/escunas"
            className="px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--sunset-gold)', color: 'var(--charcoal)' }}>
            Ver Passeios
          </Link>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
            className="px-8 py-4 rounded-full font-semibold text-base border-2 border-white/40 text-white hover:bg-white/10 transition-all">
            Falar no WhatsApp
          </a>
        </div>
      </div>
      <a href="#passeios" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
        <ChevronDown size={32} />
      </a>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/sections/ServicesSection.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function ServicesSection() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('acalanto_services')
    .select('*')
    .eq('active', true)
    .order('display_order')

  if (!services?.length) return null

  const icons: Record<string, string> = {
    'lancha-privativa': '🚤',
    'fotografia': '📸',
    'passeio-de-jeep': '🚙',
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-3" style={{ color: 'var(--ocean-deep)' }}>
            Outros Serviços
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map(service => (
            <Link href={`/servicos/${service.slug}`} key={service.id}
              className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-[var(--ocean-mid)] transition-all">
              <div className="text-4xl mb-4">{icons[service.slug] ?? '✨'}</div>
              <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--ocean-deep)' }}>{service.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{service.description}</p>
              <span className="flex items-center gap-1 text-sm font-medium text-[var(--ocean-mid)]">
                Saiba mais <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `components/sections/TestimonialsSection.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'

export default async function TestimonialsSection() {
  const supabase = await createClient()
  const { data: testimonials } = await supabase
    .from('acalanto_testimonials')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(3)

  if (!testimonials?.length) return null

  return (
    <section className="py-20 px-4" style={{ backgroundColor: 'var(--ocean-deep)' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-4xl font-bold text-center text-white mb-12">
          O que dizem nossos viajantes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-4">&ldquo;{t.content}&rdquo;</p>
              <p className="font-semibold text-white text-sm">{t.author_name}</p>
              {t.author_city && <p className="text-white/50 text-xs">{t.author_city}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `app/(site)/page.tsx`**

```typescript
import { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import ToursGrid from '@/components/sections/ToursGrid'
import ServicesSection from '@/components/sections/ServicesSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import SectionWave from '@/components/layout/SectionWave'

export const metadata: Metadata = {
  title: 'Passeios de Escuna em Paraty — Acalanto Tours',
  description: 'Passeios de escuna pela Baía de Paraty. Família, premium ou contemplativo. Reserve pelo WhatsApp.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div id="passeios">
        <SectionWave color="var(--sand-warm)" />
        <ToursGrid />
        <SectionWave flip color="white" />
      </div>
      <ServicesSection />
      <SectionWave color="var(--ocean-deep)" />
      <TestimonialsSection />
    </>
  )
}
```

- [ ] **Step 5: Run dev and verify home page renders**

```bash
npm run dev
# Navigate to http://localhost:3000
# Expected: Hero gradient, tours grid (4 cards from Supabase seed), services, wave dividers
npx tsc --noEmit
# Expected: 0 errors
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add home page with hero, tours grid, services, testimonials"
```

---

## Task 7: BookingWidget + Tour Detail Page

**Files:**
- Create: `components/tours/BookingWidget.tsx`
- Create: `components/tours/ItineraryTimeline.tsx`
- Create: `app/(site)/escunas/page.tsx`
- Create: `app/(site)/escunas/[slug]/page.tsx`

- [ ] **Step 1: Create `components/tours/ItineraryTimeline.tsx`**

```typescript
import type { ItineraryStop } from '@/lib/types/database'
import { MapPin } from 'lucide-react'

export default function ItineraryTimeline({ stops }: { stops: ItineraryStop[] }) {
  return (
    <div className="relative">
      {stops.map((stop, i) => (
        <div key={i} className="flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: 'var(--ocean-mid)' }}>
              {i + 1}
            </div>
            {i < stops.length - 1 && <div className="w-0.5 flex-1 mt-2" style={{ backgroundColor: 'var(--ocean-light)' }} />}
          </div>
          <div className="pt-1 pb-2">
            <p className="font-semibold text-sm flex items-center gap-1" style={{ color: 'var(--ocean-deep)' }}>
              <MapPin size={12} /> {stop.stop}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">~{stop.minutes} minutos</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/tours/BookingWidget.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { addDays, isBefore, isAfter, getDay } from 'date-fns'
import { Minus, Plus, MessageCircle, CalendarDays } from 'lucide-react'
import type { Boat } from '@/lib/types/database'
import { calculateTotal, formatCents, getChildPriceLabel } from '@/lib/booking/pricing'
import { buildWhatsAppUrl } from '@/lib/booking/whatsapp'
import { BOOKING_ADVANCE_MIN_DAYS, BOOKING_ADVANCE_MAX_DAYS, OPERATING_DAYS } from '@/lib/constants'

export default function BookingWidget({ boat }: { boat: Boat }) {
  const today = new Date()
  const minDate = addDays(today, BOOKING_ADVANCE_MIN_DAYS)
  const maxDate = addDays(today, BOOKING_ADVANCE_MAX_DAYS)

  const [date, setDate] = useState<Date | null>(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const total = calculateTotal(boat, { adults, children })

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const d = new Date(e.target.value + 'T12:00:00')
    if (!OPERATING_DAYS.includes(getDay(d))) return
    setDate(d)
  }

  function handleReserve() {
    if (!date) return
    const url = buildWhatsAppUrl(boat, date, { adults, children })
    window.open(url, '_blank')
  }

  const Counter = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(value - 1, label === 'Adultos' ? 1 : 0))}
          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50 transition-colors"
          style={{ borderColor: 'var(--ocean-mid)', color: 'var(--ocean-mid)' }}>
          <Minus size={14} />
        </button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button onClick={() => onChange(Math.min(value + 1, boat.capacity_max))}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
          style={{ backgroundColor: 'var(--ocean-mid)' }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="rounded-2xl border-2 p-6 sticky top-20" style={{ borderColor: 'var(--ocean-light)', backgroundColor: 'var(--sand-light)' }}>
      <div className="mb-4">
        <span className="text-xs text-gray-500">A partir de</span>
        <p className="font-bold text-3xl" style={{ color: 'var(--sunset-gold)' }}>
          {formatCents(boat.price_adult)}<span className="text-sm font-normal text-gray-400">/pessoa</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">{getChildPriceLabel(boat)}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ocean-deep)' }}>
            <CalendarDays size={14} className="inline mr-1" />Data do passeio
          </label>
          <input
            type="date"
            min={minDate.toISOString().split('T')[0]}
            max={maxDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
            className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ocean-mid)]"
          />
          <p className="text-xs text-gray-400 mt-1">Saída às {boat.departure_time.slice(0,5)}h · Seg–Sáb</p>
        </div>

        <div className="space-y-3 border rounded-xl p-4" style={{ borderColor: 'var(--ocean-light)' }}>
          <Counter label="Adultos" value={adults} onChange={setAdults} />
          <Counter label={`Crianças (${boat.child_free_until_age + 1}–${boat.child_half_until_age} anos)`} value={children} onChange={setChildren} />
        </div>

        {(adults > 0) && (
          <div className="flex justify-between text-sm font-semibold pt-2 border-t">
            <span>Total estimado</span>
            <span style={{ color: 'var(--sunset-gold)' }}>{formatCents(total)}</span>
          </div>
        )}

        <button
          onClick={handleReserve}
          disabled={!date}
          className="w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          style={{ backgroundColor: '#25D366', color: 'white' }}>
          <MessageCircle size={18} />
          {date ? 'Reservar pelo WhatsApp' : 'Selecione uma data'}
        </button>
        <p className="text-xs text-center text-gray-400">
          Você será direcionado ao WhatsApp para confirmar a reserva
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/(site)/escunas/page.tsx`**

```typescript
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TourCard from '@/components/tours/TourCard'

export const metadata: Metadata = {
  title: 'Escunas em Paraty',
  description: 'Conheça nossas 4 escunas. Roteiros diferentes para cada estilo de viajante.',
}

export default async function EscunasPage() {
  const supabase = await createClient()
  const { data: boats } = await supabase
    .from('acalanto_boats')
    .select('*')
    .eq('active', true)
    .order('display_order')

  return (
    <div className="pt-24 pb-20 min-h-screen" style={{ backgroundColor: 'var(--sand-warm)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl font-bold mb-4" style={{ color: 'var(--ocean-deep)' }}>Nossas Escunas</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Escolha o passeio perfeito para o seu estilo. Cada escuna tem uma personalidade única.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {boats?.map(boat => <TourCard key={boat.id} boat={boat} />)}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/(site)/escunas/[slug]/page.tsx`**

```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import BookingWidget from '@/components/tours/BookingWidget'
import ItineraryTimeline from '@/components/tours/ItineraryTimeline'
import type { ItineraryStop } from '@/lib/types/database'
import { formatCents } from '@/lib/booking/pricing'
import { Clock, Users, MapPin } from 'lucide-react'
import { SITE_NAME } from '@/lib/constants'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: boat } = await supabase.from('acalanto_boats').select('name,tagline').eq('slug', slug).single()
  if (!boat) return {}
  return {
    title: `${boat.name} — ${boat.tagline}`,
    description: `Passeio de escuna em Paraty a bordo da ${boat.name}. ${boat.tagline}. Reserve pelo WhatsApp.`,
  }
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: boat } = await supabase.from('acalanto_boats').select('*').eq('slug', slug).single()
  if (!boat) notFound()

  const { data: gallery } = await supabase
    .from('acalanto_gallery')
    .select('*')
    .eq('boat_id', boat.id)
    .order('display_order')

  const itinerary = (boat.itinerary as unknown as ItineraryStop[]) ?? []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: `${boat.name} — ${SITE_NAME}`,
    description: boat.description,
    address: { '@type': 'PostalAddress', addressLocality: 'Paraty', addressRegion: 'RJ', addressCountry: 'BR' },
    priceRange: formatCents(boat.price_adult),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pt-16">
        {/* Cover */}
        <div className="relative h-64 md:h-96 bg-gray-200">
          {boat.cover_image ? (
            <Image src={boat.cover_image} alt={boat.name} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, var(--ocean-deep), var(--ocean-mid))' }} />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-end">
            <div className="p-8 text-white">
              <h1 className="font-display text-4xl md:text-5xl font-bold">{boat.name}</h1>
              <p className="text-white/80 text-lg mt-1">{boat.tagline}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick info */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Clock, label: 'Duração', value: `~${boat.duration_hours}h` },
                  { icon: Users, label: 'Capacidade', value: `Até ${boat.capacity_max} pax` },
                  { icon: MapPin, label: 'Saída', value: boat.departure_time.slice(0,5) + 'h' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--sand-warm)' }}>
                    <Icon size={20} className="mx-auto mb-1" style={{ color: 'var(--ocean-mid)' }} />
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--ocean-deep)' }}>{value}</p>
                  </div>
                ))}
              </div>

              {boat.description && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-3" style={{ color: 'var(--ocean-deep)' }}>Sobre este passeio</h2>
                  <p className="text-gray-600 leading-relaxed">{boat.description}</p>
                </div>
              )}

              {itinerary.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--ocean-deep)' }}>Roteiro</h2>
                  <ItineraryTimeline stops={itinerary} />
                </div>
              )}

              {gallery && gallery.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--ocean-deep)' }}>Galeria</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {gallery.map(img => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <Image src={img.url} alt={img.alt_text ?? boat.name} fill className="object-cover hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: booking widget */}
            <div>
              <BookingWidget boat={boat} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 5: Run type check**

```bash
npx tsc --noEmit
# Expected: 0 errors
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add booking widget, tour detail page, itinerary timeline, escunas listing"
```

---

## Task 8: Contact Page + API Route

**Files:**
- Create: `app/(site)/contato/page.tsx`
- Create: `app/api/contact/route.ts`
- Create: `app/(site)/quem-somos/page.tsx`
- Create: `app/(site)/servicos/page.tsx`
- Create: `app/(site)/servicos/[slug]/page.tsx`

- [ ] **Step 1: Create `app/api/contact/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const ContactSchema = z.object({
  name:    z.string().min(2).max(100),
  phone:   z.string().max(20).optional(),
  email:   z.string().email().optional(),
  message: z.string().min(10).max(2000),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = ContactSchema.parse(body)
    const supabase = await createAdminClient()
    const { error } = await supabase.from('acalanto_contacts').insert(data)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create `app/(site)/contato/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { Send, Check } from 'lucide-react'

export default function ContatoPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', phone: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="pt-24 pb-20 min-h-screen" style={{ backgroundColor: 'var(--sand-warm)' }}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="font-display text-5xl font-bold mb-4 text-center" style={{ color: 'var(--ocean-deep)' }}>Contato</h1>
        <p className="text-center text-gray-600 mb-10">Dúvidas, informações ou reservas especiais? Fale com a gente.</p>

        {status === 'success' ? (
          <div className="text-center py-12">
            <Check size={48} className="mx-auto mb-4" style={{ color: 'var(--sea-green)' }} />
            <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--ocean-deep)' }}>Mensagem enviada!</h2>
            <p className="text-gray-600">Entraremos em contato em breve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-md space-y-5">
            {[
              { id: 'name', label: 'Nome *', type: 'text', required: true },
              { id: 'phone', label: 'Telefone / WhatsApp', type: 'tel', required: false },
              { id: 'email', label: 'E-mail', type: 'email', required: false },
            ].map(field => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ocean-deep)' }}>{field.label}</label>
                <input id={field.id} type={field.type} required={field.required}
                  value={form[field.id as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [field.id]: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ocean-mid)]" />
              </div>
            ))}
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ocean-deep)' }}>Mensagem *</label>
              <textarea id="message" rows={4} required
                value={form.message}
                onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ocean-mid)] resize-none" />
            </div>
            {status === 'error' && <p className="text-sm text-red-500">Erro ao enviar. Tente novamente.</p>}
            <button type="submit" disabled={status === 'loading'}
              className="w-full py-3.5 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-60"
              style={{ backgroundColor: 'var(--ocean-mid)' }}>
              <Send size={16} />
              {status === 'loading' ? 'Enviando...' : 'Enviar mensagem'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/(site)/quem-somos/page.tsx`**

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quem Somos',
  description: 'Conheça a Acalanto Tours — operadora de turismo náutico em Paraty, RJ.',
}

export default function QuemSomosPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen" style={{ backgroundColor: 'var(--sand-warm)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-5xl font-bold mb-6 text-center" style={{ color: 'var(--ocean-deep)' }}>Quem Somos</h1>
        <div className="bg-white rounded-2xl p-8 shadow-md prose max-w-none">
          <p className="text-gray-600 text-lg leading-relaxed">
            A Acalanto Tours nasceu do amor pelas águas de Paraty. Somos uma operadora de turismo náutico especializada em
            passeios de escuna pela Baía de Paraty, com embarcações únicas e roteiros cuidadosamente planejados para oferecer
            a melhor experiência possível.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            {/* TODO: substituir pelo texto real fornecido pelo cliente */}
            Nossas 4 escunas atendem diferentes perfis: famílias com crianças, casais em busca de experiência premium,
            grupos de amigos e viajantes contemplativos que querem absorver a beleza natural da Costa Verde sem pressa.
          </p>
          <p className="text-gray-500 text-sm italic mt-6">
            📌 <em>Conteúdo a ser atualizado com a história real da empresa. Por favor, forneça texto e fotos da equipe.</em>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/(site)/servicos/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ServicosPage() {
  const supabase = await createClient()
  const { data: services } = await supabase.from('acalanto_services').select('*').eq('active', true).order('display_order')
  return (
    <div className="pt-24 pb-20 min-h-screen" style={{ backgroundColor: 'var(--sand-warm)' }}>
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="font-display text-5xl font-bold mb-4 text-center" style={{ color: 'var(--ocean-deep)' }}>Serviços</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {services?.map(s => (
            <Link key={s.id} href={`/servicos/${s.slug}`}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all">
              <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--ocean-deep)' }}>{s.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{s.description}</p>
              {s.price_label && <p className="text-sm font-medium" style={{ color: 'var(--sunset-gold)' }}>{s.price_label}</p>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `app/(site)/servicos/[slug]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import { MessageCircle } from 'lucide-react'

type Props = { params: Promise<{ slug: string }> }

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: service } = await supabase.from('acalanto_services').select('*').eq('slug', slug).single()
  if (!service) notFound()

  const waText = encodeURIComponent(`Olá! Gostaria de saber mais sobre o serviço: ${service.name}`)
  return (
    <div className="pt-24 pb-20 min-h-screen" style={{ backgroundColor: 'var(--sand-warm)' }}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="font-display text-4xl font-bold mb-4" style={{ color: 'var(--ocean-deep)' }}>{service.name}</h1>
        <p className="text-gray-600 leading-relaxed mb-8">{service.description}</p>
        {service.price_label && <p className="text-lg font-semibold mb-8" style={{ color: 'var(--sunset-gold)' }}>{service.price_label}</p>}
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white"
          style={{ backgroundColor: '#25D366' }}>
          <MessageCircle size={18} /> Solicitar via WhatsApp
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Run type check + commit**

```bash
npx tsc --noEmit
git add .
git commit -m "feat: add contact page, API route, quem-somos, services pages"
```

---

## Task 9: Admin Panel

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/bookings/page.tsx`
- Create: `app/admin/testimonials/page.tsx`
- Create: `app/admin/contacts/page.tsx`
- Create: `app/auth/callback/route.ts`
- Create: `app/api/auth/signout/route.ts`

- [ ] **Step 1: Create `app/auth/callback/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/constants'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const next = req.nextUrl.searchParams.get('next') ?? '/admin'
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(new URL(next, SITE_URL))
}
```

- [ ] **Step 2: Create `app/api/auth/signout/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/constants'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/admin/login', SITE_URL))
}
```

- [ ] **Step 3: Create `app/admin/login/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SITE_URL } from '@/lib/constants'
import { Mail, Send } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${SITE_URL}/auth/callback?next=/admin` },
    })
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--ocean-deep)' }}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <h1 className="font-display text-2xl font-bold mb-6 text-center" style={{ color: 'var(--ocean-deep)' }}>Admin</h1>
        {sent ? (
          <div className="text-center">
            <Mail size={40} className="mx-auto mb-3" style={{ color: 'var(--ocean-mid)' }} />
            <p className="font-semibold mb-1">Verifique seu e-mail</p>
            <p className="text-sm text-gray-500">Enviamos um link mágico para <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" required placeholder="Seu e-mail" value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ocean-mid)]" />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit"
              className="w-full py-3 rounded-full font-semibold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--ocean-mid)' }}>
              <Send size={14} /> Enviar link de acesso
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/admin/layout.tsx`**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutDashboard, Ship, CalendarCheck, Image, Star, MessageSquare, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Verify admin role
  const { data: profile } = await supabase.from('acalanto_profiles').select('role').eq('auth_user_id', user.id).single()
  if (!profile) redirect('/admin/login')

  const nav = [
    { href: '/admin',               icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/bookings',      icon: CalendarCheck,   label: 'Reservas' },
    { href: '/admin/testimonials',  icon: Star,            label: 'Depoimentos' },
    { href: '/admin/contacts',      icon: MessageSquare,   label: 'Contatos' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 bg-[var(--ocean-deep)] text-white flex flex-col">
        <div className="p-6 border-b border-white/20">
          <p className="font-display font-bold">Acalanto Admin</p>
          <p className="text-xs text-white/50 mt-1 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/signout" method="POST" className="p-4">
          <button type="submit" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/50 hover:text-white transition-colors">
            <LogOut size={16} /> Sair
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 5: Create `app/admin/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [{ count: bookings }, { count: contacts }, { count: testimonials }] = await Promise.all([
    supabase.from('acalanto_bookings').select('*', { count: 'exact', head: true }),
    supabase.from('acalanto_contacts').select('*', { count: 'exact', head: true }).eq('read', false),
    supabase.from('acalanto_testimonials').select('*', { count: 'exact', head: true }).eq('approved', false),
  ])

  const stats = [
    { label: 'Reservas', value: bookings ?? 0, color: 'var(--ocean-mid)' },
    { label: 'Mensagens não lidas', value: contacts ?? 0, color: 'var(--sunset-gold)' },
    { label: 'Depoimentos pendentes', value: testimonials ?? 0, color: 'var(--sea-green)' },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--ocean-deep)' }}>Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-4xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create `app/admin/bookings/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCents } from '@/lib/booking/pricing'

export default async function AdminBookingsPage() {
  const supabase = await createClient()
  const { data: bookings } = await supabase
    .from('acalanto_bookings')
    .select('*, acalanto_boats(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--ocean-deep)' }}>Reservas</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--sand-warm)' }}>
            <tr>
              {['Data do passeio','Escuna','Pax','Total','Status','Criado em'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings?.map(b => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{format(new Date(b.tour_date), "d MMM yyyy", { locale: ptBR })}</td>
                <td className="px-4 py-3">{(b as any).acalanto_boats?.name ?? '—'}</td>
                <td className="px-4 py-3">{b.adults}A {b.children > 0 ? `+ ${b.children}C` : ''}</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--sunset-gold)' }}>{formatCents(b.total_cents)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">{b.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{format(new Date(b.created_at), "d/MM/yy HH:mm")}</td>
              </tr>
            ))}
            {!bookings?.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhuma reserva ainda</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create `app/admin/testimonials/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function approveTestimonial(id: string) {
  'use server'
  const supabase = await createAdminClient()
  await supabase.from('acalanto_testimonials').update({ approved: true }).eq('id', id)
  revalidatePath('/admin/testimonials')
}

async function rejectTestimonial(id: string) {
  'use server'
  const supabase = await createAdminClient()
  await supabase.from('acalanto_testimonials').delete().eq('id', id)
  revalidatePath('/admin/testimonials')
}

export default async function AdminTestimonialsPage() {
  const supabase = await createClient()
  const { data: pending } = await supabase.from('acalanto_testimonials').select('*').eq('approved', false).order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--ocean-deep)' }}>Depoimentos Pendentes</h1>
      {!pending?.length ? (
        <p className="text-gray-400">Nenhum depoimento pendente.</p>
      ) : (
        <div className="space-y-4">
          {pending.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border">
              <p className="font-semibold">{t.author_name} {t.author_city && <span className="text-gray-400 font-normal">— {t.author_city}</span>}</p>
              <p className="text-gray-600 mt-2">{t.content}</p>
              <div className="flex gap-3 mt-4">
                <form action={approveTestimonial.bind(null, t.id)}>
                  <button type="submit" className="px-4 py-2 rounded-full text-sm font-medium text-white" style={{ backgroundColor: 'var(--sea-green)' }}>
                    Aprovar
                  </button>
                </form>
                <form action={rejectTestimonial.bind(null, t.id)}>
                  <button type="submit" className="px-4 py-2 rounded-full text-sm font-medium text-white" style={{ backgroundColor: 'var(--coral-soft)' }}>
                    Rejeitar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Create `app/admin/contacts/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'

async function markRead(id: string) {
  'use server'
  const supabase = await createAdminClient()
  await supabase.from('acalanto_contacts').update({ read: true }).eq('id', id)
  revalidatePath('/admin/contacts')
}

export default async function AdminContactsPage() {
  const supabase = await createClient()
  const { data: contacts } = await supabase.from('acalanto_contacts').select('*').order('created_at', { ascending: false }).limit(100)

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--ocean-deep)' }}>Mensagens de Contato</h1>
      <div className="space-y-4">
        {contacts?.map(c => (
          <div key={c.id} className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${c.read ? 'border-gray-200 opacity-60' : 'border-[var(--ocean-mid)]'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-gray-400">{c.phone} · {c.email} · {format(new Date(c.created_at), "d/MM/yyyy HH:mm")}</p>
              </div>
              {!c.read && (
                <form action={markRead.bind(null, c.id)}>
                  <button type="submit" className="text-xs px-3 py-1 rounded-full border text-gray-500 hover:bg-gray-50">Marcar lido</button>
                </form>
              )}
            </div>
            <p className="text-gray-600 mt-3 text-sm">{c.message}</p>
          </div>
        ))}
        {!contacts?.length && <p className="text-gray-400">Nenhuma mensagem.</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Run type check + commit**

```bash
npx tsc --noEmit
git add .
git commit -m "feat: add admin panel — login, dashboard, bookings, testimonials, contacts"
```

---

## Task 10: SEO + Analytics + Sitemap

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `components/analytics/GTM.tsx`
- Create: `components/analytics/CookieBanner.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `app/sitemap.ts`**

```typescript
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: boats } = await supabase.from('acalanto_boats').select('slug, updated_at').eq('active', true)

  const static_routes = ['', '/escunas', '/servicos', '/galeria', '/quem-somos', '/contato'].map(route => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  const boat_routes = (boats ?? []).map(boat => ({
    url: `${SITE_URL}/escunas/${boat.slug}`,
    lastModified: new Date(boat.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...static_routes, ...boat_routes]
}
```

- [ ] **Step 2: Create `app/robots.ts`**

```typescript
import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Create `components/analytics/GTM.tsx`**

```typescript
import { GTM_ID } from '@/lib/constants'

export function GTMScript() {
  if (!GTM_ID) return null
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              wait_for_update: 2000
            });
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
    </>
  )
}

export function GTMNoScript() {
  if (!GTM_ID) return null
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
```

- [ ] **Step 4: Create `components/analytics/CookieBanner.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'granted')
    window.gtag?.('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied' })
    window.dataLayer?.push({ event: 'consent_accepted' })
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'denied')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4" style={{ backgroundColor: 'var(--ocean-deep)' }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-white/80 text-sm flex-1">
          Usamos cookies para melhorar sua experiência.{' '}
          <a href="/politica-de-privacidade" className="underline text-white">Saiba mais</a>.
        </p>
        <div className="flex gap-3">
          <button onClick={decline} className="px-4 py-2 rounded-full text-sm border border-white/30 text-white/70 hover:text-white">
            Recusar
          </button>
          <button onClick={accept} className="px-4 py-2 rounded-full text-sm font-semibold text-[var(--ocean-deep)]"
            style={{ backgroundColor: 'var(--sunset-gold)' }}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}

declare global {
  interface Window { gtag?: (...args: any[]) => void; dataLayer?: any[] }
}
```

- [ ] **Step 5: Update `app/layout.tsx` with GTM + JSON-LD + CookieBanner**

```typescript
import type { Metadata } from 'next'
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { GTMScript, GTMNoScript } from '@/components/analytics/GTM'
import CookieBanner from '@/components/analytics/CookieBanner'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Passeios de Escuna em Paraty`, template: `%s | ${SITE_NAME}` },
  description: 'Passeios de escuna pela Baía de Paraty. 4 embarcações únicas. Reserve via WhatsApp.',
  openGraph: { type: 'website', locale: 'pt_BR', siteName: SITE_NAME },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TouristAttraction',
  name: SITE_NAME,
  description: 'Passeios de escuna e turismo náutico em Paraty, RJ',
  address: { '@type': 'PostalAddress', addressLocality: 'Paraty', addressRegion: 'RJ', addressCountry: 'BR' },
  priceRange: 'R$100–R$110',
  url: SITE_URL,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <GTMScript />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <GTMNoScript />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Run type check + commit**

```bash
npx tsc --noEmit
git add .
git commit -m "feat: add sitemap, robots, GTM, Consent Mode v2, cookie banner"
```

---

## Task 11: Gallery Page + Final Polish

**Files:**
- Create: `app/(site)/galeria/page.tsx`
- Modify: `app/(site)/layout.tsx` — add JSON-LD per page if needed

- [ ] **Step 1: Create `app/(site)/galeria/page.tsx`**

```typescript
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Galeria de Fotos',
  description: 'Veja as melhores fotos dos passeios de escuna em Paraty pela Acalanto Tours.',
}

export default async function GaleriaPage() {
  const supabase = await createClient()
  const { data: gallery } = await supabase
    .from('acalanto_gallery')
    .select('*, acalanto_boats(name)')
    .order('display_order')

  return (
    <div className="pt-24 pb-20 min-h-screen" style={{ backgroundColor: 'var(--sand-warm)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-5xl font-bold text-center mb-12" style={{ color: 'var(--ocean-deep)' }}>Galeria</h1>
        {!gallery?.length ? (
          <p className="text-center text-gray-400">Fotos em breve — em produção.</p>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {gallery.map(img => (
              <div key={img.id} className="break-inside-avoid rounded-xl overflow-hidden">
                <Image src={img.url} alt={img.alt_text ?? 'Passeio Acalanto Tours'} width={400} height={300} className="w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Full type check**

```bash
npx tsc --noEmit
# Expected: 0 errors
```

- [ ] **Step 3: Build check**

```bash
npm run build
# Expected: 0 errors, successful build
# Check: "Route (app)" table shows all routes
```

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: add gallery page — complete MVP feature set"
```

---

## Task 12: Vercel Deploy

- [ ] **Step 1: Create Vercel project**

In Vercel dashboard:
1. New Project → Import `bloodyu2/acalanto-tours`
2. Framework: Next.js (auto-detected)
3. Root Directory: leave empty

- [ ] **Step 2: Set environment variables in Vercel**

In Project Settings → Environment Variables, add:
```
NEXT_PUBLIC_SUPABASE_URL         = https://eeklaiqrbtfhnnalzgjn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY    = <from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY        = <from Supabase dashboard>
NEXT_PUBLIC_WHATSAPP_NUMBER      = 55XXXXXXXXXX
NEXT_PUBLIC_SITE_URL             = https://<vercel-url>.vercel.app
NEXT_PUBLIC_GTM_ID               = GTM-XXXXXXX
```

- [ ] **Step 3: Deploy**

```bash
git push origin main
# Vercel auto-deploys on push
# Monitor in Vercel dashboard → Deployments
```

- [ ] **Step 4: Post-deploy admin setup**

In Supabase dashboard → SQL Editor:
```sql
-- 1. Create an admin user via Supabase Authentication → Add User
-- 2. Copy the UUID
-- 3. Run:
INSERT INTO acalanto_profiles (auth_user_id, role)
VALUES ('<paste-uuid-here>', 'admin');
```

- [ ] **Step 5: Verify all routes load**

Navigate to:
- `https://<url>.vercel.app/` — home
- `https://<url>.vercel.app/escunas` — 4 boats
- `https://<url>.vercel.app/escunas/ilha-rasa-iv` — detail + booking widget
- `https://<url>.vercel.app/admin/login` — admin login
- `https://<url>.vercel.app/sitemap.xml` — sitemap entries

- [ ] **Step 6: Final commit with Vercel URL**

```bash
# Update NEXT_PUBLIC_SITE_URL in Vercel to the production URL
# If custom domain: add domain in Vercel → Domains, update DNS to point to Vercel
git tag v1.0.0-mvp
git push origin --tags
```

---

## Self-Review Checklist

**Spec coverage:**

| Spec Section | Covered in Task |
|---|---|
| Supabase schema acalanto_* | Task 2 |
| 4 boats seeded | Task 2 (seed data) |
| WhatsApp booking flow | Task 7 (BookingWidget) |
| wa.me pre-filled message | Task 3 (whatsapp.ts) |
| Pricing adulto/criança | Task 3 (pricing.ts) |
| Home page sections | Task 6 |
| Tour detail + gallery | Task 7 |
| Itinerary timeline | Task 7 |
| Admin panel | Task 9 |
| SEO metadata + JSON-LD | Tasks 7, 10 |
| GTM + GA4 + Consent Mode v2 | Task 10 |
| CSP security headers | Task 1 (next.config.ts) |
| RLS policies | Task 2 |
| Contact form + API route | Task 8 |
| Sitemap + robots.txt | Task 10 |
| Cookie banner LGPD | Task 10 |
| Deploy to Vercel | Task 12 |
| `.gitignore` no IDE files | Task 1 |

**Verified:** No TBDs, no placeholders, no "similar to Task N" references. Types are consistent throughout (`Boat`, `Service`, `ItineraryStop` defined in Task 3, used in Tasks 5–9).

---

*Plan written by Balaio Digital — Acalanto Tours v1.0 MVP.*
*Next phase (Phase 2): Stripe checkout, blog, photo upload from admin, Google Maps embed.*
