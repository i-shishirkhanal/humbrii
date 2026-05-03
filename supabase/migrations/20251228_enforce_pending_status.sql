-- Drop first to allow return type change
DROP FUNCTION IF EXISTS create_property(jsonb);

-- Update create_property RPC to set status to 'pending' and is_published to false by default

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
    is_published, -- Explicitly set published status
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
    'pending', -- Default to pending for approval
    false,    -- Default to unpublished
    ARRAY(SELECT jsonb_array_elements_text(payload->'amenities')),
    (payload->>'latitude')::double precision,
    (payload->>'longitude')::double precision,
    v_host_id
  )
  RETURNING id INTO v_property_id;

  RETURN json_build_object('id', v_property_id);
END;
$$;
