import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  bookingId: string;
  amount: number;
  productName: string;
  paymentType: "full" | "partial";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { bookingId, amount, productName, paymentType }: PaymentRequest = await req.json();

    if (!bookingId || !amount) {
      throw new Error("Missing required fields: bookingId, amount");
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

    // eSewa configuration
    const esewaConfig = {
      merchantId: Deno.env.get("ESEWA_MERCHANT_ID") || "EPAYTEST", // Test merchant ID
      secretKey: Deno.env.get("ESEWA_SECRET_KEY") || "8gBm/:&EnhH.1/q", // Test secret key
      environment: Deno.env.get("ESEWA_ENVIRONMENT") || "test", // test or production
    };

    const baseUrl = esewaConfig.environment === "production" 
      ? "https://esewa.com.np" 
      : "https://rc-epay.esewa.com.np";

    // Generate unique transaction UUID
    const transactionUuid = `${bookingId}-${Date.now()}`;

    // Calculate total amount (amount + tax + service charge + delivery charge)
    const taxAmount = 0;
    const serviceCharge = 0;
    const deliveryCharge = 0;
    const totalAmount = amount + taxAmount + serviceCharge + deliveryCharge;

    // Create signature for eSewa
    const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${esewaConfig.merchantId}`;
    
    // Create HMAC-SHA256 signature
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
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    // Store transaction details for verification later
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        stripe_session_id: transactionUuid, // Reusing this field for eSewa transaction ID
        payment_type: paymentType,
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Failed to update booking:", updateError);
    }

    // Get the origin for callback URLs
    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Construct eSewa payment form data
    const paymentFormData = {
      amount: amount.toString(),
      tax_amount: taxAmount.toString(),
      total_amount: totalAmount.toString(),
      transaction_uuid: transactionUuid,
      product_code: esewaConfig.merchantId,
      product_service_charge: serviceCharge.toString(),
      product_delivery_charge: deliveryCharge.toString(),
      success_url: `${origin}/payment/success?booking_id=${bookingId}`,
      failure_url: `${origin}/payment/failure?booking_id=${bookingId}`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
    };

    // For eSewa, we need to redirect with form data
    // Return the form data and URL for client-side form submission
    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: `${baseUrl}/api/epay/main/v2/form`,
        formData: paymentFormData,
        transactionId: transactionUuid,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Payment initialization failed";
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
