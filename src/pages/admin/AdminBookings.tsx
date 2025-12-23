import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Building2, User, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

// Mock data - will be replaced with real data when bookings table is created
const mockBookings = [
  {
    id: "1",
    property_name: "Himalayan View Resort",
    guest_name: "John Doe",
    check_in: new Date("2024-01-15"),
    check_out: new Date("2024-01-18"),
    status: "confirmed",
    total: 25500,
    created_at: new Date("2024-01-10"),
  },
  {
    id: "2",
    property_name: "Lakeside Paradise Villa",
    guest_name: "Jane Smith",
    check_in: new Date("2024-01-20"),
    check_out: new Date("2024-01-22"),
    status: "pending",
    total: 16000,
    created_at: new Date("2024-01-12"),
  },
  {
    id: "3",
    property_name: "City Center Express",
    guest_name: "Mike Johnson",
    check_in: new Date("2024-01-10"),
    check_out: new Date("2024-01-10"),
    status: "completed",
    total: 3000,
    created_at: new Date("2024-01-08"),
  },
];

const AdminBookings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");

  const filteredBookings = mockBookings.filter(b => {
    const matchesSearch = b.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Booking Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-foreground">{mockBookings.length}</p>
            <p className="text-sm text-muted-foreground">Total Bookings</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-warning">{mockBookings.filter(b => b.status === "pending").length}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-success">{mockBookings.filter(b => b.status === "confirmed").length}</p>
            <p className="text-sm text-muted-foreground">Confirmed</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-muted-foreground">{mockBookings.filter(b => b.status === "completed").length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
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
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
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
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{booking.guest_name}</span>
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
                        <span className="font-medium">NPR {booking.total.toLocaleString()}</span>
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