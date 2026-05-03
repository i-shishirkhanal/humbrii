-- RPC to allow Admins to update properties (bypassing RLS for update if needed, or simplifying logic)
-- Note: 'is_admin()' function must exist and be correct.

CREATE OR REPLACE FUNCTION admin_update_property(
  p_property_id uuid,
  p_updates jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Forbidden: Admin privileges required';
  END IF;

  -- 2. Perform Update
  UPDATE properties
  SET
    is_published = COALESCE((p_updates->>'is_published')::boolean, is_published),
    status = COALESCE(p_updates->>'status', status),
    is_featured = COALESCE((p_updates->>'is_featured')::boolean, is_featured),
    featured_order = COALESCE((p_updates->>'featured_order')::integer, featured_order),
    is_featured_main = COALESCE((p_updates->>'is_featured_main')::boolean, is_featured_main),
    featured_order_main = COALESCE((p_updates->>'featured_order_main')::integer, featured_order_main),
    is_featured_hourly = COALESCE((p_updates->>'is_featured_hourly')::boolean, is_featured_hourly),
    featured_order_hourly = COALESCE((p_updates->>'featured_order_hourly')::integer, featured_order_hourly),
    is_featured_daycation = COALESCE((p_updates->>'is_featured_daycation')::boolean, is_featured_daycation),
    featured_order_daycation = COALESCE((p_updates->>'featured_order_daycation')::integer, featured_order_daycation),
    is_featured_full_stay = COALESCE((p_updates->>'is_featured_full_stay')::boolean, is_featured_full_stay),
    featured_order_full_stay = COALESCE((p_updates->>'featured_order_full_stay')::integer, featured_order_full_stay),
    is_featured_vibe_chill = COALESCE((p_updates->>'is_featured_vibe_chill')::boolean, is_featured_vibe_chill),
    featured_order_vibe_chill = COALESCE((p_updates->>'featured_order_vibe_chill')::integer, featured_order_vibe_chill),
    updated_at = NOW()
  WHERE id = p_property_id;

  -- Return success
  RETURN json_build_object('success', true);
END;
$$;
