-- ============================================================
-- Migración 013: Soporte para rol Moderador (mod)
-- ============================================================

-- Modificamos la restricción de la columna role para permitir administradores, usuarios y mods.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'mod'));
