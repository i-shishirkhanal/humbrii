import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import BookingCard from "@/components/cards/BookingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const mockBookings = [
  {
    id: "1",
    propertyName: "Himalayan View Resort",
    propertyImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    location: "Pokhara, Nepal",
    checkIn: "Dec 25, 2024",
    checkOut: "Dec 28, 2024",
    status: "confirmed" as const,
    totalAmount: 25500,
    paidAmount: 25500,
    paymentType: "full" as const,
    bookingType: "full_stay" as const,
  },
  {
    id: "2",
    propertyName: "Heritage Boutique Hotel",
    propertyImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    location: "Bhaktapur, Nepal",
    checkIn: "Jan 5, 2025",
    checkOut: "Jan 6, 2025",
    status: "confirmed" as const,
    totalAmount: 6200,
    paidAmount: 1240, // 20% of 6200
    paymentType: "partial" as const,
    bookingType: "daycation" as const,
  },
  {
    id: "3",
    propertyName: "Lakeside Paradise Villa",
    propertyImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    location: "Pokhara, Nepal",
    checkIn: "Nov 15, 2024",
    checkOut: "Nov 18, 2024",
    status: "completed" as const,
    totalAmount: 36000,
    paidAmount: 36000,
    paymentType: "full" as const,
    bookingType: "full_stay" as const,
    hasRated: false,
  },
  {
    id: "4",
    propertyName: "Mountain Retreat",
    propertyImage: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    location: "Nagarkot, Nepal",
    checkIn: "Oct 10, 2024",
    checkOut: "Oct 12, 2024",
    status: "completed" as const,
    totalAmount: 18000,
    paidAmount: 18000,
    paymentType: "full" as const,
    bookingType: "full_stay" as const,
    hasRated: true,
  },
];

const UserBookings = () => {
  const upcomingBookings = mockBookings.filter(b => b.status === "confirmed");
  const pastBookings = mockBookings.filter(b => b.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Bookings</h1>
              <p className="text-muted-foreground mt-1">Manage and view all your bookings</p>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
                <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-4">
                <div className="space-y-4">
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.map((booking) => (
                      <BookingCard key={booking.id} {...booking} />
                    ))
                  ) : (
                    <div className="bg-card rounded-xl border border-border p-8 text-center">
                      <p className="text-muted-foreground">No upcoming bookings</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="past" className="mt-4">
                <div className="space-y-4">
                  {pastBookings.length > 0 ? (
                    pastBookings.map((booking) => (
                      <BookingCard key={booking.id} {...booking} />
                    ))
                  ) : (
                    <div className="bg-card rounded-xl border border-border p-8 text-center">
                      <p className="text-muted-foreground">No past bookings</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default UserBookings;
