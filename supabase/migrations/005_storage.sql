-- ============================================================
-- OPINEXT — Storage buckets
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('list-covers', 'list-covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);

-- Storage policies: anyone can view, authenticated users can upload their own
CREATE POLICY "Public read avatars"    ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatars"    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Owner delete avatars"   ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read list-covers"  ON storage.objects FOR SELECT USING (bucket_id = 'list-covers');
CREATE POLICY "Auth upload list-covers"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'list-covers' AND auth.uid() IS NOT NULL);
CREATE POLICY "Owner delete list-covers" ON storage.objects FOR DELETE USING (bucket_id = 'list-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read item-images"  ON storage.objects FOR SELECT USING (bucket_id = 'item-images');
CREATE POLICY "Auth upload item-images"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'item-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Owner delete item-images" ON storage.objects FOR DELETE USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);
