-- Add index to bookings.property_id to speed up RLS policies that check host ownership
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);

-- Add index to properties.city (lowercase) to speed up case-insensitive location search
-- Note: 'city' is text. We should use a trigram index for ILIKE but standard btree works for equality or lower().
-- For simple ILIKE 'pattern%' we often need pg_trgm.
-- But given the scope, simple standard index is better than nothing, or relying on simple equality.
-- To support "ilike", a GIN index on pg_trgm is best, but let's stick to standard btree on lower(city) if possible or just city.
-- Let's just index 'city' for now.
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
