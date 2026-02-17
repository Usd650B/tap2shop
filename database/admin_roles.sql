-- Add admin role support to users table
-- This will be used to identify admin users

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_email = 'admin@shopinpocket.co.tz' OR
         EXISTS (
           SELECT 1 FROM auth.users 
           WHERE email = user_email 
           AND raw_user_meta_data->>'role' = 'admin'
         );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for admin users
CREATE OR REPLACE VIEW admin_users AS
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin' OR email = 'admin@shopinpocket.co.tz';

-- Grant necessary permissions
GRANT SELECT ON admin_users TO authenticated;
GRANT SELECT ON admin_users TO service_role;

-- Create RLS policy for admin-only operations
-- This can be used in other policies to check admin access
CREATE POLICY "Admin access" ON auth.users
  FOR ALL USING (is_admin(auth.email()));

-- Add helpful comment
COMMENT ON FUNCTION is_admin(TEXT) IS 'Checks if a user has admin privileges based on email or metadata role';
