import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { bookingId, transactionData } = await req.json();

    if (!bookingId) {
      throw new Error("Missing booking ID");
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    const esewaConfig = {
      merchantId: Deno.env.get("ESEWA_MERCHANT_ID") || "EPAYTEST",
      secretKey: Deno.env.get("ESEWA_SECRET_KEY") || "8gBm/:&EnhH.1/q",
      environment: Deno.env.get("ESEWA_ENVIRONMENT") || "test",
    };

    // If transactionData is provided (from eSewa callback), verify it
    if (transactionData) {
      // Decode the base64 transaction data from eSewa
      const decodedData = JSON.parse(atob(transactionData));
      
      // Verify the signature
      const expectedSignedFields = decodedData.signed_field_names?.split(",") || [];
      const signatureString = expectedSignedFields
        .map((field: string) => `${field}=${decodedData[field]}`)
        .join(",");

      const encoder = new TextEncoder();
      const keyData = encoder.encode(esewaConfig.secretKey);
      const messageData = encoder.encode(signatureString);
      
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      
      const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
      const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

      if (decodedData.signature !== expectedSignature) {
        console.error("Signature mismatch");
        throw new Error("Invalid payment signature");
      }

      // Payment verified, update booking
      const paidAmount = parseFloat(decodedData.total_amount) || 0;
      const isFullPayment = booking.payment_type === "full";
      
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          booking_status: "confirmed",
          payment_status: isFullPayment ? "paid" : "partial",
          paid_amount: paidAmount,
          stripe_payment_intent_id: decodedData.transaction_code, // Storing eSewa reference
        })
        .eq("id", bookingId);

      if (updateError) {
        throw new Error("Failed to update booking status");
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment verified successfully",
          booking: {
            id: bookingId,
            status: "confirmed",
            paidAmount,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If no transaction data, just return booking status
    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: booking.id,
          status: booking.booking_status,
          paymentStatus: booking.payment_status,
          paidAmount: booking.paid_amount,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Payment verification failed";
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
