# 🚀 QUICK SETUP GUIDE FOR SHOPINPOCKET ADMIN DASHBOARD

## ✅ Your Supabase Credentials Are Ready!
- **Project URL**: https://dcsgfkdertxphlslpcew.supabase.co
- **Admin Email**: SHOPINPOCKETKING@shopinpocket.co.tz

## 📋 Next Steps:

### 1. Create .env.local File
Create a file named `.env.local` in your project root with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://dcsgfkdertxphlslpcew.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjc2dma2RlcnR4cGhsc2xwY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjI1ODIsImV4cCI6MjA4NTkzODU4Mn0.9a9gzpM9sEmMQ9m0EKJhZQnb-16pfaAoymyzovSC6A4
ADMIN_EMAIL=SHOPINPOCKETKING@shopinpocket.co.tz
```

### 2. Set Up Database
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dcsgfkdertxphlslpcew
2. Navigate to **SQL Editor**
3. Copy and run the content from `database/complete_setup.sql`
4. Then run the content from `database/create_shopinpocketking.sql`

### 3. Test It
```bash
npm run dev
```
Go to: http://localhost:3000/admin

### 4. Login
- **Email**: SHOPINPOCKETKING@shopinpocket.co.tz
- **Password**: ShopInPocket1978

## 🎯 What You'll Get:
✅ Real user management
✅ Live shop data  
✅ Actual orders
✅ Working analytics
✅ Secure admin access

## 🚨 Important:
- The admin user needs to complete signup first
- Go to http://localhost:3000/auth/signup to create the account
- Then login at http://localhost:3000/auth/login
- Finally access admin at http://localhost:3000/admin
