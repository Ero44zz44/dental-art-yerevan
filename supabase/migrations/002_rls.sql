-- ============================================================
-- Row Level Security Policies
-- Run AFTER 001_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE staff          ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours  ENABLE ROW LEVEL SECURITY;
ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots  ENABLE ROW LEVEL SECURITY;

-- ── staff: public read, authenticated write ─────────────────
CREATE POLICY "public can read staff"
  ON staff FOR SELECT USING (true);

CREATE POLICY "admin can manage staff"
  ON staff FOR ALL USING (auth.role() = 'authenticated');

-- ── working_hours: public read, authenticated write ─────────
CREATE POLICY "public can read working_hours"
  ON working_hours FOR SELECT USING (true);

CREATE POLICY "admin can manage working_hours"
  ON working_hours FOR ALL USING (auth.role() = 'authenticated');

-- ── services: public read, authenticated write ──────────────
CREATE POLICY "public can read services"
  ON services FOR SELECT USING (true);

CREATE POLICY "admin can manage services"
  ON services FOR ALL USING (auth.role() = 'authenticated');

-- ── staff_services: public read, authenticated write ────────
CREATE POLICY "public can read staff_services"
  ON staff_services FOR SELECT USING (true);

CREATE POLICY "admin can manage staff_services"
  ON staff_services FOR ALL USING (auth.role() = 'authenticated');

-- ── bookings: anon can insert, authenticated can do all ─────
CREATE POLICY "anyone can create bookings"
  ON bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "admin can manage bookings"
  ON bookings FOR ALL USING (auth.role() = 'authenticated');

-- ── blocked_slots: authenticated only ───────────────────────
CREATE POLICY "admin can manage blocked_slots"
  ON blocked_slots FOR ALL USING (auth.role() = 'authenticated');
