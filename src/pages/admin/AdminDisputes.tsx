import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, MessageSquare, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminDisputes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "investigating" | "resolved" | "closed">("all");

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select(`
          *,
          guest:profiles!disputes_guest_id_fkey(full_name),
          host:profiles!disputes_host_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((d: any) => ({
        id: d.id,
        booking_id: d.booking_id, // Keeping raw UUID for now, could shorten for display
        guest_name: d.guest?.full_name || "Unknown Guest",
        host_name: d.host?.full_name || "Unknown Host",
        reason: d.reason,
        status: d.status,
        priority: d.priority,
        created_at: new Date(d.created_at),
      }));
    },
  });

  const filteredDisputes = disputes.filter((d: any) => {
    const matchesSearch = d.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
      open: { variant: "destructive", icon: AlertTriangle },
      investigating: { variant: "secondary", icon: Clock },
      resolved: { variant: "default", icon: CheckCircle },
      closed: { variant: "outline", icon: XCircle },
    };
    return config[status] || { variant: "secondary", icon: Clock };
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-destructive/10 text-destructive",
      medium: "bg-warning/10 text-warning",
      low: "bg-muted text-muted-foreground",
    };
    return colors[priority] || colors.low;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dispute Management</h1>
          <p className="text-muted-foreground mt-1">Handle guest and host disputes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{disputes.filter((d: any) => d.status === "open").length}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{disputes.filter((d: any) => d.status === "investigating").length}</p>
                <p className="text-sm text-muted-foreground">Investigating</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{disputes.filter((d: any) => d.status === "resolved").length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{disputes.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search disputes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "open", "investigating", "resolved", "closed"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Disputes Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Dispute</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Parties</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reason</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading disputes...
                    </td>
                  </tr>
                ) : filteredDisputes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No disputes found
                    </td>
                  </tr>
                ) : (
                  filteredDisputes.map((dispute: any) => {
                    const statusConfig = getStatusBadge(dispute.status);
                    return (
                      <tr key={dispute.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div>
                            <span className="font-mono text-xs font-medium" title={dispute.id}>{dispute.id.slice(0, 8)}...</span>
                            <p className="text-xs text-muted-foreground">Booking #{dispute.booking_id ? dispute.booking_id.slice(0, 8) : 'N/A'}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="font-medium">{dispute.guest_name}</p>
                            <p className="text-muted-foreground">vs {dispute.host_name}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{dispute.reason}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(dispute.priority)}`}>
                            {dispute.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant={statusConfig.variant}>
                            {dispute.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {format(dispute.created_at, "MMM d, yyyy")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl border border-border p-6 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Dispute System Active</h3>
          <p className="text-sm text-muted-foreground">
            Full dispute resolution tools will be available in detailed view.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default AdminDisputes;