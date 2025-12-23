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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

const CATEGORIES = ["hourly", "daycation", "full_stay", "vibe_chill"] as const;

type FeaturedSection = "main" | "hourly" | "daycation" | "full_stay" | "vibe_chill";

const FEATURED_SECTIONS: { key: FeaturedSection; label: string; categoryFilter?: string }[] = [
  { key: "main", label: "Featured Properties" },
  { key: "hourly", label: "Featured Hourly", categoryFilter: "hourly" },
  { key: "daycation", label: "Featured Daycation", categoryFilter: "daycation" },
  { key: "full_stay", label: "Featured Full Stay", categoryFilter: "full_stay" },
  { key: "vibe_chill", label: "Featured Vibe & Chill", categoryFilter: "vibe_chill" },
];

const AdminProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "suspended" | "featured">("all");
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedSections, setSelectedSections] = useState<FeaturedSection[]>([]);
  const [sectionOrders, setSectionOrders] = useState<Record<FeaturedSection, string>>({
    main: "1",
    hourly: "1",
    daycation: "1",
    full_stay: "1",
    vibe_chill: "1",
  });
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
    updatePropertyMutation.mutate({ 
      id, 
      updates: { 
        status: "suspended", 
        is_published: false, 
        is_featured: false, 
        featured_order: null,
        is_featured_main: false,
        featured_order_main: null,
        is_featured_hourly: false,
        featured_order_hourly: null,
        is_featured_daycation: false,
        featured_order_daycation: null,
        is_featured_full_stay: false,
        featured_order_full_stay: null,
        is_featured_vibe_chill: false,
        featured_order_vibe_chill: null,
      } 
    });
  };

  const handleTogglePublish = (id: string, currentStatus: boolean) => {
    updatePropertyMutation.mutate({ id, updates: { is_published: !currentStatus } });
  };

  const handleOpenFeatureDialog = (property: any) => {
    setSelectedProperty(property);
    
    // Set initial states based on current featured status
    const sections: FeaturedSection[] = [];
    const orders: Record<FeaturedSection, string> = {
      main: "1",
      hourly: "1",
      daycation: "1",
      full_stay: "1",
      vibe_chill: "1",
    };

    if (property.is_featured_main) {
      sections.push("main");
      orders.main = property.featured_order_main?.toString() || "1";
    }
    if (property.is_featured_hourly) {
      sections.push("hourly");
      orders.hourly = property.featured_order_hourly?.toString() || "1";
    }
    if (property.is_featured_daycation) {
      sections.push("daycation");
      orders.daycation = property.featured_order_daycation?.toString() || "1";
    }
    if (property.is_featured_full_stay) {
      sections.push("full_stay");
      orders.full_stay = property.featured_order_full_stay?.toString() || "1";
    }
    if (property.is_featured_vibe_chill) {
      sections.push("vibe_chill");
      orders.vibe_chill = property.featured_order_vibe_chill?.toString() || "1";
    }

    setSelectedSections(sections);
    setSectionOrders(orders);
    setFeatureDialogOpen(true);
  };

  const handleFeatureProperty = () => {
    if (!selectedProperty) return;
    
    const updates: Record<string, unknown> = {
      is_featured_main: selectedSections.includes("main"),
      featured_order_main: selectedSections.includes("main") ? parseInt(sectionOrders.main) : null,
      is_featured_hourly: selectedSections.includes("hourly"),
      featured_order_hourly: selectedSections.includes("hourly") ? parseInt(sectionOrders.hourly) : null,
      is_featured_daycation: selectedSections.includes("daycation"),
      featured_order_daycation: selectedSections.includes("daycation") ? parseInt(sectionOrders.daycation) : null,
      is_featured_full_stay: selectedSections.includes("full_stay"),
      featured_order_full_stay: selectedSections.includes("full_stay") ? parseInt(sectionOrders.full_stay) : null,
      is_featured_vibe_chill: selectedSections.includes("vibe_chill"),
      featured_order_vibe_chill: selectedSections.includes("vibe_chill") ? parseInt(sectionOrders.vibe_chill) : null,
      // Also update legacy field
      is_featured: selectedSections.length > 0,
      featured_order: selectedSections.includes("main") ? parseInt(sectionOrders.main) : null,
    };

    updatePropertyMutation.mutate({ id: selectedProperty.id, updates });
    setFeatureDialogOpen(false);
    setSelectedProperty(null);
    setSelectedSections([]);
  };

  const handleRemoveFromSection = (id: string, section: FeaturedSection) => {
    const updates: Record<string, unknown> = {};
    
    switch (section) {
      case "main":
        updates.is_featured_main = false;
        updates.featured_order_main = null;
        break;
      case "hourly":
        updates.is_featured_hourly = false;
        updates.featured_order_hourly = null;
        break;
      case "daycation":
        updates.is_featured_daycation = false;
        updates.featured_order_daycation = null;
        break;
      case "full_stay":
        updates.is_featured_full_stay = false;
        updates.featured_order_full_stay = null;
        break;
      case "vibe_chill":
        updates.is_featured_vibe_chill = false;
        updates.featured_order_vibe_chill = null;
        break;
    }

    updatePropertyMutation.mutate({ id, updates });
  };

  const handleUpdateSectionOrder = (id: string, section: FeaturedSection, newOrder: number) => {
    const updates: Record<string, unknown> = {};
    
    switch (section) {
      case "main":
        updates.featured_order_main = newOrder;
        break;
      case "hourly":
        updates.featured_order_hourly = newOrder;
        break;
      case "daycation":
        updates.featured_order_daycation = newOrder;
        break;
      case "full_stay":
        updates.featured_order_full_stay = newOrder;
        break;
      case "vibe_chill":
        updates.featured_order_vibe_chill = newOrder;
        break;
    }

    updatePropertyMutation.mutate({ id, updates });
  };

  const handleDelete = (id: string) => {
    deletePropertyMutation.mutate(id);
  };

  const toggleSection = (section: FeaturedSection) => {
    setSelectedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getPropertyFeaturedSections = (property: any): { section: FeaturedSection; order: number }[] => {
    const sections: { section: FeaturedSection; order: number }[] = [];
    if (property.is_featured_main) sections.push({ section: "main", order: property.featured_order_main || 0 });
    if (property.is_featured_hourly) sections.push({ section: "hourly", order: property.featured_order_hourly || 0 });
    if (property.is_featured_daycation) sections.push({ section: "daycation", order: property.featured_order_daycation || 0 });
    if (property.is_featured_full_stay) sections.push({ section: "full_stay", order: property.featured_order_full_stay || 0 });
    if (property.is_featured_vibe_chill) sections.push({ section: "vibe_chill", order: property.featured_order_vibe_chill || 0 });
    return sections;
  };

  const isPropertyFeaturedAnywhere = (property: any): boolean => {
    return property.is_featured_main || property.is_featured_hourly || property.is_featured_daycation || 
           property.is_featured_full_stay || property.is_featured_vibe_chill;
  };

  const filteredProperties = properties?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryTab === "all" || p.category === categoryTab;
    
    if (statusFilter === "featured") {
      return matchesSearch && matchesCategory && isPropertyFeaturedAnywhere(p);
    }
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus && matchesCategory;
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

  const getSectionLabel = (section: FeaturedSection) => {
    const labels: Record<FeaturedSection, string> = {
      main: "Featured Properties",
      hourly: "Featured Hourly",
      daycation: "Featured Daycation",
      full_stay: "Featured Full Stay",
      vibe_chill: "Featured Vibe & Chill",
    };
    return labels[section];
  };

  // Get featured properties by section
  const getFeaturedBySection = (section: FeaturedSection) => {
    if (!properties) return [];
    
    switch (section) {
      case "main":
        return properties.filter(p => p.is_featured_main).sort((a, b) => (a.featured_order_main || 999) - (b.featured_order_main || 999));
      case "hourly":
        return properties.filter(p => p.is_featured_hourly).sort((a, b) => (a.featured_order_hourly || 999) - (b.featured_order_hourly || 999));
      case "daycation":
        return properties.filter(p => p.is_featured_daycation).sort((a, b) => (a.featured_order_daycation || 999) - (b.featured_order_daycation || 999));
      case "full_stay":
        return properties.filter(p => p.is_featured_full_stay).sort((a, b) => (a.featured_order_full_stay || 999) - (b.featured_order_full_stay || 999));
      case "vibe_chill":
        return properties.filter(p => p.is_featured_vibe_chill).sort((a, b) => (a.featured_order_vibe_chill || 999) - (b.featured_order_vibe_chill || 999));
    }
  };

  const totalFeaturedMain = properties?.filter(p => p.is_featured_main).length || 0;
  const totalFeaturedHourly = properties?.filter(p => p.is_featured_hourly).length || 0;
  const totalFeaturedDaycation = properties?.filter(p => p.is_featured_daycation).length || 0;
  const totalFeaturedFullStay = properties?.filter(p => p.is_featured_full_stay).length || 0;
  const totalFeaturedVibe = properties?.filter(p => p.is_featured_vibe_chill).length || 0;

  const canFeatureInSection = (property: any, section: FeaturedSection): boolean => {
    // Main section can feature any property
    if (section === "main") return true;
    // Category sections can only feature properties of that category
    return property.category === section;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Property Management</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and manage all properties with separate featured sections</p>
        </div>

        {/* Featured Properties Overview by Section */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Featured Properties by Section
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {FEATURED_SECTIONS.map(({ key, label }) => {
              const featuredList = getFeaturedBySection(key);
              return (
                <div key={key} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">{label}</span>
                    <span className="text-sm text-muted-foreground">{featuredList.length}</span>
                  </div>
                  <div className="space-y-1">
                    {featuredList.slice(0, 3).map((p, idx) => {
                      const order = key === "main" ? p.featured_order_main :
                                   key === "hourly" ? p.featured_order_hourly :
                                   key === "daycation" ? p.featured_order_daycation :
                                   key === "full_stay" ? p.featured_order_full_stay :
                                   p.featured_order_vibe_chill;
                      return (
                        <div key={p.id} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium">
                            {order || idx + 1}
                          </span>
                          <span className="truncate text-foreground">{p.name}</span>
                        </div>
                      );
                    })}
                    {featuredList.length > 3 && (
                      <p className="text-xs text-muted-foreground ml-7">+{featuredList.length - 3} more</p>
                    )}
                    {featuredList.length === 0 && (
                      <p className="text-xs text-muted-foreground">No featured properties</p>
                    )}
                  </div>
                </div>
              );
            })}
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
            <p className="text-2xl font-bold text-primary">{totalFeaturedMain + totalFeaturedHourly + totalFeaturedDaycation + totalFeaturedFullStay + totalFeaturedVibe}</p>
            <p className="text-sm text-muted-foreground">Total Featured</p>
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Featured In</th>
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
                  filteredProperties?.map((property: any) => {
                    const featuredSections = getPropertyFeaturedSections(property);
                    return (
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
                              {isPropertyFeaturedAnywhere(property) && (
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
                          {featuredSections.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {featuredSections.map(({ section, order }) => (
                                <Badge key={section} variant="outline" className="text-xs gap-1">
                                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                                    {order}
                                  </span>
                                  {section === "main" ? "Main" : getCategoryLabel(section)}
                                </Badge>
                              ))}
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
                              <DropdownMenuItem onClick={() => handleOpenFeatureDialog(property)}>
                                <Star className="w-4 h-4 mr-2 text-primary" />
                                Manage Featured Sections
                              </DropdownMenuItem>
                              {featuredSections.length > 0 && (
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <StarOff className="w-4 h-4 mr-2" />
                                    Remove from Section
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    {featuredSections.map(({ section }) => (
                                      <DropdownMenuItem 
                                        key={section}
                                        onClick={() => handleRemoveFromSection(property.id, section)}
                                      >
                                        {getSectionLabel(section)}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              )}
                              {featuredSections.length > 0 && (
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <ArrowUp className="w-4 h-4 mr-2" />
                                    Change Position
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    {featuredSections.map(({ section, order }) => (
                                      <DropdownMenuSub key={section}>
                                        <DropdownMenuSubTrigger>
                                          {getSectionLabel(section)} (#{order})
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <DropdownMenuItem 
                                              key={num}
                                              onClick={() => handleUpdateSectionOrder(property.id, section, num)}
                                              className={order === num ? "bg-primary/10" : ""}
                                            >
                                              Position {num} {order === num && "(current)"}
                                            </DropdownMenuItem>
                                          ))}
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Feature Dialog */}
      <Dialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Featured Sections</DialogTitle>
            <DialogDescription>
              Select which sections "{selectedProperty?.name}" should be featured in and set the display order for each.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {FEATURED_SECTIONS.map(({ key, label, categoryFilter }) => {
              const isEnabled = selectedProperty && canFeatureInSection(selectedProperty, key);
              const isSelected = selectedSections.includes(key);
              
              return (
                <div key={key} className={`space-y-2 p-3 rounded-lg border ${isSelected ? 'border-primary bg-primary/5' : 'border-border'} ${!isEnabled ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={key}
                        checked={isSelected}
                        onCheckedChange={() => isEnabled && toggleSection(key)}
                        disabled={!isEnabled}
                      />
                      <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                        {label}
                      </Label>
                    </div>
                    {categoryFilter && !isEnabled && (
                      <span className="text-xs text-muted-foreground">
                        Only for {getCategoryLabel(categoryFilter)} properties
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="ml-6 flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Position:</Label>
                      <Select 
                        value={sectionOrders[key]} 
                        onValueChange={(val) => setSectionOrders(prev => ({ ...prev, [key]: val }))}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              #{num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeatureDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFeatureProperty}>
              <Star className="w-4 h-4 mr-2" />
              Save Featured Settings
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