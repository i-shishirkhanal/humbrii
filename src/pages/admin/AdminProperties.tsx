import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, MapPin, DollarSign, MoreVertical, CheckCircle, XCircle, Eye, EyeOff, Star, StarOff, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = ["hourly", "daycation", "full_stay", "vibe_chill"] as const;

const AdminProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "suspended" | "featured">("all");
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("1");
  const [categoryTab, setCategoryTab] = useState<string>("all");
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
    updatePropertyMutation.mutate({ id, updates: { status: "suspended", is_published: false, is_featured: false, featured_order: null } });
  };

  const handleTogglePublish = (id: string, currentStatus: boolean) => {
    updatePropertyMutation.mutate({ id, updates: { is_published: !currentStatus } });
  };

  const handleOpenFeatureDialog = (property: any) => {
    setSelectedProperty(property);
    setSelectedOrder(property.featured_order?.toString() || "1");
    setFeatureDialogOpen(true);
  };

  const handleFeatureProperty = () => {
    if (!selectedProperty) return;
    
    updatePropertyMutation.mutate({ 
      id: selectedProperty.id, 
      updates: { 
        is_featured: true,
        featured_order: parseInt(selectedOrder)
      } 
    });
    setFeatureDialogOpen(false);
    setSelectedProperty(null);
  };

  const handleRemoveFeatured = (id: string) => {
    updatePropertyMutation.mutate({ 
      id, 
      updates: { is_featured: false, featured_order: null } 
    });
  };

  const handleUpdateOrder = (id: string, newOrder: number) => {
    updatePropertyMutation.mutate({ 
      id, 
      updates: { featured_order: newOrder } 
    });
  };

  const handleDelete = (id: string) => {
    deletePropertyMutation.mutate(id);
  };

  const filteredProperties = properties?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryTab === "all" || p.category === categoryTab;
    
    if (statusFilter === "featured") {
      return matchesSearch && matchesCategory && p.is_featured === true;
    }
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    // Sort featured properties by their order
    if (a.is_featured && b.is_featured) {
      return (a.featured_order || 999) - (b.featured_order || 999);
    }
    return 0;
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      hourly: "Hourly",
      daycation: "Daycation",
      full_stay: "Full Stay",
      vibe_chill: "Vibe & Chill",
    };
    return labels[category] || category;
  };

  const featuredByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = properties?.filter(p => p.is_featured && p.category === cat)
      .sort((a, b) => (a.featured_order || 999) - (b.featured_order || 999)) || [];
    return acc;
  }, {} as Record<string, any[]>);

  const totalFeatured = properties?.filter(p => p.is_featured).length || 0;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Property Management</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and manage all properties with featured ordering</p>
        </div>

        {/* Featured Properties Overview by Category */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Featured Properties by Category ({totalFeatured} total)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <div key={cat} className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(cat)}`}>
                    {getCategoryLabel(cat)}
                  </span>
                  <span className="text-sm text-muted-foreground">{featuredByCategory[cat]?.length || 0} featured</span>
                </div>
                <div className="space-y-1">
                  {featuredByCategory[cat]?.slice(0, 3).map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium">
                        {p.featured_order || idx + 1}
                      </span>
                      <span className="truncate text-foreground">{p.name}</span>
                    </div>
                  ))}
                  {(featuredByCategory[cat]?.length || 0) > 3 && (
                    <p className="text-xs text-muted-foreground ml-7">+{featuredByCategory[cat].length - 3} more</p>
                  )}
                  {!featuredByCategory[cat]?.length && (
                    <p className="text-xs text-muted-foreground">No featured properties</p>
                  )}
                </div>
              </div>
            ))}
          </div>
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
            <p className="text-2xl font-bold text-primary">{totalFeatured}</p>
            <p className="text-sm text-muted-foreground">Featured</p>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={categoryTab} onValueChange={setCategoryTab}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat} value={cat}>{getCategoryLabel(cat)}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Featured Position</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Loading properties...
                    </td>
                  </tr>
                ) : filteredProperties?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
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
                          {getCategoryLabel(property.category)}
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
                        </div>
                      </td>
                      <td className="p-4">
                        {property.is_featured ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                {property.featured_order || "-"}
                              </span>
                              <span className="text-xs text-muted-foreground">in {getCategoryLabel(property.category)}</span>
                            </div>
                            <div className="flex items-center">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleUpdateOrder(property.id, Math.max(1, (property.featured_order || 1) - 1))}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleUpdateOrder(property.id, (property.featured_order || 1) + 1)}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not featured</span>
                        )}
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
                          <DropdownMenuContent align="end" className="w-56">
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
                            <DropdownMenuSeparator />
                            {property.is_featured ? (
                              <>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <ArrowUp className="w-4 h-4 mr-2" />
                                    Change Position
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                      <DropdownMenuItem 
                                        key={num} 
                                        onClick={() => handleUpdateOrder(property.id, num)}
                                        className={property.featured_order === num ? "bg-primary/10" : ""}
                                      >
                                        Position {num} {property.featured_order === num && "(current)"}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem onClick={() => handleRemoveFeatured(property.id)}>
                                  <StarOff className="w-4 h-4 mr-2" />
                                  Remove from Featured
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem onClick={() => handleOpenFeatureDialog(property)}>
                                <Star className="w-4 h-4 mr-2 text-primary" />
                                Add to Featured
                              </DropdownMenuItem>
                            )}
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

      {/* Feature Dialog */}
      <Dialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Property</DialogTitle>
            <DialogDescription>
              Set the featured position for "{selectedProperty?.name}" in the {getCategoryLabel(selectedProperty?.category || "")} category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Featured Position</label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      Position {num} {num === 1 && "(First)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This property will appear at position {selectedOrder} in the {getCategoryLabel(selectedProperty?.category || "")} section on the homepage.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeatureDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFeatureProperty}>
              <Star className="w-4 h-4 mr-2" />
              Feature Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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