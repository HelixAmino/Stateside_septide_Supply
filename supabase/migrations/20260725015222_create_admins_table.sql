/*
# Create admins table

1. New Tables
   - `admins`
     - `id` (uuid, primary key)
     - `email` (text, unique, not null) - the admin's email used for access checks
     - `created_at` (timestamptz)
2. Security
   - Enable RLS on `admins`.
   - Allow anon + authenticated to SELECT (the frontend checks if a logged-in user's email is in this table).
   - Only service role can INSERT/UPDATE/DELETE (no client-side writes).
*/

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_can_read_admins" ON admins;
CREATE POLICY "anyone_can_read_admins" ON admins FOR SELECT
  TO anon, authenticated USING (true);
