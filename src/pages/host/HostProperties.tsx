import HostLayout from "@/components/layout/HostLayout";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const HostProperties = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["host-properties", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-properties"] });
      toast.success("Property deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete property");
    },
  });

  return (
    <HostLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Properties</h1>
            <p className="text-muted-foreground mt-1">Manage your listed properties</p>
          </div>
          <Link to="/host/properties/new" className="md:hidden">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : properties.length === 0 ? (
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
          <div className="grid gap-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-medium transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-muted">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-card-foreground">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        property.status === "active" 
                          ? "bg-success/10 text-success" 
                          : property.status === "pending"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {property.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-semibold text-card-foreground capitalize">{property.category.replace("_", " ")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Base Price</p>
                        <p className="font-semibold text-card-foreground">NPR {property.base_price}</p>
                      </div>
                      {property.category === "hourly" && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Hours</p>
                            <p className="font-semibold text-card-foreground">{property.hourly_start_time} - {property.hourly_end_time}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min Hours</p>
                            <p className="font-semibold text-card-foreground">{property.hourly_minimum_hours}hrs</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <Link to={`/host/properties/${property.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/host/properties/${property.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this property?")) {
                            deleteMutation.mutate(property.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default HostProperties;
