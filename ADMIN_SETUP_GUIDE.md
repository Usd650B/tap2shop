# 🚀 Admin Dashboard Setup Guide

## ⚡ Quick Fix for Current Error

The error you're seeing is because the environment variables aren't set up. Here's how to fix it:

### Step 1: Create Your Environment File
```bash
# Copy the example file
cp env.example .env.local
```

### Step 2: Add Your Supabase Credentials
Edit `.env.local` and add your actual Supabase credentials:

```env
# Replace with your actual Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Replace with your actual Supabase anonymous key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Default admin email
ADMIN_EMAIL=admin@shopinpocket.co.tz
```

### Step 3: Get Your Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Go to Settings → API
5. Copy the **Project URL** and **anon public** key

### Step 4: Restart Your Development Server
```bash
npm run dev
```

## 🔐 Setting Up Admin Access

### Option 1: Use Default Admin Email
The system already includes `admin@shopinpocket.co.tz` as a default admin.

### Option 2: Create Custom Admin User
After setting up your environment, run this SQL in your Supabase SQL Editor:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

## 🎯 Access Your Admin Dashboard

1. **Start the server**: `npm run dev`
2. **Go to**: `http://localhost:3000/admin`
3. **Login with your admin credentials**

## 🛡️ Security Features

The admin dashboard includes:
- ✅ **Middleware protection** - Blocks unauthorized access
- ✅ **Role-based authentication** - Only admin users can access
- ✅ **Session validation** - Checks user login status
- ✅ **Development mode** - Works without Supabase for testing

## 🚨 If You Don't Have Supabase Yet

### Quick Supabase Setup:
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or Google
4. Create a new project
5. Wait for setup to complete
6. Copy your Project URL and anon key
7. Add them to `.env.local`

### Alternative: Development Mode
If you want to test the admin dashboard without Supabase:

1. **Create `.env.local`** with placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key
   ```

2. **The middleware will allow access** in development mode
3. **You'll see a warning** but the dashboard will be accessible

## 📱 Testing Access Control

### Test These Scenarios:
1. **Admin Access**: Should work ✅
2. **Regular User**: Should show "Access Denied" ❌
3. **Not Logged In**: Should redirect to login ❌

### URLs to Test:
- Admin Dashboard: `http://localhost:3000/admin`
- Admin Login: `http://localhost:3000/auth/login`
- Unauthorized: `http://localhost:3000/unauthorized`

## 🔧 Troubleshooting

### Error: "supabaseUrl is required"
**Fix**: Add environment variables to `.env.local`

### Error: "Access Denied"
**Fix**: Make sure your user has admin role in metadata

### Error: "Redirect loop"
**Fix**: Clear browser cookies and try again

## 📞 Need Help?

If you run into issues:
1. Check that `.env.local` exists and has correct values
2. Restart your development server
3. Clear browser cache
4. Verify your Supabase project is active

That's it! Your admin dashboard should now be working properly. 🎉
