ALTER TABLE public.ratings DROP CONSTRAINT ratings_target_type_check;
ALTER TABLE public.ratings ADD CONSTRAINT ratings_target_type_check CHECK (target_type IN ('list', 'list_item', 'item'));

ALTER TABLE public.lists ADD COLUMN avg_rating NUMERIC(2,1) NOT NULL DEFAULT 0;
ALTER TABLE public.lists ADD COLUMN rating_count INT NOT NULL DEFAULT 0;
