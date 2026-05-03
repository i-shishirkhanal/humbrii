-- Migration to fix "null value in column location" error
-- The 'location' column is NOT NULL, but was missing from the RPC insert/update.

DROP FUNCTION IF EXISTS create_property(jsonb);
DROP FUNCTION IF EXISTS update_property(uuid, jsonb);

-- 1. Redefine create_property to include 'location'
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
    base_price,
    location, -- Added missing column
    address,
    city,
    images,
    category,
    status,
    is_published,
    amenities,
    latitude,
    longitude,
    max_guests,
    bedrooms,
    beds,
    bathrooms,
    check_in_time,
    check_out_time,
    house_rules,
    host_name,
    host_id
  ) VALUES (
    (payload->>'name')::text,
    (payload->>'description')::text,
    (payload->>'base_price')::numeric,
    (payload->>'location')::text, -- Added missing value
    (payload->>'address')::text,
    (payload->>'city')::text, -- Keep city if payload has it, implicitly null otherwise (allowed if nullable) or user meant location=city
    ARRAY(SELECT jsonb_array_elements_text(payload->'images')),
    (payload->>'category')::property_category,
    'pending',
    false,
    ARRAY(SELECT jsonb_array_elements_text(payload->'amenities')),
    (payload->>'latitude')::double precision,
    (payload->>'longitude')::double precision,
    (payload->>'max_guests')::integer,
    (payload->>'bedrooms')::integer,
    (payload->>'beds')::integer,
    (payload->>'bathrooms')::integer,
    (payload->>'check_in_time')::text,
    (payload->>'check_out_time')::text,
    ARRAY(SELECT jsonb_array_elements_text(payload->'house_rules')),
    (payload->>'host_name')::text,
    v_host_id
  )
  RETURNING id INTO v_property_id;

  RETURN json_build_object('id', v_property_id);
END;
$$;

-- 2. Redefine update_property to include 'location'
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
    base_price = COALESCE((payload->>'base_price')::numeric, base_price),
    location = COALESCE((payload->>'location')::text, location), -- Added update for location
    address = COALESCE((payload->>'address')::text, address),
    city = COALESCE((payload->>'city')::text, city),
    images = COALESCE((SELECT array_agg(x) FROM jsonb_array_elements_text(payload->'images') t(x)), images),
    category = COALESCE((payload->>'category')::property_category, category),
    amenities = COALESCE((SELECT array_agg(x) FROM jsonb_array_elements_text(payload->'amenities') t(x)), amenities),
    latitude = COALESCE((payload->>'latitude')::double precision, latitude),
    longitude = COALESCE((payload->>'longitude')::double precision, longitude),
    max_guests = COALESCE((payload->>'max_guests')::integer, max_guests),
    bedrooms = COALESCE((payload->>'bedrooms')::integer, bedrooms),
    beds = COALESCE((payload->>'beds')::integer, beds),
    bathrooms = COALESCE((payload->>'bathrooms')::integer, bathrooms),
    check_in_time = COALESCE((payload->>'check_in_time')::text, check_in_time),
    check_out_time = COALESCE((payload->>'check_out_time')::text, check_out_time),
    house_rules = COALESCE((SELECT array_agg(x) FROM jsonb_array_elements_text(payload->'house_rules') t(x)), house_rules),
    host_name = COALESCE((payload->>'host_name')::text, host_name),
    updated_at = now()
  WHERE id = property_id;

  RETURN json_build_object('success', true);
END;
$$;
