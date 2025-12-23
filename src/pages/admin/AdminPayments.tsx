import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, DollarSign, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import { format } from "date-fns";

// Mock data
const mockPayments = [
  {
    id: "PAY001",
    booking_id: "1",
    amount: 25500,
    status: "completed",
    method: "eSewa",
    created_at: new Date("2024-01-10"),
    type: "booking",
  },
  {
    id: "PAY002",
    booking_id: "2",
    amount: 16000,
    status: "pending",
    method: "Khalti",
    created_at: new Date("2024-01-12"),
    type: "booking",
  },
  {
    id: "PAY003",
    booking_id: null,
    amount: 20000,
    status: "completed",
    method: "Bank Transfer",
    created_at: new Date("2024-01-08"),
    type: "payout",
  },
];

const AdminPayments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "booking" | "payout" | "refund">("all");

  const filteredPayments = mockPayments.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalRevenue = mockPayments.filter(p => p.type === "booking" && p.status === "completed").reduce((acc, p) => acc + p.amount, 0);
  const totalPayouts = mockPayments.filter(p => p.type === "payout" && p.status === "completed").reduce((acc, p) => acc + p.amount, 0);
  const pendingPayments = mockPayments.filter(p => p.status === "pending").reduce((acc, p) => acc + p.amount, 0);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-1">Track all transactions and payouts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">NPR {totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ArrowUpRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">NPR {totalPayouts.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Host Payouts</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">NPR {pendingPayments.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockPayments.length}</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
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
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Transaction ID</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-4">
                        <span className="font-mono text-sm">{payment.id}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {payment.type === "booking" ? (
                            <ArrowDownRight className="w-4 h-4 text-success" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                          )}
                          <span className="capitalize">{payment.type}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{payment.method}</Badge>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${payment.type === "payout" ? "text-primary" : "text-success"}`}>
                          {payment.type === "payout" ? "-" : "+"}NPR {payment.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                          {payment.status}
                        </Badge>
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