-- ========================================
-- CREATE SHOPINPOCKETKING ADMIN USER
-- Run this in your Supabase SQL Editor
-- ========================================

-- First, let's create the admin user with the correct email
-- This will create a user that needs to complete signup
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
  'SHOPINPOCKETKING@shopinpocket.co.tz',
  '$2b$12$placeholder.hash.will.be.replaced.during.signup',
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"role": "admin", "name": "SHOPINPOCKETKING"}'::jsonb,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (email) DO UPDATE SET
  raw_user_meta_data = jsonb_set(
    COALESCE(auth.users.raw_user_meta_data, '{}'),
    '{role}',
    '"admin"'
  );

-- Alternative: If you already have a user, just update their role
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE email = 'SHOPINPOCKETKING@shopinpocket.co.tz';

-- Verify the admin user was created
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'role' as user_role,
  CASE 
    WHEN raw_user_meta_data->>'role' = 'admin' OR email = 'SHOPINPOCKETKING@shopinpocket.co.tz' 
    THEN '✅ ADMIN ACCESS GRANTED' 
    ELSE '❌ NOT ADMIN' 
  END as admin_status
FROM auth.users 
WHERE email = 'SHOPINPOCKETKING@shopinpocket.co.tz';

-- ========================================
-- NEXT STEPS:
-- 1. The user SHOPINPOCKETKING@shopinpocket.co.tz now has admin privileges
-- 2. They need to complete signup at: http://localhost:3000/auth/signup
-- 3. Or you can use the "Invite" feature in Supabase Authentication
-- 4. Once signed up, they can login at: http://localhost:3000/auth/login
-- 5. Then access admin dashboard at: http://localhost:3000/admin
-- ========================================
