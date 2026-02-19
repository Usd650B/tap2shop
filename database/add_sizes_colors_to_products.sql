-- Add sizes and colors columns to products table
-- Migration script for SIP platform

-- Add sizes column (array of text)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}';

-- Add colors column (array of text)  
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sizes ON products USING GIN (sizes);
CREATE INDEX IF NOT EXISTS idx_products_colors ON products USING GIN (colors);

-- Update existing products to have empty arrays
UPDATE products 
SET sizes = '{}', colors = '{}'
WHERE sizes IS NULL OR colors IS NULL;

-- Add comment to document the new columns
COMMENT ON COLUMN products.sizes IS 'Array of available sizes for the product (e.g., ["S", "M", "L", "XL"])';
COMMENT ON COLUMN products.colors IS 'Array of available colors for the product (e.g., ["Red", "Blue", "Black"])';
