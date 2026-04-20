-- ============================================================
-- OPINEXT — Triggers y funciones
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles    BEFORE UPDATE ON public.profiles    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_lists       BEFORE UPDATE ON public.lists       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_list_items  BEFORE UPDATE ON public.list_items  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_items       BEFORE UPDATE ON public.items       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_comments    BEFORE UPDATE ON public.comments    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', 'Usuario'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update avg_rating on ratings change
CREATE OR REPLACE FUNCTION public.update_avg_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_avg  NUMERIC(2,1);
  v_count INT;
  v_type TEXT;
  v_id   UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_type := OLD.target_type;
    v_id   := OLD.target_id;
  ELSE
    v_type := NEW.target_type;
    v_id   := NEW.target_id;
  END IF;

  SELECT COALESCE(ROUND(AVG(score)::numeric, 1), 0), COUNT(*)
  INTO v_avg, v_count
  FROM public.ratings
  WHERE target_type = v_type AND target_id = v_id;

  IF v_type = 'list_item' THEN
    UPDATE public.list_items SET avg_rating = v_avg, rating_count = v_count WHERE id = v_id;
  ELSIF v_type = 'item' THEN
    UPDATE public.items SET avg_rating = v_avg, rating_count = v_count WHERE id = v_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_avg_rating();

-- Update vote counters on votes change
CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_up   INT;
  v_down INT;
  v_type TEXT;
  v_id   UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_type := OLD.target_type;
    v_id   := OLD.target_id;
  ELSE
    v_type := NEW.target_type;
    v_id   := NEW.target_id;
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'up'),
    COUNT(*) FILTER (WHERE vote_type = 'down')
  INTO v_up, v_down
  FROM public.votes
  WHERE target_type = v_type AND target_id = v_id;

  IF v_type = 'list_item' THEN
    UPDATE public.list_items SET upvotes = v_up, downvotes = v_down WHERE id = v_id;
  ELSIF v_type = 'item' THEN
    UPDATE public.items SET upvotes = v_up, downvotes = v_down WHERE id = v_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();
