import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Star, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GuestSelector from "./GuestSelector";

interface BookingWidgetProps {
  propertyId: string;
  propertyName: string;
  pricePerNight: number;
  maxGuests: number;
  rating?: number;
  className?: string;
}

const BookingWidget = ({
  propertyId,
  propertyName,
  pricePerNight,
  maxGuests,
  rating = 4.9,
  className,
}: BookingWidgetProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);

  // Fetch unavailable dates
  useEffect(() => {
    const fetchAvailability = async () => {
      const { data, error } = await supabase
        .from("property_availability")
        .select("date")
        .eq("property_id", propertyId)
        .eq("is_available", false);

      if (!error && data) {
        setUnavailableDates(data.map(d => new Date(d.date)));
      }
    };

    fetchAvailability();
  }, [propertyId]);

  const nights = checkInDate && checkOutDate 
    ? differenceInDays(checkOutDate, checkInDate) 
    : 0;
  
  const subtotal = pricePerNight * Math.max(nights, 1);
  const serviceFee = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + serviceFee;
  const partialAmount = Math.round(totalAmount * 0.2);
  const remainingAmount = totalAmount - partialAmount;

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      (unavailable) => 
        unavailable.getFullYear() === date.getFullYear() &&
        unavailable.getMonth() === date.getMonth() &&
        unavailable.getDate() === date.getDate()
    );
  };

  const handleReserve = () => {
    if (!user) {
      toast.error("Please sign in to make a booking");
      navigate("/auth");
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (checkOutDate <= checkInDate) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setShowCheckout(true);
  };

  const handlePayment = async () => {
    if (!user || !checkInDate || !checkOutDate) return;

    setIsLoading(true);

    try {
      const paymentAmount = paymentType === "full" ? totalAmount : partialAmount;

      // Create booking in database
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          property_id: propertyId,
          user_id: user.id,
          check_in_date: format(checkInDate, "yyyy-MM-dd"),
          check_out_date: format(checkOutDate, "yyyy-MM-dd"),
          guests,
          total_amount: totalAmount,
          paid_amount: 0,
          payment_type: paymentType,
          payment_status: "pending",
          booking_status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Call eSewa edge function
      const { data: paymentData, error: paymentError } = await supabase.functions
        .invoke("esewa-payment", {
          body: {
            bookingId: booking.id,
            amount: paymentAmount,
            productName: propertyName,
            paymentType,
          },
        });

      if (paymentError) throw paymentError;

      if (paymentData?.paymentUrl) {
        // Redirect to eSewa
        window.location.href = paymentData.paymentUrl;
      } else {
        // For demo, simulate success
        toast.success("Booking created! Redirecting to payment...");
        
        // Update booking status
        await supabase
          .from("bookings")
          .update({ 
            booking_status: "confirmed",
            payment_status: paymentType === "full" ? "paid" : "partial",
            paid_amount: paymentAmount,
          })
          .eq("id", booking.id);

        navigate("/dashboard/bookings");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  if (showCheckout) {
    return (
      <div className={cn("bg-card border border-border rounded-xl p-6 shadow-lg", className)}>
        <button 
          onClick={() => setShowCheckout(false)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h3 className="text-xl font-semibold mb-4">Payment Options</h3>
        
        <RadioGroup 
          value={paymentType} 
          onValueChange={(v) => setPaymentType(v as "full" | "partial")} 
          className="space-y-3"
        >
          <div className={cn(
            "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
            paymentType === "full" 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-muted-foreground"
          )}>
            <RadioGroupItem value="full" id="full" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="full" className="font-semibold cursor-pointer">
                Pay in full
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Pay NPR {totalAmount.toLocaleString()} now
              </p>
            </div>
          </div>

          <div className={cn(
            "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
            paymentType === "partial" 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-muted-foreground"
          )}>
            <RadioGroupItem value="partial" id="partial" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="partial" className="font-semibold cursor-pointer">
                Pay 20% now
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Pay NPR {partialAmount.toLocaleString()} now, NPR {remainingAmount.toLocaleString()} on check-in
              </p>
            </div>
          </div>
        </RadioGroup>

        {/* Booking Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-in</span>
            <span>{checkInDate ? format(checkInDate, "MMM d, yyyy") : "-"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-out</span>
            <span>{checkOutDate ? format(checkOutDate, "MMM d, yyyy") : "-"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Guests</span>
            <span>{guests}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-border">
            <span>Amount to pay now</span>
            <span>NPR {(paymentType === "full" ? totalAmount : partialAmount).toLocaleString()}</span>
          </div>
        </div>

        {/* eSewa Payment Button */}
        <div className="mt-6">
          <Button 
            className="w-full bg-[#60BB46] hover:bg-[#4fa03a] text-white"
            size="lg"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <img 
                src="https://esewa.com.np/common/images/esewa_logo.png" 
                alt="eSewa" 
                className="h-5 mr-2 brightness-0 invert"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            )}
            {isLoading ? "Processing..." : "Pay with eSewa"}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Secure payment powered by eSewa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 shadow-lg", className)}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <span className="text-2xl font-bold">NPR {pricePerNight.toLocaleString()}</span>
          <span className="text-muted-foreground"> /night</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <span className="font-semibold">{rating}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Check-in</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkInDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkInDate ? format(checkInDate, "MMM d") : "Select"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={(date) => {
                    setCheckInDate(date);
                    if (date && (!checkOutDate || checkOutDate <= date)) {
                      setCheckOutDate(addDays(date, 1));
                    }
                  }}
                  disabled={(date) => 
                    date < new Date() || isDateUnavailable(date)
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Check-out</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkOutDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOutDate ? format(checkOutDate, "MMM d") : "Select"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOutDate}
                  onSelect={setCheckOutDate}
                  disabled={(date) => 
                    date < new Date() || 
                    (checkInDate && date <= checkInDate) ||
                    isDateUnavailable(date)
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Guest Selector */}
        <GuestSelector
          value={guests}
          onChange={setGuests}
          max={maxGuests}
        />

        <Button className="w-full" size="lg" onClick={handleReserve}>
          Reserve Now
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          You won't be charged yet
        </p>
      </div>

      {/* Price Breakdown */}
      {nights > 0 && (
        <div className="mt-6 pt-6 border-t border-border space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              NPR {pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
            </span>
            <span>NPR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service fee</span>
            <span>NPR {serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold pt-3 border-t border-border">
            <span>Total</span>
            <span>NPR {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingWidget;
