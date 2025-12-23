-- Add featured_order column for managing featured property positions by category
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS featured_order integer DEFAULT NULL;

-- Create index for faster featured queries
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties (is_featured, category, featured_order) WHERE is_featured = true;