import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    // 1. CORS PREFLIGHT - IMMEDIATE RETURN
    // Zero dependencies used here.
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    try {
        // 2. Initialize Supabase (ANON KEY + Forward Auth)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error("No authorization header");

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        );

        // 3. Parse Body
        const body = await req.json();
        const { property_id, check_in_date, check_out_date, guests, payment_type, success_url, failure_url } = body;

        if (!property_id || !check_in_date || !check_out_date || !guests) {
            throw new Error("Missing required fields");
        }

        // 4. Validate User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Unauthorized");

        // 5. Fetch Property
        const { data: property, error: propError } = await supabase
            .from("properties")
            .select("base_price, name, category")
            .eq("id", property_id)
            .single();

        if (propError || !property) throw new Error("Property not found");

        // 6. Date Calculation (Native)
        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            throw new Error("Invalid date format");
        }

        // Difference in days: (b - a) / ms_per_day
        const diffMs = checkOut.getTime() - checkIn.getTime();
        const rawNights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        const isNightly = !property.category || property.category === 'full_stay';

        if (isNightly && rawNights < 1) {
            throw new Error("Check-out must be at least 1 day after check-in");
        }

        // Ensure at least 1 unit is charged if same day (for hourly/daycation)
        const nights = Math.max(rawNights, 1);

        // 7. Calculate Amount
        const subtotal = Number(property.base_price) * nights;
        // User requested NO extra service fee on top. 
        // Platform fee is deducted internally or processed differently.
        const totalAmount = subtotal;

        let payAmount = totalAmount;
        if (payment_type === 'partial') {
            payAmount = Math.round(totalAmount * 0.2);
        }

        // 8. Check Availability (Correct Overlap Logic)
        const { data: conflicts } = await supabase
            .from("bookings")
            .select("id")
            .eq("property_id", property_id)
            .neq("payment_status", "failed")
            .lt("check_in_date", check_out_date)
            .gt("check_out_date", check_in_date)
            .limit(1);

        if (conflicts && conflicts.length > 0) {
            throw new Error("Property is not available for these dates");
        }

        // 9. Create Intent
        const { data: intent, error: intentError } = await supabase
            .from("payment_intents")
            .insert({
                user_id: user.id,
                property_id,
                check_in: check_in_date,
                check_out: check_out_date,
                amount: payAmount,
                status: 'initiated',
                expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                metadata: {
                    total_amount: totalAmount,
                    payment_type,
                    guests,
                    property_name: property.name,
                    nights,
                    price_per_night: property.base_price
                }
            })
            .select()
            .single();

        if (intentError) {
            console.error("Intent creation error:", intentError);
            throw new Error("Failed to create payment intent");
        }

        // Audit Log
        await supabase.from("audit_logs").insert({
            event_type: 'payment_initiation',
            table_name: 'payment_intents',
            record_id: intent.id,
            metadata: {
                payment_type,
                amount: payAmount,
                property_id
            }
        });

        // 10. Generate Signature (Native Web Crypto)
        const merchantCode = Deno.env.get("ESEWA_MERCHANT_CODE") || "EPAYTEST";
        const secretKey = Deno.env.get("ESEWA_SECRET_KEY");
        if (!secretKey) throw new Error("ESEWA_SECRET_KEY missing");

        const formattedAmount = payAmount.toFixed(2);
        const transactionId = intent.id;
        const baseUrl = Deno.env.get("APP_BASE_URL") || req.headers.get("origin") || "http://localhost:5173";
        const effectiveSuccessUrl = success_url || `${baseUrl} /payment/success`;
        const effectiveFailureUrl = failure_url || `${baseUrl} /payment/failure`;

        const signatureString = `total_amount = ${formattedAmount}, transaction_uuid = ${transactionId}, product_code = ${merchantCode} `;

        // Native HMAC SHA256 matching eSewa requirements
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secretKey);
        const messageData = encoder.encode(signatureString);

        const cryptoKey = await crypto.subtle.importKey(
            "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
        // Convert ArrayBuffer to Base64
        const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

        // Success Response
        return new Response(JSON.stringify({
            amount: formattedAmount,
            tax_amount: "0",
            total_amount: formattedAmount,
            transaction_uuid: transactionId,
            product_code: merchantCode,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: effectiveSuccessUrl,
            failure_url: effectiveFailureUrl,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature,
            action_url: merchantCode === "EPAYTEST"
                ? "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
                : "https://epay.esewa.com.np/api/epay/main/v2/form"
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        console.error("Payment initiation error:", error);
        // Error Response - MUST include CORS headers
        return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400, // Client error (logic/validation)
        });
    }
});
