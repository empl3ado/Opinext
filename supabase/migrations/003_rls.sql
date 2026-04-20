-- ============================================================
-- OPINEXT — Row Level Security
-- ============================================================

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ======================== PROFILES ========================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles: public read"    ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles: owner update"   ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Profiles: owner delete"   ON public.profiles FOR DELETE USING (id = auth.uid() OR public.is_admin());

-- ======================== CATEGORIES ========================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories: public read"  ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories: admin manage" ON public.categories FOR ALL USING (public.is_admin());

-- ======================== SUBCATEGORIES ========================
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subcategories: public read"  ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Subcategories: admin manage" ON public.subcategories FOR ALL USING (public.is_admin());

-- ======================== LISTS ========================
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lists: public read"    ON public.lists FOR SELECT USING (is_published = true);
CREATE POLICY "Lists: auth insert"    ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Lists: owner update"   ON public.lists FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Lists: owner delete"   ON public.lists FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- ======================== LIST_ITEMS ========================
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "List items: public read" ON public.list_items FOR SELECT USING (true);
CREATE POLICY "List items: owner insert" ON public.list_items FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- List owner can always add
      EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND user_id = auth.uid())
      -- Or list is collaborative
      OR EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND is_collaborative = true)
    )
  );
CREATE POLICY "List items: owner update" ON public.list_items FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND user_id = auth.uid()));
CREATE POLICY "List items: owner delete" ON public.list_items FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND user_id = auth.uid()));

-- ======================== ITEMS ========================
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items: public read"    ON public.items FOR SELECT USING (is_published = true);
CREATE POLICY "Items: auth insert"    ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Items: owner update"   ON public.items FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Items: owner delete"   ON public.items FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- ======================== TAGS ========================
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags: public read"     ON public.tags FOR SELECT USING (true);
CREATE POLICY "Tags: auth insert"     ON public.tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ======================== LIST_TAGS ========================
ALTER TABLE public.list_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "List tags: public read"  ON public.list_tags FOR SELECT USING (true);
CREATE POLICY "List tags: owner manage" ON public.list_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND user_id = auth.uid()));
CREATE POLICY "List tags: owner delete" ON public.list_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND user_id = auth.uid()) OR public.is_admin());

-- ======================== ITEM_TAGS ========================
ALTER TABLE public.item_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Item tags: public read"  ON public.item_tags FOR SELECT USING (true);
CREATE POLICY "Item tags: owner manage" ON public.item_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = auth.uid()));
CREATE POLICY "Item tags: owner delete" ON public.item_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = auth.uid()) OR public.is_admin());

-- ======================== RATINGS ========================
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratings: public read"  ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Ratings: auth insert"  ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Ratings: owner update" ON public.ratings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Ratings: owner delete" ON public.ratings FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- ======================== VOTES ========================
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes: public read"   ON public.votes FOR SELECT USING (true);
CREATE POLICY "Votes: auth insert"   ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Votes: owner update"  ON public.votes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Votes: owner delete"  ON public.votes FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- ======================== COMMENTS ========================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments: public read"   ON public.comments FOR SELECT USING (true);
CREATE POLICY "Comments: auth insert"   ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Comments: owner update"  ON public.comments FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Comments: owner delete"  ON public.comments FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- ======================== SAVES ========================
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Saves: own read"    ON public.saves FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Saves: auth insert" ON public.saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Saves: owner delete" ON public.saves FOR DELETE USING (user_id = auth.uid());

-- ======================== REPORTS ========================
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports: auth insert"  ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reports: admin read"   ON public.reports FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Reports: admin update" ON public.reports FOR UPDATE USING (public.is_admin());

-- ======================== FOLLOWS ========================
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows: public read"  ON public.follows FOR SELECT USING (true);
CREATE POLICY "Follows: auth insert"  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Follows: owner delete" ON public.follows FOR DELETE USING (follower_id = auth.uid());

-- ======================== ACTIVITY_LOG ========================
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activity: public read" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Activity: system insert" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
