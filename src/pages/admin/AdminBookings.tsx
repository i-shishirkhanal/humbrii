import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Building2, User, FileText, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

// Mock data with payment details
const mockBookings = [
  {
    id: "BK001",
    property_name: "Himalayan View Resort",
    guest_name: "Ram Sharma",
    guest_email: "ram@example.com",
    check_in: new Date("2024-01-15"),
    check_out: new Date("2024-01-18"),
    status: "confirmed",
    total_amount: 25500,
    paid_amount: 25500,
    remaining_amount: 0,
    payment_status: "full",
    payment_method: "eSewa",
    created_at: new Date("2024-01-10"),
  },
  {
    id: "BK002",
    property_name: "Lakeside Paradise Villa",
    guest_name: "Jane Smith",
    guest_email: "jane@example.com",
    check_in: new Date("2024-01-20"),
    check_out: new Date("2024-01-22"),
    status: "pending",
    total_amount: 16000,
    paid_amount: 8000,
    remaining_amount: 8000,
    payment_status: "partial",
    payment_method: "Khalti",
    created_at: new Date("2024-01-12"),
  },
  {
    id: "BK003",
    property_name: "City Center Express",
    guest_name: "Mike Johnson",
    guest_email: "mike@example.com",
    check_in: new Date("2024-01-10"),
    check_out: new Date("2024-01-10"),
    status: "completed",
    total_amount: 3000,
    paid_amount: 3000,
    remaining_amount: 0,
    payment_status: "full",
    payment_method: "Cash",
    created_at: new Date("2024-01-08"),
  },
  {
    id: "BK004",
    property_name: "Mountain Retreat",
    guest_name: "Sita Gurung",
    guest_email: "sita@example.com",
    check_in: new Date("2024-01-25"),
    check_out: new Date("2024-01-28"),
    status: "confirmed",
    total_amount: 18000,
    paid_amount: 6000,
    remaining_amount: 12000,
    payment_status: "partial",
    payment_method: "Bank Transfer",
    created_at: new Date("2024-01-14"),
  },
];

const AdminBookings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "full" | "partial" | "unpaid">("all");

  const filteredBookings = mockBookings.filter(b => {
    const matchesSearch = b.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || 
      (paymentFilter === "full" && b.payment_status === "full") ||
      (paymentFilter === "partial" && b.payment_status === "partial") ||
      (paymentFilter === "unpaid" && b.paid_amount === 0);
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmed: "default",
      pending: "secondary",
      completed: "outline",
      cancelled: "destructive",
    };
    return variants[status] || "secondary";
  };

  const getPaymentBadge = (booking: typeof mockBookings[0]) => {
    if (booking.payment_status === "full") {
      return <Badge className="bg-success/10 text-success border-success/20">Fully Paid</Badge>;
    } else if (booking.payment_status === "partial") {
      return <Badge className="bg-warning/10 text-warning border-warning/20">Partial ({Math.round((booking.paid_amount / booking.total_amount) * 100)}%)</Badge>;
    }
    return <Badge variant="destructive">Unpaid</Badge>;
  };

  const totalBookings = mockBookings.length;
  const fullyPaid = mockBookings.filter(b => b.payment_status === "full").length;
  const partiallyPaid = mockBookings.filter(b => b.payment_status === "partial").length;
  const totalPending = mockBookings.reduce((acc, b) => acc + b.remaining_amount, 0);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Booking Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all bookings with payment details</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-foreground">{totalBookings}</p>
            <p className="text-sm text-muted-foreground">Total Bookings</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-warning">{mockBookings.filter(b => b.status === "pending").length}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <p className="text-2xl font-bold text-success">{fullyPaid}</p>
            </div>
            <p className="text-sm text-muted-foreground">Fully Paid</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              <p className="text-2xl font-bold text-warning">{partiallyPaid}</p>
            </div>
            <p className="text-sm text-muted-foreground">Partial Payment</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-destructive">NPR {totalPending.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Pending Amount</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center mr-2">Status:</span>
            {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
            <span className="text-sm text-muted-foreground self-center ml-4 mr-2">Payment:</span>
            {(["all", "full", "partial", "unpaid"] as const).map((type) => (
              <Button
                key={type}
                variant={paymentFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentFilter(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Booking</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Guest</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Dates</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Paid</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Remaining</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payment</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Progress</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{booking.property_name}</p>
                            <p className="text-xs text-muted-foreground">#{booking.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{booking.guest_name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">{booking.guest_email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{format(booking.check_in, "MMM d")} - {format(booking.check_out, "MMM d, yyyy")}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusBadge(booking.status)}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">NPR {booking.total_amount.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-success">NPR {booking.paid_amount.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        {booking.remaining_amount > 0 ? (
                          <span className="font-medium text-warning">NPR {booking.remaining_amount.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {getPaymentBadge(booking)}
                      </td>
                      <td className="p-4 min-w-[120px]">
                        <div className="space-y-1">
                          <Progress 
                            value={(booking.paid_amount / booking.total_amount) * 100} 
                            className="h-2"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round((booking.paid_amount / booking.total_amount) * 100)}% paid
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl border border-border p-6 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Booking System Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Full booking management with real-time data will be available once the booking system is implemented.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminBookings;