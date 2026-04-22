-- ============================================================
-- Migración 014: Integración de Shop & Marketplace
-- ============================================================

-- 1. Actualizar roles en Profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'mod', 'seller'));

-- 2. Añadir campos comerciales a LISTS
ALTER TABLE public.lists 
ADD COLUMN IF NOT EXISTS is_commercial BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS commercial_type TEXT CHECK (commercial_type IN ('product', 'service')),
ADD COLUMN IF NOT EXISTS seller_status TEXT DEFAULT 'active' CHECK (seller_status IN ('active', 'inactive'));

-- 3. Añadir campos comerciales a ITEMS (Independientes)
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS is_commercial BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS commercial_type TEXT CHECK (commercial_type IN ('product', 'service')),
ADD COLUMN IF NOT EXISTS seller_status TEXT DEFAULT 'active' CHECK (seller_status IN ('active', 'inactive'));

-- 4. Tablas para CHAT (Sistema de Mensajería)
CREATE TABLE public.conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Para evitar duplicados en espejo
);

CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabla de SUSCRIPCIONES de Vendedores (Pago Fijo)
CREATE TABLE public.seller_subscriptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. RLS (Row Level Security)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para Conversations
CREATE POLICY "Users can see their own conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas para Messages
CREATE POLICY "Users can see messages in their conversations" 
ON public.messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE id = conversation_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
));

CREATE POLICY "Users can send messages in their conversations" 
ON public.messages FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Políticas para Subscriptions (Vendedores ven las suyas, Admins ven todas)
CREATE POLICY "Users can see their own subscriptions" 
ON public.seller_subscriptions FOR SELECT 
USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 7. Índices
CREATE INDEX idx_conversations_user1 ON public.conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON public.conversations(user2_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_seller_subs_user ON public.seller_subscriptions(user_id);
