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
  ELSIF v_type = 'list' THEN
    UPDATE public.lists SET avg_rating = v_avg, rating_count = v_count WHERE id = v_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
