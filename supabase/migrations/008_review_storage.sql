-- ============================================================
-- Migración 008: Bucket para Reseñas
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true);

-- Políticas de Storage
CREATE POLICY "Public read review-images"  
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'review-images');

CREATE POLICY "Auth upload review-images"  
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'review-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner delete review-images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);
