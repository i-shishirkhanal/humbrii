import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import { Users, Building2, Calendar, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const recentActions = [
  { action: "Approved host registration", user: "Mountain Resort Pvt Ltd", time: "2 hours ago", type: "success" },
  { action: "Resolved payment dispute", user: "Booking #4521", time: "4 hours ago", type: "success" },
  { action: "Suspended host account", user: "Shady Hotels", time: "1 day ago", type: "warning" },
];

const pendingApprovals = [
  { name: "Everest View Lodge", type: "New Host", submitted: "Dec 20, 2024", documents: 5 },
  { name: "Kathmandu Garden Hotel", type: "Property Listing", submitted: "Dec 21, 2024", documents: 8 },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Platform governance and control</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value="2,847" change="+124 this month" changeType="positive" icon={Users} iconColor="text-primary" />
          <StatCard title="Active Hosts" value={156} change="+8 pending" changeType="neutral" icon={Building2} iconColor="text-success" />
          <StatCard title="Active Bookings" value={342} icon={Calendar} iconColor="text-accent" />
          <StatCard title="Revenue (Month)" value="NPR 24.5L" change="+22%" changeType="positive" icon={DollarSign} iconColor="text-warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Pending Approvals</h2>
            <div className="space-y-3">
              {pendingApprovals.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-card-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="text-success"><CheckCircle className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive"><XCircle className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Recent Actions</h2>
            <div className="space-y-3">
              {recentActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`p-1.5 rounded-full ${action.type === "success" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {action.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{action.action}</p>
                    <p className="text-sm text-muted-foreground">{action.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{action.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
