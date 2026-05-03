import HostLayout from "@/components/layout/HostLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Clock, Calendar, DollarSign, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const HostBookings = () => {
  const { user } = useAuth();

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ["host-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch bookings for properties owned by the current user
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          properties!inner(
            id,
            name,
            host_id
          ),
          profiles:user_id(
            full_name,
            id
          )
        `)
        .eq("properties.host_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
      };

      return data.map((b: any) => ({
        id: b.id,
        guestName: b.profiles?.full_name || "Guest",
        guestEmail: "Hidden", // Email privacy or fetch if needed
        property: b.properties?.name || "Unknown Property",
        roomType: "Entire Place", // Default or fetch form rooms
        checkIn: new Date(b.check_in_date).toLocaleDateString(),
        checkOut: new Date(b.check_out_date).toLocaleDateString(),
        guests: b.guests,
        totalAmount: b.total_amount,
        paidAmount: b.paid_amount,
        remainingAmount: b.total_amount - b.paid_amount,
        paymentStatus: b.payment_status, // "paid", "partial", "pending"
        paymentMethod: b.payment_method, // "esewa", "khalti"
        status: b.booking_status, // "pending", "confirmed", "cancelled", "completed"
      }));
    },
    enabled: !!user,
  });

  const handleAction = async (bookingId: string, action: "confirmed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ booking_status: action })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success(`Booking ${action}`);
      refetch();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking status");
    }
  };

  const pendingBookings = bookings.filter((b: any) => b.status === "pending");
  const confirmedBookings = bookings.filter((b: any) => b.status === "confirmed");
  const completedBookings = bookings.filter((b: any) => b.status === "completed");

  const totalRevenue = bookings.reduce((acc: number, b: any) => acc + (b.paidAmount || 0), 0);
  const pendingPayments = bookings.reduce((acc: number, b: any) => acc + (b.remainingAmount > 0 ? b.remainingAmount : 0), 0);
  const fullyPaidCount = bookings.filter((b: any) => b.paymentStatus === "paid").length;
  const partialPaidCount = bookings.filter((b: any) => b.paymentStatus === "partial").length;

  const getPaymentBadge = (booking: any) => {
    if (booking.paymentStatus === "paid" || booking.paymentStatus === "full") {
      return <Badge className="bg-success/10 text-success border-success/20 text-xs">Fully Paid</Badge>;
    } else if (booking.paymentStatus === "partial") {
      return <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">Partial ({Math.round((booking.paidAmount / booking.totalAmount) * 100)}%)</Badge>;
    }
    return <Badge variant="destructive" className="text-xs">Unpaid</Badge>;
  };

  const BookingRow = ({ booking }: { booking: any }) => (
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
      <td className="px-4 py-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-card-foreground">NPR {booking.totalAmount.toLocaleString()}</p>
          <p className="text-xs text-success">Paid: NPR {booking.paidAmount.toLocaleString()}</p>
          {booking.remainingAmount > 0 && (
            <p className="text-xs text-warning">Due: NPR {booking.remainingAmount.toLocaleString()}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-1">
          {getPaymentBadge(booking)}
          <div className="w-20">
            <Progress value={(booking.paidAmount / booking.totalAmount) * 100} className="h-1.5" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "confirmed" ? "bg-success/10 text-success" :
            booking.status === "pending" ? "bg-warning/10 text-warning" :
              "bg-muted text-muted-foreground"
          }`}>
          {booking.status}
        </span>
      </td>
      <td className="px-4 py-3">
        {booking.status === "pending" && (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-success hover:bg-success/10"
              onClick={() => handleAction(booking.id, "confirmed")}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
              onClick={() => handleAction(booking.id, "cancelled")}
            >
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

  const BookingCard = ({ booking }: { booking: any }) => (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-card-foreground">{booking.guestName}</p>
          <p className="text-xs text-muted-foreground">{booking.guestEmail}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "confirmed" ? "bg-success/10 text-success" :
            booking.status === "pending" ? "bg-warning/10 text-warning" :
              "bg-muted text-muted-foreground"
          }`}>
          {booking.status}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">{booking.property} • {booking.roomType}</p>
        <p className="text-muted-foreground">{booking.checkIn} - {booking.checkOut}</p>

        {/* Payment Details */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold text-card-foreground">NPR {booking.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid:</span>
            <span className="font-medium text-success">NPR {booking.paidAmount.toLocaleString()}</span>
          </div>
          {booking.remainingAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-medium text-warning">NPR {booking.remainingAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="pt-1">
            <Progress value={(booking.paidAmount / booking.totalAmount) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {Math.round((booking.paidAmount / booking.totalAmount) * 100)}% paid via {booking.paymentMethod}
            </p>
          </div>
          <div className="pt-1">
            {getPaymentBadge(booking)}
          </div>
        </div>
      </div>
      {booking.status === "pending" && (
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 bg-success hover:bg-success/90"
            onClick={() => handleAction(booking.id, "confirmed")}
          >
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => handleAction(booking.id, "cancelled")}
          >
            <X className="w-4 h-4 mr-1" />
            Decline
          </Button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <HostLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage guest bookings and payments for your properties</p>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Total Collected</span>
            </div>
            <p className="text-xl font-bold text-success">NPR {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground">Pending Payments</span>
            </div>
            <p className="text-xl font-bold text-warning">NPR {pendingPayments.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Fully Paid</span>
            </div>
            <p className="text-xl font-bold text-foreground">{fullyPaidCount} bookings</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground">Partial Payments</span>
            </div>
            <p className="text-xl font-bold text-foreground">{partialPaidCount} bookings</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">Bookings will appear here once guests start booking your properties</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all" className="flex-1 md:flex-none">All ({bookings.length})</TabsTrigger>
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
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payment</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(tab === "all" ? bookings :
                          tab === "pending" ? pendingBookings :
                            tab === "confirmed" ? confirmedBookings :
                              completedBookings
                        ).map((booking: any) => (
                          <BookingRow key={booking.id} booking={booking} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden grid gap-4">
                  {(tab === "all" ? bookings :
                    tab === "pending" ? pendingBookings :
                      tab === "confirmed" ? confirmedBookings :
                        completedBookings
                  ).map((booking: any) => (
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