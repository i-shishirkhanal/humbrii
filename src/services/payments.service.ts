
import { supabase } from "@/integrations/supabase/client";

interface InitiatePaymentParams {
    property_id: string;
    check_in_date: Date;
    check_out_date: Date;
    guests: number;
    payment_type: 'full' | 'partial';
    success_url?: string;
    failure_url?: string;
}

export const paymentsService = {
    /**
     * Initiate payment via Edge Function
     */
    async initiatePayment(params: InitiatePaymentParams) {
        const { data, error } = await supabase.functions.invoke('payment-initiation', {
            body: {
                property_id: params.property_id,
                check_in_date: params.check_in_date.toISOString(),
                check_out_date: params.check_out_date.toISOString(),
                guests: params.guests,
                payment_type: params.payment_type,
                success_url: params.success_url,
                failure_url: params.failure_url
            }
        });

        if (error) throw error;
        return data;
    }
};
