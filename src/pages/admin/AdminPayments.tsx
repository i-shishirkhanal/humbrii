import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, DollarSign, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

const AdminPayments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "booking" | "payout" | "refund">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "full" | "partial" | "pending">("all");

  /* Fetch live bookings to simulate payments */
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, profiles(full_name), properties(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getPaidAmount = (booking: any) => {
    if (booking.payment_status === "paid") return booking.total_amount;
    if (booking.payment_status === "partial") return Math.round(booking.total_amount * 0.2); // Assuming 20% down payment
    return 0;
  };

  const processedPayments = bookings.map((booking: any) => {
    const paid = getPaidAmount(booking);
    return {
      id: booking.id,
      booking_id: booking.id,
      property_name: booking.properties?.name || "Unknown Property",
      guest_name: booking.profiles?.full_name || "Guest",
      total_amount: booking.total_amount,
      paid_amount: paid,
      remaining_amount: booking.total_amount - paid,
      payment_type: booking.payment_status || "pending",
      status: booking.status,
      method: "eSewa", // Defaulting as placeholder
      created_at: new Date(booking.created_at),
      type: "booking",
    };
  });

  const filteredPayments = processedPayments.filter((p: any) => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.guest_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.property_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === "all" || typeFilter === "booking";

    const matchesPayment = paymentFilter === "all" ||
      (paymentFilter === "full" && p.payment_type === "paid") ||
      (paymentFilter === "partial" && p.payment_type === "partial") ||
      (paymentFilter === "pending" && (p.payment_type === "pending" || p.payment_type === "unpaid")); // 'unpaid' not in enum but handled just in case

    return matchesSearch && matchesType && matchesPayment;
  });

  const totalRevenue = processedPayments.reduce((acc: number, p: any) => acc + p.paid_amount, 0);
  const totalPayouts = 0; // No payouts table yet
  const pendingPayments = processedPayments.reduce((acc: number, p: any) => acc + p.remaining_amount, 0);
  const fullPayments = processedPayments.filter((p: any) => p.payment_type === "paid").length;
  const partialPayments = processedPayments.filter((p: any) => p.payment_type === "partial").length;

  const getPaymentBadge = (payment: any) => {
    if (payment.payment_type === "paid") {
      return <Badge className="bg-success/10 text-success border-success/20">Full Payment</Badge>;
    } else if (payment.remaining_amount > 0 && payment.paid_amount > 0) {
      return <Badge className="bg-warning/10 text-warning border-warning/20">Partial ({Math.round((payment.paid_amount / payment.total_amount) * 100)}%)</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-1">Track all transactions, payments, and payouts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">NPR {totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Collected</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ArrowUpRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">NPR {totalPayouts.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Host Payouts</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">NPR {pendingPayments.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pending Amount</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{fullPayments}</p>
                <p className="text-xs text-muted-foreground">Full Payments</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{partialPayments}</p>
                <p className="text-xs text-muted-foreground">Partial Payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, guest, or property..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center mr-2">Type:</span>
            {(["all", "booking", "payout", "refund"] as const).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
            <span className="text-sm text-muted-foreground self-center ml-4 mr-2">Payment:</span>
            {(["all", "full", "partial", "pending"] as const).map((type) => (
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

        {/* Payments Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Transaction</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Guest/Property</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Paid</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Remaining</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payment Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Progress</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <span className="font-mono text-sm font-medium">{payment.id}</span>
                          <div className="flex items-center gap-1 mt-1">
                            {payment.type === "booking" ? (
                              <ArrowDownRight className="w-3 h-3 text-success" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-primary" />
                            )}
                            <span className="text-xs text-muted-foreground capitalize">{payment.type}</span>
                            <Badge variant="outline" className="text-xs ml-1">{payment.method}</Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {payment.type === "booking" ? (
                          <div>
                            <p className="font-medium text-sm">{payment.guest_name}</p>
                            <p className="text-xs text-muted-foreground">{payment.property_name}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Host Payout</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-medium">NPR {payment.total_amount.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-success">NPR {payment.paid_amount.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        {payment.remaining_amount > 0 ? (
                          <span className="font-medium text-warning">NPR {payment.remaining_amount.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {getPaymentBadge(payment)}
                      </td>
                      <td className="p-4 min-w-[120px]">
                        {payment.type === "booking" && (
                          <div className="space-y-1">
                            <Progress
                              value={(payment.paid_amount / payment.total_amount) * 100}
                              className="h-2"
                            />
                            <span className="text-xs text-muted-foreground">
                              {Math.round((payment.paid_amount / payment.total_amount) * 100)}% paid
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(payment.created_at, "MMM d, yyyy")}
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
          <h3 className="font-semibold text-foreground mb-1">Payment Integration Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Full payment processing with eSewa, Khalti, and bank transfers will be available soon.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPayments;