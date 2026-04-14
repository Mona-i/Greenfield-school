-- ============================================================
-- Greenfield Secondary School — Supabase SQL Schema
-- Run this entire script in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================================

-- ── 1. STUDENTS TABLE ──
CREATE TABLE IF NOT EXISTS students (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        TEXT NOT NULL,
  admission_number TEXT UNIQUE NOT NULL,
  class            TEXT NOT NULL,         -- e.g. 'JSS1A', 'SSS3B'
  gender           TEXT,
  date_of_birth    DATE,
  guardian_name    TEXT,
  guardian_phone   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. STAFF TABLE ──
CREATE TABLE IF NOT EXISTS staff (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  staff_id   TEXT UNIQUE NOT NULL,
  role       TEXT NOT NULL,               -- e.g. 'Teacher', 'Admin', 'Principal'
  subject    TEXT,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. ANNOUNCEMENTS TABLE ──
CREATE TABLE IF NOT EXISTS announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  body       TEXT,
  is_public  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. CONTACT MESSAGES TABLE ──
CREATE TABLE IF NOT EXISTS contact_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name  TEXT NOT NULL,
  email        TEXT NOT NULL,
  message      TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. RESULTS TABLE ──
CREATE TABLE IF NOT EXISTS results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject    TEXT NOT NULL,
  term       TEXT NOT NULL,               -- e.g. 'First Term 2024/2025'
  score      NUMERIC(5,2),
  grade      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff            ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE results          ENABLE ROW LEVEL SECURITY;

-- ── HELPER: a custom role column we will store in auth.users metadata ──
-- When creating a user via Supabase Auth, set raw_user_meta_data like:
-- { "role": "student", "student_id": "<uuid>" }
-- { "role": "staff",   "subject": "Mathematics" }
-- { "role": "admin" }

-- ── ANNOUNCEMENTS policies ──

-- Public can read announcements where is_public = true
CREATE POLICY "Public read public announcements"
  ON announcements FOR SELECT
  USING (is_public = TRUE);

-- Staff and admins can read all announcements
CREATE POLICY "Staff read all announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') IN ('staff', 'admin')
    OR (auth.jwt()->>'role' = 'student' AND is_public = TRUE)
  );

-- Only admins can insert/update/delete announcements
CREATE POLICY "Admin manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING ( (auth.jwt() ->> 'role') = 'admin' )
  WITH CHECK ( (auth.jwt() ->> 'role') = 'admin' );

-- ── CONTACT MESSAGES policies ──

-- Anyone (including unauthenticated) can insert a contact message
CREATE POLICY "Anyone can submit contact message"
  ON contact_messages FOR INSERT
  WITH CHECK (TRUE);

-- Only admins can read contact messages
CREATE POLICY "Admin reads contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING ( (auth.jwt() ->> 'role') = 'admin' );

-- ── RESULTS policies ──

-- Students can only read their own results
CREATE POLICY "Student reads own results"
  ON results FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'student'
    AND student_id::text = (auth.jwt() -> 'user_metadata' ->> 'student_id')
  );

-- Staff can read all results
CREATE POLICY "Staff reads all results"
  ON results FOR SELECT
  TO authenticated
  USING ( (auth.jwt() ->> 'role') IN ('staff', 'admin') );

-- Staff can only insert results for their own subject
CREATE POLICY "Staff inserts own subject results"
  ON results FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'staff'
    AND subject = (auth.jwt() -> 'user_metadata' ->> 'subject')
  );

-- Staff can only update results for their own subject
CREATE POLICY "Staff updates own subject results"
  ON results FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'staff'
    AND subject = (auth.jwt() -> 'user_metadata' ->> 'subject')
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'staff'
    AND subject = (auth.jwt() -> 'user_metadata' ->> 'subject')
  );

-- Admins have full access to results
CREATE POLICY "Admin full access results"
  ON results FOR ALL
  TO authenticated
  USING ( (auth.jwt() ->> 'role') = 'admin' )
  WITH CHECK ( (auth.jwt() ->> 'role') = 'admin' );

-- ── STUDENTS policies ──

-- Students can read only their own record
CREATE POLICY "Student reads own record"
  ON students FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'student'
    AND id::text = (auth.jwt() -> 'user_metadata' ->> 'student_id')
  );

-- Staff and admins can read all student records
CREATE POLICY "Staff reads all students"
  ON students FOR SELECT
  TO authenticated
  USING ( (auth.jwt() ->> 'role') IN ('staff', 'admin') );

-- Only admins can insert/update/delete student records
CREATE POLICY "Admin manages students"
  ON students FOR ALL
  TO authenticated
  USING ( (auth.jwt() ->> 'role') = 'admin' )
  WITH CHECK ( (auth.jwt() ->> 'role') = 'admin' );

-- ── STAFF TABLE policies ──

-- Staff can read their own record; admins read all
CREATE POLICY "Staff reads own record"
  ON staff FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR email = auth.email()
  );

-- Only admins can manage staff records
CREATE POLICY "Admin manages staff"
  ON staff FOR ALL
  TO authenticated
  USING ( (auth.jwt() ->> 'role') = 'admin' )
  WITH CHECK ( (auth.jwt() ->> 'role') = 'admin' );

-- ============================================================
-- SAMPLE SEED DATA (optional — for testing)
-- ============================================================

INSERT INTO announcements (title, body, is_public) VALUES
  ('First Term Examinations Begin 18th November', 'All classes from JSS1 to SSS3 are reminded that first term examinations commence on Monday 18th November 2024. Students should collect their timetables from the Admin Office.', TRUE),
  ('JSS1 Admission Forms Available', 'Application forms for JSS1 admission into the 2025/2026 session are now available at the Admin Office. Deadline: 30th October 2024.', TRUE),
  ('Inter-House Sports Day — 9th November', 'The annual Inter-House Sports Competition will hold on Saturday 9th November 2024 at the school sports field. Parents and guardians are warmly invited.', TRUE),
  ('Staff Salary for October Processed', 'This announcement is for staff only — October 2024 salaries have been processed and credited.', FALSE);
