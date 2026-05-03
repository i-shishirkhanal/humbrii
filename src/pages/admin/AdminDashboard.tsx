import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import { Users, Building2, Calendar, Star, AlertTriangle, CheckCircle, XCircle, DollarSign, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { propertiesService } from "@/services/properties.service";

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // Fetch users count
  const { data: profiles } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name, email, created_at").limit(5).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: userCount } = useQuery({
    queryKey: ["admin-users-total"],
    queryFn: async () => {
      const { count, error } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
      if (error) throw error;
      return count;
    }
  });

  // Fetch properties
  const { data: properties } = useQuery({
    queryKey: ["admin-properties-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch bookings for revenue and stats
  const { data: bookings } = useQuery({
    queryKey: ["admin-bookings-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("total_amount, status, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const totalRevenue = bookings
    ?.filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;

  const totalBookings = bookings?.length || 0;
  const pendingProperties = properties?.filter(p => p.status === "draft" || p.status === "pending") || [];
  const recentProperties = properties?.slice(0, 5) || [];

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      // Use admin service method
      await propertiesService.adminUpdateProperty(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties-stats"] });
      toast.success("Property updated");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to update property");
    },
  });

  const handleApprove = (id: string) => {
    updatePropertyMutation.mutate({ id, updates: { status: "active", is_published: true } });
  };

  const handleReject = (id: string) => {
    updatePropertyMutation.mutate({ id, updates: { status: "suspended" } });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Overview</h1>
            <p className="text-muted-foreground mt-1">Platform performance and management</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/properties">
              <Button>
                <Building2 className="w-4 h-4 mr-2" />
                Manage Properties
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`NPR ${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-success"
            change="+12.5%"
            changeType="positive"
          />
          <StatCard
            title="Total Bookings"
            value={totalBookings}
            icon={Calendar}
            iconColor="text-primary"
            change="+4.3%"
            changeType="positive"
          />
          <StatCard
            title="Total Users"
            value={userCount || 0}
            icon={Users}
            iconColor="text-accent"
          />
          <StatCard
            title="Total Properties"
            value={properties?.length || 0}
            change={`${pendingProperties.length} pending`}
            changeType={pendingProperties.length > 0 ? "warning" : "neutral"}
            icon={Building2}
            iconColor="text-warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content Area - 2 Cols */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pending Approvals */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">Pending Approvals</h2>
                  <p className="text-sm text-muted-foreground">Properties waiting for review</p>
                </div>
                {pendingProperties.length > 0 && (
                  <Link to="/admin/properties?status=draft">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                )}
              </div>

              <div className="divide-y divide-border">
                {pendingProperties.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success/20" />
                    <p>All caught up! No pending properties.</p>
                  </div>
                ) : (
                  pendingProperties.slice(0, 5).map((property) => (
                    <div key={property.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {property.images?.[0] ? (
                          <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{property.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{property.location || property.city}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">Pending</span>
                          <span className="text-xs text-muted-foreground capitalize">{property.category?.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-success hover:bg-success/90 text-white" onClick={() => handleApprove(property.id)}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleReject(property.id)}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Properties */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">Recent Properties</h2>
                <Link to="/admin/properties">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              <div className="divide-y divide-border">
                {recentProperties.map((property) => (
                  <div key={property.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 text-primary">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{property.name}</p>
                      <p className="text-xs text-muted-foreground">Added {format(new Date(property.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">NPR {property.base_price || property.price_per_night}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${property.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                        {property.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar - 1 Col */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/admin/users" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" /> Manage Users
                  </Button>
                </Link>
                <Link to="/admin/bookings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" /> Recent Bookings
                  </Button>
                </Link>
                <Link to="/admin/settings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" /> Platform Settings
                  </Button>
                </Link>
              </div>
            </div>

            {/* Newest Users */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Newest Users</h3>
              </div>
              <div className="divide-y divide-border">
                {profiles?.map((profile: any) => (
                  <div key={profile.id} className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{profile.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/admin/users" className="block p-3 text-center text-xs text-primary hover:bg-muted/50 transition-colors">
                View All Users
              </Link>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
