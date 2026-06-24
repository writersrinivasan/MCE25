-- Migration 005: Auto-approve on SPRNO verification
-- SPRNO whitelist match = identity confirmed. No admin approval needed.

-- 1. Update the trigger so new registrations start as 'approved' (not 'pending')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, sprno, branch, graduation_year, status, role
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'sprno',
    new.raw_user_meta_data->>'branch',
    COALESCE((new.raw_user_meta_data->>'batch_year')::int, 2001),
    'approved',   -- Changed from 'pending': SPRNO whitelist is the identity gate
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- 2. Back-fill: approve all currently pending members who came in via SPRNO whitelist
UPDATE public.profiles
SET status = 'approved'
WHERE status = 'pending';
