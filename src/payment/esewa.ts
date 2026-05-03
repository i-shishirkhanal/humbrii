import { PaymentDetails } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const initiateEsewaPayment = async (
    details: PaymentDetails
) => {
    const { bookingId } = details;

    try {
        // Call the edge function to get signed payload
        // We only send booking_id. The server calculates amount and generates signature.
        const { data: esewaConfig, error } = await supabase.functions.invoke("payment-initiation", {
            body: {
                booking_id: bookingId,
            }
        });

        if (error) throw error;
        if (!esewaConfig) throw new Error("No payment configuration returned");

        // Create form and submit
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", esewaConfig.action_url);

        // Fields to exclude from the form input generation (action_url is metadata)
        const excludeFields = ["action_url"];

        for (const [key, value] of Object.entries(esewaConfig)) {
            if (!excludeFields.includes(key)) {
                const hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                hiddenField.setAttribute("value", String(value));
                form.appendChild(hiddenField);
            }
        }

        document.body.appendChild(form);
        form.submit();
    } catch (error) {
        console.error("Payment initiation failed:", error);
        throw error;
    }
};

import { Booking } from "@/services/bookings.service";

export const verifyEsewaPayment = async (encodedData: string): Promise<{ booking: Booking }> => {
    const { data, error } = await supabase.functions.invoke("esewa-payment", {
        body: {
            action: "verify",
            encoded_data: encodedData
        },
    });

    if (error) throw error;
    return data;
};
