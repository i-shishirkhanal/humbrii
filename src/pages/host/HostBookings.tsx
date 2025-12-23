import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock } from "lucide-react";

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

  return (
    <DashboardLayout role="host">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage guest bookings for your properties</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({mockBookings.length})</TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="w-3 h-3 mr-1" />
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          </TabsList>

          {["all", "pending", "confirmed", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default HostBookings;
