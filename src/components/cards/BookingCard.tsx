import { Calendar, MapPin, Clock, Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingCardProps {
  id: string;
  propertyName: string;
  propertyImage: string;
  location: string;
  checkIn: string;
  checkOut: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalAmount: number;
  bookingType: "hourly" | "full_stay" | "daycation";
}

const BookingCard = ({
  propertyName,
  propertyImage,
  location,
  checkIn,
  checkOut,
  status,
  totalAmount,
  bookingType,
}: BookingCardProps) => {
  const statusColors = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-success/10 text-success",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const bookingTypeLabels = {
    hourly: "Hourly Booking",
    full_stay: "Full Stay",
    daycation: "Daycation",
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-soft border border-border hover:shadow-medium transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-48 h-32 sm:h-auto">
          <img
            src={propertyImage}
            alt={propertyName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {bookingTypeLabels[bookingType]}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-card-foreground">{propertyName}</h3>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm">{location}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-card-foreground">
                NPR {totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{checkIn}</span>
            </div>
            <ChevronRight className="w-4 h-4" />
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{checkOut}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {status === "confirmed" && (
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" />
                Download Confirmation
              </Button>
            )}
            <Button size="sm" variant="ghost">
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
