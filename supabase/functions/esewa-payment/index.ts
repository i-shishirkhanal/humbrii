import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    // 1. CORS PREFLIGHT - IMMEDIATE RETURN
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    try {
        // 2. Initialize Supabase Client
        // Note: For payment verification callbacks from eSewa, we might generally need Service Role 
        // if eSewa calls this DIRECTLY (server-to-server).
        // BUT here, this function is called by the FRONTEND (`verifyEsewaPayment` in `esewa.ts`)
        // passing the base64 blob it got from the redirect.
        // So we should use ANON KEY + User Context to be safe, OR use Service Role carefully if specific privilege needed.
        // Given we call `confirm_payment_intent` RPC which likely needs to update tables,
        // and we verify the SIGNATURE from eSewa payload, the Signature acts as the Authorization.
        // Safe Pattern:
        // - Verify Signature first (Absolute Truth)
        // - Then use Service Role to finalize booking (System Action)

        const { action, encoded_data } = await req.json();

        if (action !== "verify" || !encoded_data) {
            throw new Error("Invalid request");
        }

        // Decode base64
        const decodedData = atob(encoded_data);
        const esewaData = JSON.parse(decodedData);

        const { status, transaction_uuid, total_amount, signature, signed_field_names } = esewaData;

        if (status !== "COMPLETE") {
            throw new Error("Payment not complete: " + status);
        }

        // 3. Verify Signature (Native Web Crypto)
        const secretKey = Deno.env.get("ESEWA_SECRET_KEY");
        if (!secretKey) throw new Error("ESEWA_SECRET_KEY missing");

        let signatureString = "";
        if (signed_field_names) {
            const fields = signed_field_names.split(",");
            signatureString = fields.map((field: string) => `${field}=${esewaData[field]}`).join(",");
        } else {
            signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${esewaData.product_code}`;
        }

        const encoder = new TextEncoder();
        const keyData = encoder.encode(secretKey);
        const messageData = encoder.encode(signatureString);

        const cryptoKey = await crypto.subtle.importKey(
            "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
        const generatedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

        if (generatedSignature !== signature) {
            console.error("Signature mismatch. Expected:", generatedSignature, "Received:", signature);
            throw new Error("Invalid signature");
        }

        // 4. Initialize Admin Client (Safe because Signature is verified)
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch Payment Intent
        const { data: intent, error: fetchError } = await supabase
            .from("payment_intents")
            .select("*")
            .eq("id", transaction_uuid)
            .single();

        if (fetchError || !intent) {
            console.error("Intent lookup failed:", fetchError);
            throw new Error("Payment intent not found");
        }

        // Validate Amount
        const paidAmount = Number(total_amount);
        const intentAmount = Number(intent.amount);

        if (Math.abs(paidAmount - intentAmount) > 0.1) {
            console.error(`Amount mismatch. Expected: ${intentAmount}, Paid: ${paidAmount}`);

            await supabase.from("audit_logs").insert({
                event_type: 'payment_verification_failed',
                table_name: 'payment_intents',
                record_id: transaction_uuid,
                metadata: { reason: 'amount_mismatch', expected: intentAmount, paid: paidAmount }
            });

            throw new Error("Payment amount mismatch");
        }

        // Confirm Payment and Create Booking
        const { data: result, error: rpcError } = await supabase
            .rpc('confirm_payment_intent', {
                p_payment_intent_id: transaction_uuid,
                p_provider_tx_id: transaction_uuid
            });

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            if (rpcError.message.includes("Room is no longer available")) {
                return new Response(JSON.stringify({ success: false, message: "Room no longer available. Refund initiated (manual)." }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 409 // Conflict
                });
            }
            throw new Error(rpcError.message);
        }

        return new Response(JSON.stringify({ success: true, booking_id: result.booking_id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        console.error("Payment verification failed:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
