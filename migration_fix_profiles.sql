-- 1. Sync fixes: Insert missing profiles for users who signed up but have no profile
-- This fixes the "Foreign Key Violation" because transactions rely on profiles existing.
INSERT INTO public.profiles (id, full_name, email, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Usuario sin Nombre'), 
    email, 
    'buyer'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Ensure the trigger is robust for FUTURE users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Nuevo Usuario'), 
    new.email,
    'buyer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
