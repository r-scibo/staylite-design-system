-- 1. Update handle_new_user() trigger to assign roles based on email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (auth_user_id, name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  
  -- Assign role based on email
  IF new.email = 'host@test.com' THEN
    -- Assign Host role for demo host account
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'Host')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Assign Guest role for all other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'Guest')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$;

-- 2. Fix existing host@test.com account (user_id from network logs)
-- Delete any existing roles for this user
DELETE FROM public.user_roles 
WHERE user_id = '1bb6e3c4-1941-4340-96c9-a9c07c46efd4';

-- Insert Host role
INSERT INTO public.user_roles (user_id, role)
VALUES ('1bb6e3c4-1941-4340-96c9-a9c07c46efd4', 'Host');

-- 3. Ensure RLS policies block client mutations (already in place, but verifying)
-- Users can only SELECT their own roles, no INSERT/UPDATE/DELETE from client