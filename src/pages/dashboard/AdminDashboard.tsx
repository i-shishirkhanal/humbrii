import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import { Users, Building2, Calendar, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const recentActions = [
  { action: "Approved host registration", user: "Mountain Resort Pvt Ltd", time: "2 hours ago", type: "success" },
  { action: "Resolved payment dispute", user: "Booking #4521", time: "4 hours ago", type: "success" },
  { action: "Suspended host account", user: "Shady Hotels", time: "1 day ago", type: "warning" },
  { action: "Rejected property listing", user: "Incomplete Villa", time: "1 day ago", type: "error" },
];

const pendingApprovals = [
  { name: "Everest View Lodge", type: "New Host", submitted: "Dec 20, 2024", documents: 5 },
  { name: "Kathmandu Garden Hotel", type: "Property Listing", submitted: "Dec 21, 2024", documents: 8 },
  { name: "Chitwan Safari Resort", type: "New Host", submitted: "Dec 22, 2024", documents: 6 },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Admin Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Platform governance and system control
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/logs">
              <Button variant="outline">
                View Audit Logs
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant="destructive">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency Controls
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value="2,847"
            change="+124 this month"
            changeType="positive"
            icon={Users}
            iconColor="text-primary"
          />
          <StatCard
            title="Active Hosts"
            value={156}
            change="+8 pending approval"
            changeType="neutral"
            icon={Building2}
            iconColor="text-success"
          />
          <StatCard
            title="Active Bookings"
            value={342}
            change="+18% from last week"
            changeType="positive"
            icon={Calendar}
            iconColor="text-accent"
          />
          <StatCard
            title="Revenue (This Month)"
            value="NPR 24.5L"
            change="+22% from last month"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-warning"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Pending Approvals</h2>
              <span className="px-2 py-1 bg-warning/10 text-warning rounded-full text-xs font-medium">
                {pendingApprovals.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {pendingApprovals.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-card-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.type} • {item.documents} documents
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-success hover:bg-success/10">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/admin/hosts">
              <Button variant="ghost" className="w-full mt-4">
                View All Pending
              </Button>
            </Link>
          </div>

          {/* Recent Admin Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Recent Actions</h2>
              <Link to="/admin/logs">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentActions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className={`p-1.5 rounded-full mt-0.5 ${
                    action.type === "success" ? "bg-success/10 text-success" :
                    action.type === "warning" ? "bg-warning/10 text-warning" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {action.type === "success" ? <CheckCircle className="w-4 h-4" /> :
                     action.type === "warning" ? <AlertTriangle className="w-4 h-4" /> :
                     <XCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{action.action}</p>
                    <p className="text-sm text-muted-foreground">{action.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {action.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-success">Bookings</span>
              </div>
              <p className="text-2xl font-bold text-card-foreground">Active</p>
            </div>
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-success">Payments</span>
              </div>
              <p className="text-2xl font-bold text-card-foreground">Active</p>
            </div>
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-success">eSewa</span>
              </div>
              <p className="text-2xl font-bold text-card-foreground">Connected</p>
            </div>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-sm font-medium text-warning">Disputes</span>
              </div>
              <p className="text-2xl font-bold text-card-foreground">3 Open</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
