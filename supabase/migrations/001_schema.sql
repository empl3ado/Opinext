-- ============================================================
-- OPINEXT — Schema completo
-- ============================================================

-- 0. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (extiende auth.users)
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CATEGORIES
CREATE TABLE public.categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT UNIQUE NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  icon_url   TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SUBCATEGORIES
CREATE TABLE public.subcategories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);

-- 4. LISTS
CREATE TABLE public.lists (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  cover_image_url  TEXT,
  category_id      UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id   UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  location         TEXT,
  is_collaborative BOOLEAN NOT NULL DEFAULT false,
  is_published     BOOLEAN NOT NULL DEFAULT true,
  view_count       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. LIST_ITEMS (ítems dentro de una lista)
CREATE TABLE public.list_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id      UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT,
  position     INT NOT NULL DEFAULT 0,
  avg_rating   NUMERIC(2,1) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  upvotes      INT NOT NULL DEFAULT 0,
  downvotes    INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. ITEMS (ítems independientes)
CREATE TABLE public.items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  content        TEXT,
  image_url      TEXT,
  category_id    UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  location       TEXT,
  avg_rating     NUMERIC(2,1) NOT NULL DEFAULT 0,
  rating_count   INT NOT NULL DEFAULT 0,
  upvotes        INT NOT NULL DEFAULT 0,
  downvotes      INT NOT NULL DEFAULT 0,
  view_count     INT NOT NULL DEFAULT 0,
  is_published   BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. TAGS
CREATE TABLE public.tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. LIST_TAGS (M:N)
CREATE TABLE public.list_tags (
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (list_id, tag_id)
);

-- 9. ITEM_TAGS (M:N)
CREATE TABLE public.item_tags (
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- 10. RATINGS (polimórfico: target_type + target_id)
CREATE TABLE public.ratings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('list_item', 'item')),
  target_id   UUID NOT NULL,
  score       NUMERIC(2,1) NOT NULL CHECK (score >= 0.5 AND score <= 5.0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

-- 11. VOTES (like/dislike, polimórfico)
CREATE TABLE public.votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('list_item', 'item')),
  target_id   UUID NOT NULL,
  vote_type   TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

-- 12. COMMENTS (con replies via parent_comment_id)
CREATE TABLE public.comments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type       TEXT NOT NULL CHECK (target_type IN ('list', 'list_item', 'item')),
  target_id         UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  depth             INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. SAVES (bookmarks, polimórfico)
CREATE TABLE public.saves (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('list', 'item')),
  target_id   UUID NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

-- 14. REPORTS
CREATE TABLE public.reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('list', 'list_item', 'item', 'comment')),
  target_id   UUID NOT NULL,
  reason      TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. FOLLOWS
CREATE TABLE public.follows (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 16. ACTIVITY_LOG
CREATE TABLE public.activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id   UUID,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_lists_user        ON public.lists(user_id);
CREATE INDEX idx_lists_category    ON public.lists(category_id);
CREATE INDEX idx_lists_created     ON public.lists(created_at DESC);

CREATE INDEX idx_list_items_list   ON public.list_items(list_id);
CREATE INDEX idx_list_items_pos    ON public.list_items(list_id, position);

CREATE INDEX idx_items_user        ON public.items(user_id);
CREATE INDEX idx_items_category    ON public.items(category_id);
CREATE INDEX idx_items_created     ON public.items(created_at DESC);

CREATE INDEX idx_ratings_target    ON public.ratings(target_type, target_id);
CREATE INDEX idx_votes_target      ON public.votes(target_type, target_id);
CREATE INDEX idx_comments_target   ON public.comments(target_type, target_id);
CREATE INDEX idx_comments_parent   ON public.comments(parent_comment_id);
CREATE INDEX idx_saves_user        ON public.saves(user_id);
CREATE INDEX idx_reports_status    ON public.reports(status);
CREATE INDEX idx_follows_follower  ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_activity_user     ON public.activity_log(user_id, created_at DESC);
