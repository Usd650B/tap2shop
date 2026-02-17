-- Fix RLS policies for orders table
-- This migration fixes the "new row violates row-level security policy" error

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view orders for their products" ON orders;
DROP POLICY IF EXISTS "Users can update orders for their products" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

-- Add missing columns to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE;

-- Update the status check constraint to include new statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Accepted', 'Delivered', 'Received', 'Completed', 'Rejected'));

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

-- Add index for customer_contact to improve query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_contact ON orders(customer_contact);
