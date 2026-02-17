-- ========================================
-- CREATE ADMIN USER SCRIPT
-- Run this in your Supabase SQL Editor
-- ========================================

-- Option 1: Update existing user to admin (recommended)
-- Replace 'your-email@example.com' with your actual email
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- Option 2: Create new admin user (if you don't have one yet)
-- This creates a user that will need to complete email verification
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_user_meta_data,
  phone,
  phone_confirmed_at,
  email_change,
  phone_change,
  recovery_token
) VALUES (
  (SELECT id FROM auth.instances LIMIT 1),
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@shopinpocket.co.tz',
  'placeholder-hash', -- This will be replaced during signup
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"role": "admin"}'::jsonb,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (email) DO NOTHING;

-- Option 3: Check if user is admin
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'role' as user_role,
  CASE 
    WHEN raw_user_meta_data->>'role' = 'admin' OR email = 'admin@shopinpocket.co.tz' 
    THEN '✅ ADMIN' 
    ELSE '❌ NOT ADMIN' 
  END as admin_status
FROM auth.users 
WHERE email = 'your-email@example.com' OR email = 'admin@shopinpocket.co.tz';

-- ========================================
-- NEXT STEPS:
-- 1. Update your .env.local with Supabase credentials
-- 2. Restart your development server
-- 3. Go to http://localhost:3000/admin
-- 4. Login with your admin credentials
-- ========================================
