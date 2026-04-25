-- Migración 015: Añade video_url a list_items
ALTER TABLE public.list_items
ADD COLUMN IF NOT EXISTS video_url TEXT;
