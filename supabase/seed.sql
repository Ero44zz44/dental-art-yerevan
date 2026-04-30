-- ============================================================
-- Seed Data
-- Run AFTER 002_rls.sql
-- ============================================================

-- ── Insert staff ────────────────────────────────────────────
INSERT INTO staff (id, name, email, bio) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'Dr. Armen Hakobyan',
   'armen@dental-art.am',
   'Ատամնաբուժության ոլորտում ավելի քան 15 տարվա փորձ: Իմպլանտոլոգիայի և գեղագիտական ատամնաբուժության մասնագետ:'),
  ('22222222-2222-2222-2222-222222222222',
   'Dr. Lusine Petrosyan',
   'lusine@dental-art.am',
   'Կոսմետիկ և մեխանիկական ատամնաբուժության մասնագետ, 10 տարվա փորձ:');

-- ── Working hours for Dr. Armen (Mon–Fri 09–18, Sat 10–15, Sun off) ─
-- day_of_week: 0=Sunday, 1=Monday ... 6=Saturday
INSERT INTO working_hours (staff_id, day_of_week, start_time, end_time, is_working) VALUES
  ('11111111-1111-1111-1111-111111111111', 0, '09:00', '18:00', FALSE), -- Sun off
  ('11111111-1111-1111-1111-111111111111', 1, '09:00', '18:00', TRUE),  -- Mon
  ('11111111-1111-1111-1111-111111111111', 2, '09:00', '18:00', TRUE),  -- Tue
  ('11111111-1111-1111-1111-111111111111', 3, '09:00', '18:00', TRUE),  -- Wed
  ('11111111-1111-1111-1111-111111111111', 4, '09:00', '18:00', TRUE),  -- Thu
  ('11111111-1111-1111-1111-111111111111', 5, '09:00', '18:00', TRUE),  -- Fri
  ('11111111-1111-1111-1111-111111111111', 6, '10:00', '15:00', TRUE);  -- Sat

-- ── Working hours for Dr. Lusine (Mon–Sat 11–19, Sun off) ─
INSERT INTO working_hours (staff_id, day_of_week, start_time, end_time, is_working) VALUES
  ('22222222-2222-2222-2222-222222222222', 0, '11:00', '19:00', FALSE), -- Sun off
  ('22222222-2222-2222-2222-222222222222', 1, '11:00', '19:00', TRUE),  -- Mon
  ('22222222-2222-2222-2222-222222222222', 2, '11:00', '19:00', TRUE),  -- Tue
  ('22222222-2222-2222-2222-222222222222', 3, '11:00', '19:00', TRUE),  -- Wed
  ('22222222-2222-2222-2222-222222222222', 4, '11:00', '19:00', TRUE),  -- Thu
  ('22222222-2222-2222-2222-222222222222', 5, '11:00', '19:00', TRUE),  -- Fri
  ('22222222-2222-2222-2222-222222222222', 6, '11:00', '19:00', TRUE);  -- Sat

-- ── Insert services ─────────────────────────────────────────
INSERT INTO services (id, name, duration_minutes, price, description) VALUES
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Teeth Cleaning',
   45, 15000,
   'Professional oral hygiene cleaning to prevent gum disease and maintain oral health.'),
  ('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Consultation',
   30, 5000,
   'Initial examination and consultation with one of our specialists.'),
  ('cccc3333-cccc-cccc-cccc-cccccccccccc',
   'Implant Installation',
   90, 250000,
   'Permanent dental implant that looks, feels and functions like a natural tooth.');

-- ── Assign services to staff ────────────────────────────────
-- Both dentists: Teeth Cleaning + Consultation
INSERT INTO staff_services (staff_id, service_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), -- Armen → Cleaning
  ('11111111-1111-1111-1111-111111111111', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), -- Armen → Consultation
  ('11111111-1111-1111-1111-111111111111', 'cccc3333-cccc-cccc-cccc-cccccccccccc'), -- Armen → Implant
  ('22222222-2222-2222-2222-222222222222', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), -- Lusine → Cleaning
  ('22222222-2222-2222-2222-222222222222', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); -- Lusine → Consultation
