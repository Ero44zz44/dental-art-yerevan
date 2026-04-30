-- ============================================================
-- Dental Art Yerevan — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── staff ──────────────────────────────────────────────────
CREATE TABLE staff (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  photo_url  TEXT,
  email      TEXT NOT NULL UNIQUE,
  bio        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── working_hours ──────────────────────────────────────────
-- day_of_week: 0=Sunday, 1=Monday … 6=Saturday
CREATE TABLE working_hours (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id     UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  is_working   BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (staff_id, day_of_week)
);

-- ── services ───────────────────────────────────────────────
CREATE TABLE services (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price            INTEGER NOT NULL,   -- AMD
  description      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── staff_services (junction) ──────────────────────────────
CREATE TABLE staff_services (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id   UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE (staff_id, service_id)
);

-- ── bookings ───────────────────────────────────────────────
CREATE TABLE bookings (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id       UUID REFERENCES staff(id) ON DELETE SET NULL,
  service_id     UUID REFERENCES services(id) ON DELETE SET NULL,
  customer_name  TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  start_time     TIMESTAMPTZ NOT NULL,
  end_time       TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'confirmed'
                   CHECK (status IN ('confirmed','cancelled')),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── blocked_slots ──────────────────────────────────────────
CREATE TABLE blocked_slots (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id   UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time   TIMESTAMPTZ NOT NULL,
  reason     TEXT
);
