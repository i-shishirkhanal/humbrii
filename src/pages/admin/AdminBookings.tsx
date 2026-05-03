
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, Building2, User, Loader2, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Clock, X, Check, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { bookingsService, BookingWithDetails } from "@/services/bookings.service";

const AdminBookings = () => {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: bookings = [], isLoading, isFetching } = useQuery({
    queryKey: ["admin-bookings", page, activeTab, searchQuery],
    queryFn: () => bookingsService.getAdminBookings(page, activeTab, searchQuery),
    placeholderData: keepPreviousData,
  });

  const getPaidAmount = (booking: BookingWithDetails) => {
    // Robust logic should be in backend/service, but for UI display:
    if (booking.payment_status === 'paid') return Number(booking.total_amount);
    if (booking.payment_status === 'partial') return Number(booking.paid_amount || 0); // Assuming paid_amount exists on join or we calculate
    // Fallback if paid_amount not in type yet, assume logic
    if (booking.payment_status === 'partial') return Number(booking.total_amount) * 0.20;
    return 0;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const getPaymentBadge = (booking: BookingWithDetails) => {
    const paid = getPaidAmount(booking);
    const total = Number(booking.total_amount);
    const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;

    if (booking.payment_status === "paid") {
      return <Badge className="bg-success/10 text-success border-success/20">Fully Paid</Badge>;
    } else if (booking.payment_status === "partial") {
      return <Badge className="bg-warning/10 text-warning border-warning/20">Partial ({percentage}%)</Badge>;
    }
    return <Badge variant="destructive">Unpaid</Badge>;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Booking Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all bookings with payment details</p>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or Guest..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setPage(0); }} className="w-full">
            <TabsList>
              {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                <TabsTrigger key={status} value={status} className="capitalize">
                  {status}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Bookings Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Booking / Property</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Guest</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Dates</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Financials</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => {
                    const paid = getPaidAmount(booking);
                    const total = Number(booking.total_amount);
                    const fullProperty = booking.properties?.name || "Unknown Property";
                    const guestName = booking.profiles?.full_name || "Unknown Guest";
                    const guestEmail = booking.profiles?.email || "No email";

                    return (
                      <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground truncate max-w-[200px]">{fullProperty}</p>
                              <p className="text-xs text-muted-foreground">#{booking.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-[150px]">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm font-medium truncate">{guestName}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate" title={guestEmail}>{guestEmail}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span>{format(new Date(booking.check_in_date), "MMM d")} - {format(new Date(booking.check_out_date), "MMM d")}</span>
                            </div>
                            <p className="text-xs text-muted-foreground pl-4">{new Date(booking.check_in_date).getFullYear()}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadge(booking.booking_status)}>
                            {booking.booking_status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1 min-w-[120px]">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Total:</span>
                              <span className="font-medium">NPR {total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Paid:</span>
                              <span className="text-success">NPR {paid.toLocaleString()}</span>
                            </div>
                            <div className="pt-1">
                              {getPaymentBadge(booking)}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm">Details</Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center flex-col items-center gap-2 mt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || isFetching}
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={bookings.length < 10 || isFetching}
              onClick={() => setPage(p => p + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {isFetching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminBookings;