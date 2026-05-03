import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") { return new Response("ok", { headers: corsHeaders }); }

    const admin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action } = await req.json();

    try {
        if (action === "SETUP_DATA") {
            // 1. Create a dummy property if needed (or find one)
            const { data: props } = await admin.from("properties").select("id, base_price").limit(1);
            if (!props || props.length === 0) throw new Error("No properties found");
            const property = props[0];

            // 2. Create a dummy user
            const { data: users } = await admin.from("profiles").select("id").limit(1);
            // If no users, we might be stuck, but assuming at least one exists from previous steps.
            // Or create a dummy auth user? (Hard via admin API directly without email)
            // Let's assume we have a user.
            const userId = users?.[0]?.id;
            if (!userId) throw new Error("No users found");

            // 3. Create 2 Bookings for SAME Property SAME Date
            // Date: Tomorrow
            const checkIn = new Date();
            checkIn.setDate(checkIn.getDate() + 1);
            const checkOut = new Date(checkIn);
            checkOut.setDate(checkOut.getDate() + 5);

            const b1 = await admin.from("bookings").insert({
                property_id: property.id,
                user_id: userId,
                check_in_date: checkIn.toISOString(),
                check_out_date: checkOut.toISOString(),
                total_amount: property.base_price * 5,
                status: 'pending',
                payment_status: 'pending'
            }).select().single();

            const b2 = await admin.from("bookings").insert({
                property_id: property.id,
                user_id: userId,
                check_in_date: checkIn.toISOString(),
                check_out_date: checkOut.toISOString(),
                total_amount: property.base_price * 5,
                status: 'pending',
                payment_status: 'pending'
            }).select().single();

            return new Response(JSON.stringify({ bookingA: b1.data, bookingB: b2.data, property }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (action === "TEST_ATOMICITY") {
            const { bookingIdA, bookingIdB, amount } = await req.json();

            // Try to confirm A
            console.log("Confirming A...");
            const resA = await admin.rpc("confirm_booking_payment", {
                p_booking_id: bookingIdA,
                p_paid_amount: amount,
                p_esewa_ref_id: "REF_TEST_A_" + Date.now()
            });

            // Try to confirm B (Should Fail)
            console.log("Confirming B...");
            let resB_RuntimeError = null;
            let resB = null;
            try {
                const { data, error } = await admin.rpc("confirm_booking_payment", {
                    p_booking_id: bookingIdB,
                    p_paid_amount: amount,
                    p_esewa_ref_id: "REF_TEST_B_" + Date.now()
                });
                if (error) throw error;
                resB = data;
            } catch (e) {
                resB_RuntimeError = e.message;
            }

            return new Response(JSON.stringify({
                resultA: resA,
                resultB_Error: resB_RuntimeError,
                isAtomic: !resA.error && resB_RuntimeError && resB_RuntimeError.includes("Double booking")
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        throw new Error("Unknown action");

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return new Response(JSON.stringify({ error: message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});
