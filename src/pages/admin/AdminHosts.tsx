import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, User, Phone, Calendar, MoreVertical, Ban, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminHosts = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Get all users with host role
  const { data: hostRoles, isLoading } = useQuery({
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
        .in("user_id", hostIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!hostRoles?.length,
  });

  // Get properties count for each host
  const { data: properties } = useQuery({
    queryKey: ["admin-host-properties", hostRoles],
    queryFn: async () => {
      if (!hostRoles?.length) return [];
      const hostIds = hostRoles.map(r => r.user_id);
      const { data, error } = await supabase
        .from("properties")
        .select("host_id, id")
        .in("host_id", hostIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!hostRoles?.length,
  });

  const getPropertyCount = (userId: string) => {
    return properties?.filter(p => p.host_id === userId).length || 0;
  };

  const getProfile = (userId: string) => {
    return profiles?.find(p => p.user_id === userId);
  };

  const handleRemoveHost = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "host");
    
    if (error) {
      toast.error("Failed to remove host role");
    } else {
      toast.success("Host role removed");
    }
  };

  const filteredHosts = hostRoles?.filter(h => {
    const profile = getProfile(h.user_id);
    return profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Host Management</h1>
          <p className="text-muted-foreground mt-1">Manage all property hosts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
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
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{properties?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Properties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search hosts..."
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Loading hosts...
                    </td>
                  </tr>
                ) : filteredHosts?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No hosts found
                    </td>
                  </tr>
                ) : (
                  filteredHosts?.map((hostRole) => {
                    const profile = getProfile(hostRole.user_id);
                    const propCount = getPropertyCount(hostRole.user_id);
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
                              <p className="text-xs text-muted-foreground">{hostRole.user_id.slice(0, 8)}...</p>
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
                          <Badge variant="secondary">{propCount} properties</Badge>
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
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleRemoveHost(hostRole.user_id)}
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
    </DashboardLayout>
  );
};

export default AdminHosts;