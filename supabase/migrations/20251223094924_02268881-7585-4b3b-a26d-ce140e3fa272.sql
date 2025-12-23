-- Add separate featured columns for each section
ALTER TABLE public.properties
ADD COLUMN is_featured_main boolean DEFAULT false,
ADD COLUMN featured_order_main integer,
ADD COLUMN is_featured_hourly boolean DEFAULT false,
ADD COLUMN featured_order_hourly integer,
ADD COLUMN is_featured_daycation boolean DEFAULT false,
ADD COLUMN featured_order_daycation integer,
ADD COLUMN is_featured_full_stay boolean DEFAULT false,
ADD COLUMN featured_order_full_stay integer,
ADD COLUMN is_featured_vibe_chill boolean DEFAULT false,
ADD COLUMN featured_order_vibe_chill integer;

-- Create indexes for better query performance
CREATE INDEX idx_properties_featured_main ON public.properties(is_featured_main, featured_order_main) WHERE is_featured_main = true;
CREATE INDEX idx_properties_featured_hourly ON public.properties(is_featured_hourly, featured_order_hourly) WHERE is_featured_hourly = true;
CREATE INDEX idx_properties_featured_daycation ON public.properties(is_featured_daycation, featured_order_daycation) WHERE is_featured_daycation = true;
CREATE INDEX idx_properties_featured_full_stay ON public.properties(is_featured_full_stay, featured_order_full_stay) WHERE is_featured_full_stay = true;
CREATE INDEX idx_properties_featured_vibe_chill ON public.properties(is_featured_vibe_chill, featured_order_vibe_chill) WHERE is_featured_vibe_chill = true;