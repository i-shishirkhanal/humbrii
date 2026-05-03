-- Secure Property Management RPCs

-- 1. Create Property
CREATE OR REPLACE FUNCTION create_property(
  payload jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_property_id uuid;
  v_host_id uuid;
BEGIN
  v_host_id := auth.uid();
  
  -- Validation: Check if user is a host
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = v_host_id AND role = 'host') THEN
     RAISE EXCEPTION 'Only hosts can list properties';
  END IF;

  INSERT INTO properties (
    name,
    description,
    price_per_night,
    address,
    city,
    images,
    category,
    status,
    amenities,
    latitude,
    longitude,
    host_id
  ) VALUES (
    (payload->>'name')::text,
    (payload->>'description')::text,
    (payload->>'price_per_night')::numeric,
    (payload->>'address')::text,
    (payload->>'city')::text,
    ARRAY(SELECT jsonb_array_elements_text(payload->'images')),
    (payload->>'category')::property_category,
    'active',
    ARRAY(SELECT jsonb_array_elements_text(payload->'amenities')),
    (payload->>'latitude')::double precision,
    (payload->>'longitude')::double precision,
    v_host_id
  )
  RETURNING id INTO v_property_id;

  RETURN json_build_object('id', v_property_id);
END;
$$;

-- 2. Update Property
CREATE OR REPLACE FUNCTION update_property(
  property_id uuid,
  payload jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check ownership
  IF NOT EXISTS (SELECT 1 FROM properties WHERE id = property_id AND host_id = auth.uid()) THEN
    RAISE EXCEPTION 'You do not have permission to update this property';
  END IF;

  UPDATE properties
  SET
    name = COALESCE((payload->>'name')::text, name),
    description = COALESCE((payload->>'description')::text, description),
    price_per_night = COALESCE((payload->>'price_per_night')::numeric, price_per_night),
    address = COALESCE((payload->>'address')::text, address),
    city = COALESCE((payload->>'city')::text, city),
    images = COALESCE((SELECT array_agg(x) FROM jsonb_array_elements_text(payload->'images') t(x)), images),
    category = COALESCE((payload->>'category')::property_category, category),
    amenities = COALESCE((SELECT array_agg(x) FROM jsonb_array_elements_text(payload->'amenities') t(x)), amenities),
    latitude = COALESCE((payload->>'latitude')::double precision, latitude),
    longitude = COALESCE((payload->>'longitude')::double precision, longitude),
    updated_at = now()
  WHERE id = property_id;

  RETURN json_build_object('success', true);
END;
$$;

-- 3. Secure RLS for Properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Allow public read
DROP POLICY IF EXISTS "Public properties read" ON properties;
CREATE POLICY "Public properties read" ON properties FOR SELECT USING (true);

-- Allow hosts to update their own
DROP POLICY IF EXISTS "Hosts update own properties" ON properties;
CREATE POLICY "Hosts update own properties" ON properties FOR UPDATE USING (host_id = auth.uid());

-- Allow hosts to insert (But we prefer RPC)
-- We will REVOKE INSERT from authenticated to force RPC usage for creation?
-- The user prompt said: "Eliminating direct frontend writes... by routing all mutations through... RPCs"
-- So YES, revoke INSERT.
REVOKE INSERT ON properties FROM authenticated, anon;
grant select on properties to authenticated, anon;
