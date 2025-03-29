
-- Create storage bucket for community banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('community_banners', 'Community Banners', true);

-- Set up CORS for the bucket
UPDATE storage.buckets
SET cors = '[{"allowed_origins": ["*"], "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allowed_headers": ["*"], "exposed_headers": [], "max_age_seconds": 3600}]'
WHERE id = 'community_banners';

-- Allow public reads on community banners bucket
CREATE POLICY "Public can read community banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'community_banners');

-- Allow authenticated users to insert banners
CREATE POLICY "Authenticated users can upload community banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community_banners');

-- Allow users to update their own banners
CREATE POLICY "Users can update their own community banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'community_banners' AND 
  EXISTS (
    SELECT 1 FROM public.communities c
    WHERE c.created_by = auth.uid() AND storage.filename(name) LIKE c.id || '%'
  )
);

-- Allow users to delete their own banners
CREATE POLICY "Users can delete their own community banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community_banners' AND 
  EXISTS (
    SELECT 1 FROM public.communities c
    WHERE c.created_by = auth.uid() AND storage.filename(name) LIKE c.id || '%'
  )
);
