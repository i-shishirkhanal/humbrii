import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, User, Phone, Calendar, MoreVertical, Ban, CheckCircle, Eye, XCircle } from "lucide-react";
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
import { Link } from "react-router-dom";

const AdminHosts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [removeHostDialog, setRemoveHostDialog] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get all users with host role
  const { data: hostRoles, isLoading, refetch } = useQuery({
    queryKey: ["admin-hosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "host");

      if (error) throw error;
      return data;
    },
  });

  // Get profiles for hosts
  const { data: profiles } = useQuery({
    queryKey: ["admin-host-profiles", hostRoles],
    queryFn: async () => {
      if (!hostRoles?.length) return [];
      const hostIds = hostRoles.map(r => r.user_id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", hostIds);

      if (error) throw error;
      return data;
    },
    enabled: !!hostRoles?.length,
  });

  // Get all properties for hosts
  const { data: properties } = useQuery({
    queryKey: ["admin-host-properties", hostRoles],
    queryFn: async () => {
      if (!hostRoles?.length) return [];
      const hostIds = hostRoles.map(r => r.user_id);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .in("host_id", hostIds);

      if (error) throw error;
      return data;
    },
    enabled: !!hostRoles?.length,
  });

  const removeHostMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "host");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hosts"] });
      toast.success("Host role removed");
      setRemoveHostDialog(null);
    },
    onError: () => {
      toast.error("Failed to remove host role");
    },
  });

  const getPropertyStats = (userId: string) => {
    const hostProperties = properties?.filter(p => p.host_id === userId) || [];
    return {
      total: hostProperties.length,
      active: hostProperties.filter(p => p.status === "active").length,
      pending: hostProperties.filter(p => p.status === "draft").length,
      suspended: hostProperties.filter(p => p.status === "suspended").length,
    };
  };

  const getProfile = (userId: string) => {
    return profiles?.find(p => p.id === userId);
  };

  const filteredHosts = hostRoles?.filter(h => {
    const profile = getProfile(h.user_id);
    return profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.phone?.includes(searchQuery);
  });

  const totalProperties = properties?.length || 0;
  const activeProperties = properties?.filter(p => p.status === "active").length || 0;
  const pendingProperties = properties?.filter(p => p.status === "draft").length || 0;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Host Management</h1>
          <p className="text-muted-foreground mt-1">Manage all property hosts and their listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{hostRoles?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Hosts</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Building2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalProperties}</p>
                <p className="text-sm text-muted-foreground">Total Properties</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeProperties}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <XCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingProperties}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search hosts by name or phone..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Hosts Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Host</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Properties</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading hosts...
                    </td>
                  </tr>
                ) : filteredHosts?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No hosts found
                    </td>
                  </tr>
                ) : (
                  filteredHosts?.map((hostRole) => {
                    const profile = getProfile(hostRole.user_id);
                    const stats = getPropertyStats(hostRole.user_id);

                    return (
                      <tr key={hostRole.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{profile?.full_name || "Unnamed Host"}</p>
                              <p className="text-xs text-muted-foreground font-mono">{hostRole.user_id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            {profile?.phone || "No phone"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="secondary">{stats.total} total</Badge>
                            {stats.active > 0 && (
                              <Badge variant="default" className="bg-success/10 text-success">{stats.active} active</Badge>
                            )}
                            {stats.pending > 0 && (
                              <Badge variant="outline" className="text-warning border-warning">{stats.pending} pending</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="default" className="bg-success/10 text-success">
                            Active Host
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(hostRole.created_at), "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/admin/properties?host=${hostRole.user_id}`}
                                  className="flex items-center"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Properties
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setRemoveHostDialog(hostRole.user_id)}
                                className="text-destructive"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Remove Host Role
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

      {/* Remove Host Confirmation Dialog */}
      <AlertDialog open={!!removeHostDialog} onOpenChange={() => setRemoveHostDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Host Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the host role from this user? They will no longer be able to manage properties.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeHostDialog && removeHostMutation.mutate(removeHostDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Host Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminHosts;