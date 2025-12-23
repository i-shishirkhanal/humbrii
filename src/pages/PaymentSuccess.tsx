import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  const bookingId = searchParams.get("booking_id");
  const transactionData = searchParams.get("data");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!bookingId) {
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("esewa-verify", {
          body: { bookingId, transactionData },
        });

        if (error) throw error;
        setBooking(data.booking);
      } catch (error) {
        console.error("Verification error:", error);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [bookingId, transactionData]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mb-8">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>

          {booking && (
            <div className="bg-muted/50 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold mb-2">Booking Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono">{booking.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-600 capitalize">{booking.status}</span>
                </div>
                {booking.paidAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span>NPR {booking.paidAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate("/dashboard/bookings")}
            >
              View My Bookings
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
