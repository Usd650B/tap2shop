-- Create tables for Tap2shop MVP

-- Shops table
CREATE TABLE shops (
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

-- Products table
CREATE TABLE products (
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

-- Orders table
CREATE TABLE orders (
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

-- Create indexes for better performance
CREATE INDEX idx_shops_user_id ON shops(user_id);
CREATE INDEX idx_shops_slug ON shops(slug);
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Enable Row Level Security
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shops
CREATE POLICY "Users can view their own shop" ON shops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shop" ON shops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shop" ON shops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view shop by slug" ON shops FOR SELECT USING (true);

-- RLS Policies for products
CREATE POLICY "Users can view products from their shop" ON products FOR SELECT USING (EXISTS (
  SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.user_id = auth.uid()
));
CREATE POLICY "Users can insert products for their shop" ON products FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM shops WHERE shops.id = shop_id AND shops.user_id = auth.uid()
));
CREATE POLICY "Users can update products from their shop" ON products FOR UPDATE USING (EXISTS (
  SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.user_id = auth.uid()
));
CREATE POLICY "Users can delete products from their shop" ON products FOR DELETE USING (EXISTS (
  SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.user_id = auth.uid()
));
CREATE POLICY "Anyone can view products for public shops" ON products FOR SELECT USING (true);

-- RLS Policies for orders
CREATE POLICY "Users can view orders for their products" ON orders FOR SELECT USING (EXISTS (
  SELECT 1 FROM products 
  JOIN shops ON shops.id = products.shop_id 
  WHERE products.id = orders.product_id AND shops.user_id = auth.uid()
));
CREATE POLICY "Users can update orders for their products" ON orders FOR UPDATE USING (EXISTS (
  SELECT 1 FROM products 
  JOIN shops ON shops.id = products.shop_id 
  WHERE products.id = orders.product_id AND shops.user_id = auth.uid()
));
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
