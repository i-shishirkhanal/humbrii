import HostLayout from "@/components/layout/HostLayout";
import StatCard from "@/components/cards/StatCard";
import { Building2, Calendar, Users, TrendingUp, Plus, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const HostDashboard = () => {
  const { user } = useAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ["host-properties", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("host_id", user.id)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <HostLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Host Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your properties and track performance
            </p>
          </div>
          <Link to="/host/properties/new" className="md:hidden">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Properties"
            value={properties.length}
            icon={Building2}
            iconColor="text-primary"
          />
          <StatCard
            title="Active Bookings"
            value={0}
            icon={Calendar}
            iconColor="text-success"
          />
          <StatCard
            title="Upcoming Check-ins"
            value={0}
            icon={Users}
            iconColor="text-accent"
          />
          <StatCard
            title="Avg Occupancy"
            value="0%"
            icon={TrendingUp}
            iconColor="text-warning"
          />
        </div>

        {/* Properties Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Your Properties</h2>
            <Link to="/host/properties">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          
          {properties.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first property</p>
              <Link to="/host/properties/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-medium transition-shadow"
                >
                  <div className="flex">
                    <div className="w-32 h-32 flex-shrink-0 bg-muted">
                      {property.images?.[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-card-foreground">{property.name}</h3>
                          <p className="text-sm text-muted-foreground">{property.location}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          property.status === "active" 
                            ? "bg-success/10 text-success" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {property.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary capitalize">
                          {property.category.replace("_", " ")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          NPR {property.base_price}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Link to={`/host/properties/${property.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link to={`/host/properties/${property.id}/edit`}>
                          <Button size="sm" variant="ghost">
                            <Settings className="w-3 h-3 mr-1" />
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </HostLayout>
  );
};

export default HostDashboard;
