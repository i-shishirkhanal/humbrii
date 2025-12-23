import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, DollarSign, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

// Mock data with payment details
const mockPayments = [
  {
    id: "PAY001",
    booking_id: "BK001",
    property_name: "Himalayan View Resort",
    guest_name: "Ram Sharma",
    total_amount: 25500,
    paid_amount: 25500,
    remaining_amount: 0,
    payment_type: "full",
    status: "completed",
    method: "eSewa",
    created_at: new Date("2024-01-10"),
    type: "booking",
  },
  {
    id: "PAY002",
    booking_id: "BK002",
    property_name: "Lakeside Paradise Villa",
    guest_name: "Jane Smith",
    total_amount: 16000,
    paid_amount: 8000,
    remaining_amount: 8000,
    payment_type: "partial",
    status: "pending",
    method: "Khalti",
    created_at: new Date("2024-01-12"),
    type: "booking",
  },
  {
    id: "PAY003",
    booking_id: "BK003",
    property_name: "City Center Express",
    guest_name: "Mike Johnson",
    total_amount: 12000,
    paid_amount: 3000,
    remaining_amount: 9000,
    payment_type: "partial",
    status: "partially_paid",
    method: "Bank Transfer",
    created_at: new Date("2024-01-08"),
    type: "booking",
  },
  {
    id: "PAY004",
    booking_id: null,
    property_name: null,
    guest_name: null,
    total_amount: 20000,
    paid_amount: 20000,
    remaining_amount: 0,
    payment_type: "payout",
    status: "completed",
    method: "Bank Transfer",
    created_at: new Date("2024-01-08"),
    type: "payout",
  },
];

const AdminPayments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "booking" | "payout" | "refund">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "full" | "partial" | "pending">("all");

  const filteredPayments = mockPayments.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (p.property_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    const matchesPayment = paymentFilter === "all" || 
      (paymentFilter === "full" && p.payment_type === "full") ||
      (paymentFilter === "partial" && (p.payment_type === "partial" || p.status === "partially_paid")) ||
      (paymentFilter === "pending" && p.status === "pending");
    return matchesSearch && matchesType && matchesPayment;
  });

  const totalRevenue = mockPayments.filter(p => p.type === "booking").reduce((acc, p) => acc + p.paid_amount, 0);
  const totalPayouts = mockPayments.filter(p => p.type === "payout" && p.status === "completed").reduce((acc, p) => acc + p.paid_amount, 0);
  const pendingPayments = mockPayments.filter(p => p.remaining_amount > 0).reduce((acc, p) => acc + p.remaining_amount, 0);
  const fullPayments = mockPayments.filter(p => p.type === "booking" && p.payment_type === "full").length;
  const partialPayments = mockPayments.filter(p => p.type === "booking" && p.payment_type === "partial").length;

  const getPaymentBadge = (payment: typeof mockPayments[0]) => {
    if (payment.type === "payout") return null;
    
    if (payment.payment_type === "full" && payment.status === "completed") {
      return <Badge className="bg-success/10 text-success border-success/20">Full Payment</Badge>;
    } else if (payment.remaining_amount > 0) {
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