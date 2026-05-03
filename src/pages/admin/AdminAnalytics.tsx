import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Users, Building2, Calendar, DollarSign, PieChart } from "lucide-react";

const AdminAnalytics = () => {
  // Fetch real stats
  const { data: userCount } = useQuery({
    queryKey: ["analytics-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id");
      if (error) throw error;
      return data?.length || 0;
    },
  });

  const { data: hostCount } = useQuery({
    queryKey: ["analytics-hosts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("id").eq("role", "host");
      if (error) throw error;
      return data?.length || 0;
    },
  });

  const { data: properties } = useQuery({
    queryKey: ["analytics-properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*");
      if (error) throw error;
      return data;
    },
  });

  const activeProperties = properties?.filter(p => p.status === "active").length || 0;
  const featuredProperties = properties?.filter((p: any) => p.is_featured).length || 0;

  const categoryBreakdown = [
    { name: "Hourly", count: properties?.filter(p => p.category === "hourly").length || 0, color: "bg-blue-500" },
    { name: "Daycation", count: properties?.filter(p => p.category === "daycation").length || 0, color: "bg-orange-500" },
    { name: "Full Stay", count: properties?.filter(p => p.category === "full_stay").length || 0, color: "bg-green-500" },
    { name: "Vibe & Chill", count: properties?.filter(p => p.category === "vibe_chill").length || 0, color: "bg-purple-500" },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform insights and statistics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{userCount}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Building2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{hostCount}</p>
                <p className="text-sm text-muted-foreground">Active Hosts</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeProperties}</p>
                <p className="text-sm text-muted-foreground">Active Properties</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{featuredProperties}</p>
                <p className="text-sm text-muted-foreground">Featured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Properties by Category</h2>
            </div>
            <div className="space-y-4">
              {categoryBreakdown.map((category) => (
                <div key={category.name} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-foreground">{category.name}</div>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${category.color} transition-all duration-500`}
                      style={{ width: `${properties?.length ? (category.count / properties.length) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm font-medium text-right text-foreground">{category.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-success/10">
                <BarChart3 className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Platform Overview</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Total Properties</span>
                <span className="text-lg font-bold text-foreground">{properties?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Pending Approval</span>
                <span className="text-lg font-bold text-warning">{properties?.filter(p => p.status === "draft").length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Suspended</span>
                <span className="text-lg font-bold text-destructive">{properties?.filter(p => p.status === "suspended").length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Published</span>
                <span className="text-lg font-bold text-success">{properties?.filter(p => p.is_published).length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-muted/30 rounded-xl border border-border p-6 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Advanced Analytics Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Revenue tracking, booking trends, user engagement metrics, and more detailed charts will be available once the booking system is implemented.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;