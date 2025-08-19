-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create an admin user (you can change these credentials)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'admin@lavallepadel.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Administrador"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Get the admin user ID and update our users table
INSERT INTO users (
  id,
  email,
  full_name,
  phone,
  is_admin,
  created_at,
  updated_at
) 
SELECT 
  au.id,
  au.email,
  'Administrador',
  '+54 9 341 000-0000',
  true,
  NOW(),
  NOW()
FROM auth.users au 
WHERE au.email = 'admin@lavallepadel.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
