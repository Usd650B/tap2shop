-- ========================================
-- SHOPINPOCKET ADMIN DASHBOARD SETUP
-- Run this in your Supabase SQL Editor
-- ========================================

-- 1. Create the main tables (if they don't exist)
CREATE TABLE IF NOT EXISTS shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  contact_info TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#4F46E5',
  secondary_color TEXT DEFAULT '#7C3AED',
  accent_color TEXT DEFAULT '#10B981',
  font_style TEXT DEFAULT 'modern',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_contact TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Completed', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for Admin Access
-- Admins can view all data
CREATE POLICY "Admins can view all shops" ON shops FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email = 'admin@shopinpocket.co.tz')
  )
);

CREATE POLICY "Admins can view all products" ON products FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email = 'admin@shopinpocket.co.tz')
  )
);

CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email = 'admin@shopinpocket.co.tz')
  )
);

-- 4. Create admin helper function
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'email' = 'admin@shopinpocket.co.tz')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at
CREATE TRIGGER update_shops_updated_at 
  BEFORE UPDATE ON shops 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert sample data for testing (optional)
INSERT INTO shops (id, user_id, name, description, contact_info, slug) VALUES
  (gen_random_uuid(), gen_random_uuid(), 'Sample Shop', 'A sample shop for testing', 'sample@shop.com', 'sample-shop')
ON CONFLICT DO NOTHING;

INSERT INTO products (shop_id, name, price, description, stock) VALUES
  ((SELECT id FROM shops WHERE slug = 'sample-shop' LIMIT 1), 'Sample Product', 19.99, 'A sample product for testing', 100)
ON CONFLICT DO NOTHING;

INSERT INTO orders (product_id, customer_name, customer_contact, delivery_address, delivery_location, quantity, status) VALUES
  ((SELECT id FROM products WHERE name = 'Sample Product' LIMIT 1), 'John Doe', '+255123456789', '123 Main St', 'Dar es Salaam', 2, 'Completed')
ON CONFLICT DO NOTHING;

-- ========================================
-- SETUP COMPLETE!
-- Now update your .env.local with your Supabase credentials
-- ========================================
