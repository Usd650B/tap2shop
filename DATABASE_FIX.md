# Database RLS Fix for Order Management

## Problem
The application is showing this error:
```
Error: new row violates row-level security policy for table "orders"
```

## Root Cause
The Row Level Security (RLS) policies for the `orders` table are incomplete:
1. Missing policies for customers to update their own orders (for confirming receipt)
2. Missing new order statuses and timestamp fields
3. Inadequate customer order access policies

## Solution

### Step 1: Apply Database Schema Updates

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Add missing columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE;

-- Update the status constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Accepted', 'Delivered', 'Received', 'Completed', 'Rejected'));

-- Add missing index
CREATE INDEX IF NOT EXISTS idx_orders_customer_contact ON orders(customer_contact);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view orders for their products" ON orders;
DROP POLICY IF EXISTS "Users can update orders for their products" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

-- Create new RLS policies for orders
-- Sellers can view orders for their products
CREATE POLICY "Sellers can view orders for their products" ON orders FOR SELECT USING (EXISTS (
  SELECT 1 FROM products 
  JOIN shops ON shops.id = products.shop_id 
  WHERE products.id = orders.product_id AND shops.user_id = auth.uid()
));

-- Sellers can update orders for their products
CREATE POLICY "Sellers can update orders for their products" ON orders FOR UPDATE USING (EXISTS (
  SELECT 1 FROM products 
  JOIN shops ON shops.id = products.shop_id 
  WHERE products.id = orders.product_id AND shops.user_id = auth.uid()
));

-- Customers can view their own orders (by customer_contact)
CREATE POLICY "Customers can view their own orders" ON orders FOR SELECT USING (
  customer_contact = auth.email() OR 
  customer_contact = COALESCE(auth.jwt()->>'phone', '') OR
  customer_contact = COALESCE(auth.jwt()->>'username', '') OR
  customer_contact = COALESCE(auth.jwt()->>'full_name', '')
);

-- Customers can update their own orders (for confirming receipt)
CREATE POLICY "Customers can update their own orders" ON orders FOR UPDATE USING (
  customer_contact = auth.email() OR 
  customer_contact = COALESCE(auth.jwt()->>'phone', '') OR
  customer_contact = COALESCE(auth.jwt()->>'username', '') OR
  customer_contact = COALESCE(auth.jwt()->>'full_name', '')
);

-- Anyone can insert orders (for placing orders)
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
```

### Step 2: Verify the Fix

After applying the SQL changes:

1. **Test Order Placement**: Try placing a new order as a customer
2. **Test Order Viewing**: Check if customers can see their orders in the dashboard
3. **Test Order Confirmation**: Try confirming receipt as a customer
4. **Test Seller Actions**: Verify sellers can still manage their orders

### What These Changes Fix

#### ✅ Customer Order Access
- Customers can now view orders using any contact method (email, phone, username)
- Flexible matching prevents "order not found" issues
- Multiple contact methods supported

#### ✅ Order Confirmation
- Customers can update order status to "Received"
- Receipt confirmation now works properly
- No more RLS policy violations

#### ✅ Seller Functionality
- Sellers can still view and manage orders for their products
- All existing seller functionality preserved
- No breaking changes

#### ✅ Database Schema
- New timestamp fields (`delivered_at`, `received_at`) added
- All order statuses supported
- Proper indexes for performance

### Alternative: Use Supabase Dashboard

If you prefer using the Supabase Dashboard:

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Paste and run the SQL commands above
4. Verify success in the console output

### Verification

After applying these changes, the error should be resolved and:
- ✅ Customers can place orders
- ✅ Customers can view their orders
- ✅ Customers can confirm product receipt
- ✅ Sellers can manage orders
- ✅ All order statuses work correctly

## Files Updated

- `database/schema.sql` - Updated with complete RLS policies
- `database/fix_rls_policies.sql` - Migration script
- `database/schema_updated.sql` - Complete updated schema

The updated schema file (`database/schema.sql`) now contains the complete and correct RLS policies.
