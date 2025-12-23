import HostLayout from "@/components/layout/HostLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, Calendar } from "lucide-react";

const mockBookings = [
  {
    id: "1",
    guestName: "Ram Sharma",
    guestEmail: "ram@example.com",
    property: "Himalayan View Resort",
    roomType: "Deluxe",
    checkIn: "Dec 25, 2024",
    checkOut: "Dec 28, 2024",
    guests: 2,
    amount: "NPR 25,500",
    status: "pending",
  },
  {
    id: "2",
    guestName: "Sita Thapa",
    guestEmail: "sita@example.com",
    property: "Lakeside Villa",
    roomType: "Suite",
    checkIn: "Dec 26, 2024",
    checkOut: "Dec 27, 2024",
    guests: 4,
    amount: "NPR 12,000",
    status: "confirmed",
  },
  {
    id: "3",
    guestName: "Hari Gurung",
    guestEmail: "hari@example.com",
    property: "Himalayan View Resort",
    roomType: "Standard",
    checkIn: "Dec 20, 2024",
    checkOut: "Dec 22, 2024",
    guests: 2,
    amount: "NPR 8,500",
    status: "completed",
  },
];

const HostBookings = () => {
  const pendingBookings = mockBookings.filter(b => b.status === "pending");
  const confirmedBookings = mockBookings.filter(b => b.status === "confirmed");
  const completedBookings = mockBookings.filter(b => b.status === "completed");

  const BookingRow = ({ booking }: { booking: typeof mockBookings[0] }) => (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-card-foreground">{booking.guestName}</p>
          <p className="text-xs text-muted-foreground">{booking.guestEmail}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{booking.property}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{booking.roomType}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {booking.checkIn} - {booking.checkOut}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-card-foreground">{booking.amount}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          booking.status === "confirmed" ? "bg-success/10 text-success" :
          booking.status === "pending" ? "bg-warning/10 text-warning" :
          "bg-muted text-muted-foreground"
        }`}>
          {booking.status}
        </span>
      </td>
      <td className="px-4 py-3">
        {booking.status === "pending" && (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-success hover:bg-success/10">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        {booking.status !== "pending" && (
          <Button size="sm" variant="ghost">Details</Button>
        )}
      </td>
    </tr>
  );

  const BookingCard = ({ booking }: { booking: typeof mockBookings[0] }) => (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-card-foreground">{booking.guestName}</p>
          <p className="text-xs text-muted-foreground">{booking.guestEmail}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          booking.status === "confirmed" ? "bg-success/10 text-success" :
          booking.status === "pending" ? "bg-warning/10 text-warning" :
          "bg-muted text-muted-foreground"
        }`}>
          {booking.status}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">{booking.property} • {booking.roomType}</p>
        <p className="text-muted-foreground">{booking.checkIn} - {booking.checkOut}</p>
        <p className="font-semibold text-card-foreground">{booking.amount}</p>
      </div>
      {booking.status === "pending" && (
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" className="flex-1 bg-success hover:bg-success/90">
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button size="sm" variant="destructive" className="flex-1">
            <X className="w-4 h-4 mr-1" />
            Decline
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <HostLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage guest bookings for your properties</p>
        </div>

        {mockBookings.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">Bookings will appear here once guests start booking your properties</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all" className="flex-1 md:flex-none">All ({mockBookings.length})</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1 md:flex-none">
                <Clock className="w-3 h-3 mr-1" />
                Pending ({pendingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="flex-1 md:flex-none">Confirmed ({confirmedBookings.length})</TabsTrigger>
              <TabsTrigger value="completed" className="flex-1 md:flex-none">Completed ({completedBookings.length})</TabsTrigger>
            </TabsList>

            {["all", "pending", "confirmed", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                {/* Desktop Table */}
                <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Guest</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Property</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Room</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Dates</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(tab === "all" ? mockBookings :
                          tab === "pending" ? pendingBookings :
                          tab === "confirmed" ? confirmedBookings :
                          completedBookings
                        ).map((booking) => (
                          <BookingRow key={booking.id} booking={booking} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden grid gap-4">
                  {(tab === "all" ? mockBookings :
                    tab === "pending" ? pendingBookings :
                    tab === "confirmed" ? confirmedBookings :
                    completedBookings
                  ).map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </HostLayout>
  );
};

export default HostBookings;
