import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    // 1. CORS Preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const { action, payload } = await req.json();

        // 2. Auth Check: Verify User is Admin
        // Create client with the User's JWT to verify their identity
        const authHeader = req.headers.get('Authorization')!;
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            throw new Error("Unauthorized");
        }

        // Check Admin Role
        const { data: roles, error: roleError } = await supabaseClient
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

        if (roleError || !roles) {
            throw new Error("Forbidden: Admin privileges required");
        }

        // 3. Perform Admin Action using Service Role
        const serviceClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        if (action === "delete_property") {
            const { property_id } = payload;
            if (!property_id) throw new Error("Property ID required");

            const { error } = await serviceClient
                .from("properties")
                .delete()
                .eq("id", property_id);

            if (error) throw error;

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        if (action === "update_property") {
            const { property_id, updates } = payload;
            if (!property_id) throw new Error("Property ID required");

            // Clean updates to prevent restricted column overrides if necessary
            // For now, assume admins can update anything in 'properties'
            const { error } = await serviceClient
                .from("properties")
                .update(updates)
                .eq("id", property_id);

            if (error) throw error;

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        throw new Error("Invalid action");

    } catch (error: any) {
        console.error("Admin action failed:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
