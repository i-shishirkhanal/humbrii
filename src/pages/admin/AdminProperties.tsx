import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, MapPin, DollarSign, MoreVertical, CheckCircle, XCircle, Eye, EyeOff, Star, StarOff, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "suspended" | "featured">("all");
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast.success("Property updated successfully");
    },
    onError: () => {
      toast.error("Failed to update property");
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast.success("Property deleted successfully");
      setDeletePropertyId(null);
    },
    onError: () => {
      toast.error("Failed to delete property");
    },
  });

  const handleApprove = (id: string) => {
    updatePropertyMutation.mutate({ id, updates: { status: "active", is_published: true } });
  };

  const handleSuspend = (id: string) => {
    updatePropertyMutation.mutate({ id, updates: { status: "suspended", is_published: false } });
  };

  const handleTogglePublish = (id: string, currentStatus: boolean) => {
    updatePropertyMutation.mutate({ id, updates: { is_published: !currentStatus } });
  };

  const handleToggleFeatured = (id: string, currentFeatured: boolean) => {
    updatePropertyMutation.mutate({ 
      id, 
      updates: { is_featured: !currentFeatured } 
    });
    toast.success(currentFeatured ? "Removed from featured" : "Added to featured");
  };

  const handleDelete = (id: string) => {
    deletePropertyMutation.mutate(id);
  };

  const filteredProperties = properties?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "featured") {
      return matchesSearch && (p as any).is_featured === true;
    }
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      hourly: "bg-blue-500/10 text-blue-500",
      daycation: "bg-orange-500/10 text-orange-500",
      full_stay: "bg-green-500/10 text-green-500",
      vibe_chill: "bg-purple-500/10 text-purple-500",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const featuredCount = properties?.filter((p: any) => p.is_featured).length || 0;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Property Management</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and manage all properties</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-foreground">{properties?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-success">{properties?.filter(p => p.status === "active").length || 0}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-warning">{properties?.filter(p => p.status === "draft").length || 0}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-destructive">{properties?.filter(p => p.status === "suspended").length || 0}</p>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-primary">{featuredCount}</p>
            <p className="text-sm text-muted-foreground">Featured</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "active", "draft", "suspended", "featured"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={status === "featured" ? "gap-1" : ""}
              >
                {status === "featured" && <Star className="w-3 h-3" />}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Property</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading properties...
                    </td>
                  </tr>
                ) : filteredProperties?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No properties found
                    </td>
                  </tr>
                ) : (
                  filteredProperties?.map((property: any) => (
                    <tr key={property.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {property.images?.[0] ? (
                              <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            {property.is_featured && (
                              <div className="absolute top-0 right-0 bg-primary p-0.5 rounded-bl">
                                <Star className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground flex items-center gap-1">
                              {property.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {property.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(property.category)}`}>
                          {property.category.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          {property.currency} {property.base_price}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={
                            property.status === "active" ? "default" :
                            property.status === "suspended" ? "destructive" : "secondary"
                          }>
                            {property.status}
                          </Badge>
                          {property.is_published && (
                            <Badge variant="outline">Published</Badge>
                          )}
                          {property.is_featured && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">Featured</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(property.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {property.status !== "active" && (
                              <DropdownMenuItem onClick={() => handleApprove(property.id)}>
                                <CheckCircle className="w-4 h-4 mr-2 text-success" />
                                Approve & Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleTogglePublish(property.id, property.is_published || false)}>
                              {property.is_published ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFeatured(property.id, property.is_featured || false)}>
                              {property.is_featured ? (
                                <>
                                  <StarOff className="w-4 h-4 mr-2" />
                                  Remove from Featured
                                </>
                              ) : (
                                <>
                                  <Star className="w-4 h-4 mr-2 text-primary" />
                                  Add to Featured
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {property.status !== "suspended" && (
                              <DropdownMenuItem 
                                onClick={() => handleSuspend(property.id)}
                                className="text-warning"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => setDeletePropertyId(property.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Property
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePropertyId} onOpenChange={() => setDeletePropertyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletePropertyId && handleDelete(deletePropertyId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminProperties;