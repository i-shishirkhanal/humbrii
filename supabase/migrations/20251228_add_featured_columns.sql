-- Add featured columns for different sections

ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured_main boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured_order_main integer;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured_hourly boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured_order_hourly integer;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured_daycation boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured_order_daycation integer;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured_full_stay boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured_order_full_stay integer;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured_vibe_chill boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured_order_vibe_chill integer;

-- Add indexes for better performance on these filtered queries
CREATE INDEX IF NOT EXISTS idx_properties_featured_main ON properties(is_featured_main) WHERE is_featured_main = true;
CREATE INDEX IF NOT EXISTS idx_properties_featured_hourly ON properties(is_featured_hourly) WHERE is_featured_hourly = true;
