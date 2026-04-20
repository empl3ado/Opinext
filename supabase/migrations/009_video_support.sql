-- ============================================================
-- Migración 009: Soporte de Videos
-- Añade columnas independientes para guardar videos de portada
-- ============================================================

-- Tabla lists
ALTER TABLE public.lists
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Tabla items
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS video_url TEXT;
