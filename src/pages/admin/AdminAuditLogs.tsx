import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Activity, User, Building2, Shield, Settings, FileText, Clock } from "lucide-react";
import { format } from "date-fns";

// Mock data
const mockLogs = [
  {
    id: "1",
    action: "property.approved",
    actor: "Admin User",
    target: "Himalayan View Resort",
    timestamp: new Date("2024-01-15T10:30:00"),
    details: "Property approved and published",
  },
  {
    id: "2",
    action: "user.role_changed",
    actor: "Admin User",
    target: "John Doe",
    timestamp: new Date("2024-01-15T09:15:00"),
    details: "Added host role",
  },
  {
    id: "3",
    action: "property.suspended",
    actor: "Admin User",
    target: "City Center Express",
    timestamp: new Date("2024-01-14T16:45:00"),
    details: "Suspended due to policy violation",
  },
  {
    id: "4",
    action: "settings.updated",
    actor: "Admin User",
    target: "Platform Settings",
    timestamp: new Date("2024-01-14T14:20:00"),
    details: "Updated commission rate",
  },
  {
    id: "5",
    action: "user.created",
    actor: "System",
    target: "Jane Smith",
    timestamp: new Date("2024-01-14T11:00:00"),
    details: "New user registered",
  },
];

const AdminAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "property" | "user" | "settings" | "system">("all");

  const getActionType = (action: string): "property" | "user" | "settings" | "system" => {
    if (action.startsWith("property")) return "property";
    if (action.startsWith("user")) return "user";
    if (action.startsWith("settings")) return "settings";
    return "system";
  };

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || getActionType(log.action) === typeFilter;
    return matchesSearch && matchesType;
  });

  const getActionIcon = (action: string) => {
    const type = getActionType(action);
    const icons = {
      property: Building2,
      user: User,
      settings: Settings,
      system: Activity,
    };
    return icons[type];
  };

  const getActionColor = (action: string) => {
    if (action.includes("approved") || action.includes("created")) return "text-success";
    if (action.includes("suspended") || action.includes("deleted")) return "text-destructive";
    if (action.includes("updated") || action.includes("changed")) return "text-warning";
    return "text-primary";
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all administrative actions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Actions</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Building2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockLogs.filter(l => getActionType(l.action) === "property").length}</p>
                <p className="text-sm text-muted-foreground">Property Actions</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockLogs.filter(l => getActionType(l.action) === "user").length}</p>
                <p className="text-sm text-muted-foreground">User Actions</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Shield className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="text-sm text-muted-foreground">Admins Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "property", "user", "settings", "system"] as const).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Logs Timeline */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No logs found
              </div>
            ) : (
              filteredLogs.map((log) => {
                const Icon = getActionIcon(log.action);
                return (
                  <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-muted ${getActionColor(log.action)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">{log.actor}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.action.replace(".", " → ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Target: <span className="text-foreground">{log.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {format(log.timestamp, "MMM d, h:mm a")}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl border border-border p-6 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Full Audit System Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Complete audit logging with database triggers will track all administrative actions automatically.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAuditLogs;