-- ============================================================
-- OPINEXT — Add birth_date to profiles
-- ============================================================

-- 1. Add birth_date column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN birth_date DATE;

-- 2. Update the trigger function to capture birth_date during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, birth_date)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4)
    ),
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name' -- For Google OAuth
    ),
    new.raw_user_meta_data->>'avatar_url', -- For Google OAuth
    (new.raw_user_meta_data->>'birth_date')::DATE
  );
  RETURN new;
END;
$$;
