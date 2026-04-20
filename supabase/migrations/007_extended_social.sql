-- ============================================================
-- Migración 007: Módulo Social Extendido
-- Añade texto y fotos a las reseñas (ratings) y permite likes
-- en comentarios y reseñas.
-- ============================================================

-- 1. Ampliar la tabla de ratings (reseñas)
ALTER TABLE public.ratings 
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Modificar restricciones de target_type en la tabla votes
-- Primero intentamos eliminar la restricción existente si tiene el nombre por defecto
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_target_type_check;

-- Luego añadimos la nueva restricción que incluye 'comment' y 'rating'
ALTER TABLE public.votes ADD CONSTRAINT votes_target_type_check 
  CHECK (target_type IN ('list_item', 'item', 'comment', 'rating'));

-- 3. Modificar restricciones de target_type en la tabla reports
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_target_type_check;

ALTER TABLE public.reports ADD CONSTRAINT reports_target_type_check 
  CHECK (target_type IN ('list', 'list_item', 'item', 'comment', 'rating'));
