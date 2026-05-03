import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { differenceInDays, addDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, ArrowLeft, Star, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import GuestSelector from "./GuestSelector";
import { bookingsService } from "@/services/bookings.service";
import { authService } from "@/services/auth.service";
import { paymentsService } from "@/services/payments.service";
import { supabase } from "@/integrations/supabase/client";

interface BookingWidgetProps {
  propertyId: string;
  propertyName: string;
  pricePerNight: number;
  maxGuests: number;
  rating?: number;
  className?: string;
  category?: string; // Add category
}

const BookingWidget = ({
  propertyId,
  propertyName,
  pricePerNight,
  maxGuests,
  rating = 4.9,
  className,
  category = "full_stay", // Default
}: BookingWidgetProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  // ... (hooks) ...
  const { user } = useAuth();
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  // ... (useEffect for availability same as before) ...
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

  // ... (useEffect for profile same as before) ...
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const data = await authService.getProfile(user.id);
        if (data) {
          setPhoneNumber(data.phone || "");
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, [user]);

  // Logic for duration
  const isHourly = category === "hourly" || category === "vibe_chill";
  const isDaily = category === "daycation";
  const isNightly = category === "full_stay" || (!isHourly && !isDaily);

  const diff = checkInDate && checkOutDate
    ? (isHourly
      ? Math.abs(checkOutDate.getTime() - checkInDate.getTime()) / 36e5 // Diff in hours
      : differenceInDays(checkOutDate, checkInDate))
    : 0;

  const units = Math.max(Math.ceil(diff), 1);
  const unitLabel = isHourly ? "hour" : isDaily ? "day" : "night";
  const unitsLabel = `${units} ${unitLabel}${units > 1 ? "s" : ""}`;

  const nights = units; // variable alias for compatibility

  const subtotal = pricePerNight * nights;
  const serviceFee = 0;
  const totalAmount = subtotal;
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
      navigate("/auth", { state: { from: location } });
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    // Validation Logic
    if (isNightly) {
      if (checkOutDate <= checkInDate) {
        toast.error("Check-out date must be after check-in date for full stays");
        return;
      }
    } else {
      // Hourly/Daycation: Allow same day (CheckOut >= CheckIn)
      if (checkOutDate < checkInDate) {
        toast.error("Check-out date cannot be before check-in date");
        return;
      }
    }

    setShowCheckout(true);
  };

  const handlePayment = async () => {
    if (!user || !checkInDate || !checkOutDate) return;

    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setIsLoading(true);

    try {
      // Update phone number via service (keep profile update)
      await authService.updateProfile(user.id, { phone: phoneNumber });

      // Initiate Payment directly (No Booking creation first)
      const response = await paymentsService.initiatePayment({
        property_id: propertyId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guests: guests,
        payment_type: paymentType,
        success_url: `${window.location.origin}/payment/success`,
        failure_url: `${window.location.origin}/payment/failure`
      });

      if (response?.action_url) {
        // Create form and submit to eSewa
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", response.action_url);

        // Add all fields
        const fields = [
          'amount', 'tax_amount', 'total_amount', 'transaction_uuid',
          'product_code', 'product_service_charge', 'product_delivery_charge',
          'success_url', 'failure_url', 'signed_field_names', 'signature'
        ];

        fields.forEach(field => {
          if (response[field] !== undefined) {
            const hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", field);
            hiddenField.setAttribute("value", response[field]);
            form.appendChild(hiddenField);
          }
        });

        document.body.appendChild(form);
        form.submit();

      } else {
        // Fallback for demo/testing or if direct URL wasn't returned
        toast.success("Payment initiated! Redirecting...");
        if (response?.payment_url) {
          window.location.href = response.payment_url;
        }
      }

    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment");
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

        <div className="mb-6">
          <Label htmlFor="phone" className="mb-2 block">Phone Number *</Label>
          <Input
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will be shared with the host for coordination.
          </p>
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
          <span className="text-muted-foreground"> /{unitLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <span className="font-semibold">{rating}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`space-y-2 ${!isNightly ? "col-span-2" : ""}`}>
            <label className="text-sm font-medium">
              {isNightly ? "Check-in" : "Date"}
            </label>
            <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkInDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkInDate ? format(checkInDate, "MMM d") : "Select Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={(date) => {
                    setCheckInDate(date);
                    if (!isNightly && date) {
                      setCheckOutDate(date);
                      setIsCheckInOpen(false); // Auto-close
                    } else if (isNightly && date && (!checkOutDate || checkOutDate <= date)) {
                      setCheckOutDate(addDays(date, 1));
                      setIsCheckInOpen(false);
                    } else {
                      setIsCheckInOpen(false);
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

          {isNightly && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Check-out</label>
              <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOutDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "MMM d") : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={(date) => {
                      setCheckOutDate(date);
                      setIsCheckOutOpen(false); // Auto-close
                    }}
                    disabled={(date) =>
                      date < (checkInDate || new Date()) || isDateUnavailable(date)
                    }
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
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
              NPR {pricePerNight.toLocaleString()} × {unitsLabel}
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
