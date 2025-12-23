import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Phone, Calendar, MoreVertical, Shield, UserX, UserCheck } from "lucide-react";
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

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "host" | "admin">("all");
  const [removeRoleDialog, setRemoveRoleDialog] = useState<{ userId: string; role: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles, refetch: refetchRoles } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "host" | "user" }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role added successfully");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to add role");
      }
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "host" | "user" }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role removed successfully");
      setRemoveRoleDialog(null);
    },
    onError: () => {
      toast.error("Failed to remove role");
    },
  });

  const getRolesForUser = (userId: string) => {
    return userRoles?.filter(r => r.user_id === userId).map(r => r.role) || [];
  };

  const handleAddRole = (userId: string, role: "admin" | "host" | "user") => {
    addRoleMutation.mutate({ userId, role });
  };

  const handleRemoveRole = () => {
    if (removeRoleDialog) {
      removeRoleMutation.mutate({ 
        userId: removeRoleDialog.userId, 
        role: removeRoleDialog.role as "admin" | "host" | "user" 
      });
    }
  };
  const filteredProfiles = profiles?.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery);
    
    if (roleFilter === "all") return matchesSearch;
    
    const roles = getRolesForUser(p.user_id);
    return matchesSearch && roles.includes(roleFilter);
  });

  const userCount = profiles?.length || 0;
  const hostCount = userRoles?.filter(r => r.role === "host").length || 0;
  const adminCount = userRoles?.filter(r => r.role === "admin").length || 0;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all registered users and their roles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-foreground">{userCount}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-success">{hostCount}</p>
            <p className="text-sm text-muted-foreground">Hosts</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-primary">{adminCount}</p>
            <p className="text-sm text-muted-foreground">Admins</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-muted-foreground">{userCount - hostCount}</p>
            <p className="text-sm text-muted-foreground">Regular Users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "user", "host", "admin"] as const).map((role) => (
              <Button
                key={role}
                variant={roleFilter === role ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}s
              </Button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Roles</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredProfiles?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredProfiles?.map((profile) => {
                    const roles = getRolesForUser(profile.user_id);
                    const isHost = roles.includes("host");
                    const isAdmin = roles.includes("admin");
                    
                    return (
                      <tr key={profile.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{profile.full_name || "Unnamed User"}</p>
                              <p className="text-xs text-muted-foreground font-mono">{profile.user_id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            {profile.phone || "No phone"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {roles.map(role => (
                              <Badge 
                                key={role} 
                                variant={role === "admin" ? "destructive" : role === "host" ? "default" : "secondary"}
                                className="text-xs cursor-pointer"
                                onClick={() => role !== "user" && setRemoveRoleDialog({ userId: profile.user_id, role })}
                              >
                                {role}
                                {role !== "user" && " ×"}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(profile.created_at), "MMM d, yyyy")}
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
                              {!isHost && (
                                <DropdownMenuItem onClick={() => handleAddRole(profile.user_id, "host")}>
                                  <UserCheck className="w-4 h-4 mr-2 text-success" />
                                  Make Host
                                </DropdownMenuItem>
                              )}
                              {!isAdmin && (
                                <DropdownMenuItem onClick={() => handleAddRole(profile.user_id, "admin")}>
                                  <Shield className="w-4 h-4 mr-2 text-primary" />
                                  Make Admin
                                </DropdownMenuItem>
                              )}
                              {(isHost || isAdmin) && <DropdownMenuSeparator />}
                              {isHost && (
                                <DropdownMenuItem 
                                  onClick={() => setRemoveRoleDialog({ userId: profile.user_id, role: "host" })}
                                  className="text-warning"
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Remove Host Role
                                </DropdownMenuItem>
                              )}
                              {isAdmin && (
                                <DropdownMenuItem 
                                  onClick={() => setRemoveRoleDialog({ userId: profile.user_id, role: "admin" })}
                                  className="text-destructive"
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Remove Admin Role
                                </DropdownMenuItem>
                              )}
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

      {/* Remove Role Confirmation Dialog */}
      <AlertDialog open={!!removeRoleDialog} onOpenChange={() => setRemoveRoleDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the {removeRoleDialog?.role} role from this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveRole}>
              Remove Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminUsers;