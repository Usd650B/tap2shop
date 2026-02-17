-- Create Admin User Setup Script
-- Run this in your Supabase SQL Editor to create the initial admin user

-- Step 1: First, sign up for a Supabase account with your admin email
-- (This creates the user in auth.users table)

-- Step 2: After signing up, run this to update your user metadata to admin role
-- Replace 'your-admin-email@example.com' with your actual email

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE email = 'your-admin-email@example.com';

-- Step 3: Verify the admin role was set
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'role' as user_role
FROM auth.users 
WHERE email = 'your-admin-email@example.com';

-- Step 4: Add additional team members as admins (optional)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE email IN ('team-member-1@example.com', 'team-member-2@example.com');

-- Step 5: View all admin users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'role' as user_role
FROM auth.users 
WHERE raw_user_meta_data->>'role' = 'admin' OR email = 'admin@shopinpocket.co.tz';
