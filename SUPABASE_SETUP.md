# Supabase Setup Guide for Admin Dashboard

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or Google
4. Create a new project:
   - **Project Name**: `shopinpocket-admin`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
5. Wait for project to be created (2-3 minutes)

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public** key: `eyJ...`

### 3. Update Your Environment
Create/update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Database Schema
1. Go to **SQL Editor** in Supabase
2. Run the schema from `database/schema.sql`
3. Run the admin roles from `database/admin_roles.sql`

### 5. Create Admin User
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Create admin user with email: `admin@shopinpocket.co.tz`
4. Or run this in SQL Editor:
```sql
-- Insert admin user (they'll need to complete signup)
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
  raw_user_meta_data
) VALUES (
  'your-instance-id',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@shopinpocket.co.tz',
  'encrypted-password-placeholder',
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"role": "admin"}'::jsonb
);
```

### 6. Test Your Setup
1. Restart your dev server: `npm run dev`
2. Go to: `http://localhost:3000/admin`
3. Login with your admin credentials

## 🔐 Alternative: Use Existing Project

If you already have a Supabase project:

1. **Add the tables** from `database/schema.sql`
2. **Add admin functions** from `database/admin_roles.sql`
3. **Update your `.env.local`** with your existing credentials
4. **Create admin user** or update existing user role:
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE email = 'your-admin-email@example.com';
```

## 🎯 What This Enables

✅ **Real user management** - See actual shop owners
✅ **Live shop data** - Real shop information  
✅ **Actual products** - Real product listings
✅ **Real orders** - Live order data
✅ **Accurate analytics** - Real statistics
✅ **Working authentication** - Proper admin access control

## 🚨 Important Notes

- **Keep your keys secret** - Never commit `.env.local` to git
- **Use service role keys** for admin operations (not anon keys)
- **Set up RLS policies** to protect your data
- **Test thoroughly** before going to production
