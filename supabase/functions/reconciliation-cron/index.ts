import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 1. Find stale pending bookings (older than 15 minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

        const { data: staleBookings, error: fetchError } = await supabaseClient
            .from("bookings")
            .select("id, created_at")
            .eq("booking_status", "pending")
            .lt("created_at", fifteenMinutesAgo);

        if (fetchError) throw fetchError;

        console.log(`Found ${staleBookings.length} stale bookings.`);

        const results = { cancelled: 0, errors: 0 };

        // 2. Cancel them to release the EXCLUDE constraint lock
        for (const booking of staleBookings) {
            const { error: updateError } = await supabaseClient
                .from("bookings")
                .update({
                    booking_status: "cancelled",
                    payment_status: "expired",
                    updated_at: new Date().toISOString()
                })
                .eq("id", booking.id);

            if (updateError) {
                console.error(`Failed to cancel booking ${booking.id}:`, updateError);
                results.errors++;
            } else {
                results.cancelled++;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Reconciliation complete",
            stats: results
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
