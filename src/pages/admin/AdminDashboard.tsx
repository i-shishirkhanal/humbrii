import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import { Users, Building2, Calendar, Star, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // Fetch users count
  const { data: profiles } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id");
      if (error) throw error;
      return data;
    },
  });

  // Fetch hosts count
  const { data: hosts } = useQuery({
    queryKey: ["admin-hosts-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("id").eq("role", "host");
      if (error) throw error;
      return data;
    },
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

  // Pending properties (draft status)
  const pendingProperties = properties?.filter(p => p.status === "draft") || [];
  const featuredCount = properties?.filter((p: any) => p.is_featured).length || 0;

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase.from("properties").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties-stats"] });
      toast.success("Property updated");
    },
    onError: () => {
      toast.error("Failed to update property");
    },
  });

  const handleApprove = (id: string) => {
    updatePropertyMutation.mutate({ id, updates: { status: "active", is_published: true } });
  };

  const handleReject = (id: string) => {
    updatePropertyMutation.mutate({ id, updates: { status: "suspended" } });
  };

  const handleToggleFeatured = (id: string, currentFeatured: boolean) => {
    updatePropertyMutation.mutate({ id, updates: { is_featured: !currentFeatured } });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Overview</h1>
            <p className="text-muted-foreground mt-1">Platform governance and control</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/users">
              <Button variant="outline" size="sm">Manage Users</Button>
            </Link>
            <Link to="/admin/properties">
              <Button variant="outline" size="sm">Manage Properties</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Users" 
            value={profiles?.length || 0} 
            icon={Users} 
            iconColor="text-primary" 
          />
          <StatCard 
            title="Active Hosts" 
            value={hosts?.length || 0} 
            change={`${pendingProperties.length} pending`} 
            changeType="neutral" 
            icon={Building2} 
            iconColor="text-success" 
          />
          <StatCard 
            title="Total Properties" 
            value={properties?.length || 0} 
            icon={Calendar} 
            iconColor="text-accent" 
          />
          <StatCard 
            title="Active Properties" 
            value={properties?.filter(p => p.status === "active").length || 0} 
            icon={DollarSign} 
            iconColor="text-warning" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Pending Property Approvals</h2>
              <Link to="/admin/properties" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {pendingProperties.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No pending approvals</p>
              ) : (
                pendingProperties.slice(0, 5).map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {property.images?.[0] ? (
                          <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground text-sm">{property.name}</p>
                        <p className="text-xs text-muted-foreground">{property.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-success hover:text-success"
                        onClick={() => handleApprove(property.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleReject(property.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Properties */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Recent Properties</h2>
              <Link to="/admin/properties" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {!properties?.length ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No properties yet</p>
              ) : (
                properties.slice(0, 5).map((property) => (
                  <div key={property.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`p-1.5 rounded-full ${property.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {property.status === "active" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground text-sm truncate">{property.name}</p>
                      <p className="text-xs text-muted-foreground">{property.category.replace("_", " ")} • {property.location}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(property.created_at), "MMM d")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/admin/users">
            <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
              <Users className="w-6 h-6 text-primary mb-2" />
              <p className="font-medium text-foreground">Users</p>
              <p className="text-xs text-muted-foreground">Manage users</p>
            </div>
          </Link>
          <Link to="/admin/hosts">
            <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
              <Building2 className="w-6 h-6 text-success mb-2" />
              <p className="font-medium text-foreground">Hosts</p>
              <p className="text-xs text-muted-foreground">Manage hosts</p>
            </div>
          </Link>
          <Link to="/admin/properties">
            <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
              <Calendar className="w-6 h-6 text-accent mb-2" />
              <p className="font-medium text-foreground">Properties</p>
              <p className="text-xs text-muted-foreground">Review listings</p>
            </div>
          </Link>
          <Link to="/admin/settings">
            <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
              <DollarSign className="w-6 h-6 text-warning mb-2" />
              <p className="font-medium text-foreground">Settings</p>
              <p className="text-xs text-muted-foreground">Platform config</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;