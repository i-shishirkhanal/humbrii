import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking_id");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Payment Failed
          </h1>
          <p className="text-muted-foreground mb-8">
            We couldn't process your payment. Please try again or choose a different payment method.
          </p>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate(-1)}
            >
              Try Again
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

export default PaymentFailure;
