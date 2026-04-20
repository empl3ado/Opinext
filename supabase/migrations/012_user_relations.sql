-- ============================================================
-- Migración 012: Relaciones de Usuario y Reportes Mejorados
-- ============================================================

-- 1. Crear tabla friendships (solicitudes y amigos)
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id1, user_id2),
  CHECK (user_id1 != user_id2)
);

-- 2. Crear tabla blocks (bloqueos)
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- 3. Modificar la tabla reports (Soporte para reportar perfiles y evidencias)
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_target_type_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_target_type_check CHECK (target_type IN ('list', 'list_item', 'item', 'comment', 'profile'));
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

-- 4. Crear el bucket en Storage para las imágenes de reportes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-proofs', 'report-proofs', false) 
ON CONFLICT (id) DO NOTHING;

-- 5. Trigger para updated_at de friendships
CREATE OR REPLACE FUNCTION public.handle_updated_at() 
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_friendships_updated_at ON public.friendships;
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
