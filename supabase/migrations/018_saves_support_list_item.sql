ALTER TABLE public.saves DROP CONSTRAINT saves_target_type_check;
ALTER TABLE public.saves ADD CONSTRAINT saves_target_type_check CHECK (target_type IN ('list', 'list_item', 'item'));
