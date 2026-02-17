# 🚨 Fix 401 Authentication Error

## Problem
You're seeing this error in the console:
```
Failed to load resource: the server responded with a status of 401 ()
Order response: Object
Order error: Object
```

## Root Cause
The application is using placeholder Supabase credentials instead of your actual database credentials.

## Solution: Set Up Environment Variables

### Step 1: Copy Supabase Credentials

Copy the contents from `env.example` to `.env.local`:

```bash
# Copy the example environment file
cp env.example .env.local
```

### Step 2: Verify Your .env.local File

Your `.env.local` file should contain:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dcsgfkdertxphlslpcew.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjc2dma2RlcnR4cGhsc2xwY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjI1ODIsImV4cCI6MjA0NTkzODU4Mn0.9a9gzpM9sEmMQ9m0EKJhZQnb-16pfaAoymyzovSC6A4

# Admin Configuration (Optional - for default admin email)
ADMIN_EMAIL=SHOPINPOCKETKING@shopinpocket.co.tz
```

### Step 3: Restart Your Application

After setting up `.env.local`:

1. **Stop your current application** (Ctrl+C in terminal)
2. **Restart the application**:
   ```bash
   npm run dev
   # or for production
   npm run build && npm start
   ```

### Step 4: Verify the Fix

Check the browser console - you should see:
- ✅ **No more 401 errors**
- ✅ **Successful database connections**
- ✅ **Orders working properly**

## Why This Happens

### Placeholder Credentials Warning
The application shows this warning when using placeholder credentials:
```
Using placeholder Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
```

### Authentication Flow
1. **Without .env.local** → Uses placeholder → 401 errors
2. **With .env.local** → Uses real credentials → Works properly

## Additional Checks

### ✅ Verify Environment Variables
Check that your environment variables are loaded:

```javascript
// In browser console
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### ✅ Test Database Connection
Test if Supabase is working:

```javascript
// In your application
import { supabase } from '@/lib/supabase'

// Test connection
const { data, error } = await supabase.from('shops').select('count').single()
console.log('DB Test:', { data, error })
```

## Deployment Specific

### Vercel/Netlify
Add environment variables in your deployment dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_EMAIL` (optional)

### Docker/Server
Set environment variables in your deployment environment:
```bash
export NEXT_PUBLIC_SUPABASE_URL=https://dcsgfkdertxphlslpcew.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Quick Fix Commands

```bash
# 1. Copy environment file
cp env.example .env.local

# 2. Restart development server
npm run dev

# 3. Or rebuild for production
npm run build
```

## Files Involved

- `.env.local` - **NEEDS TO BE CREATED** with your credentials
- `env.example` - Contains the correct Supabase credentials
- `src/lib/supabase.ts` - Supabase client configuration

## Result

After setting up `.env.local`:
- ✅ **No more 401 errors**
- ✅ **Orders work properly**
- ✅ **Customers can place orders**
- ✅ **Sellers can manage shops**
- ✅ **All features functional**

---

**🚨 IMPORTANT**: Never commit `.env.local` to git! It contains your secret database keys.
