import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
  Bell,
  Search,
  Home,
  DollarSign,
  Users,
  Shield,
  FileText,
  AlertTriangle,
  BarChart3,
  Star,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "user" | "host" | "admin";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "My Bookings", href: "/dashboard/bookings" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const hostNavItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/host" },
    { icon: Building2, label: "Properties", href: "/host/properties" },
    { icon: Home, label: "Rooms", href: "/host/rooms" },
    { icon: DollarSign, label: "Pricing", href: "/host/pricing" },
    { icon: Calendar, label: "Bookings", href: "/host/bookings" },
    { icon: User, label: "Profile", href: "/host/profile" },
    { icon: Settings, label: "Settings", href: "/host/settings" },
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Shield, label: "Hosts", href: "/admin/hosts" },
    { icon: Building2, label: "Properties", href: "/admin/properties" },
    { icon: Calendar, label: "Bookings", href: "/admin/bookings" },
    { icon: DollarSign, label: "Payments", href: "/admin/payments" },
    { icon: Star, label: "Ratings", href: "/admin/ratings" },
    { icon: AlertTriangle, label: "Disputes", href: "/admin/disputes" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: FileText, label: "Audit Logs", href: "/admin/audit-logs" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const navItems = role === "admin" ? adminNavItems : role === "host" ? hostNavItems : userNavItems;

  const roleLabels = {
    user: "Welcome Back",
    host: "Host Center",
    admin: "Admin Panel",
  };

  const roleColors = {
    user: "bg-primary",
    host: "bg-success",
    admin: "bg-destructive",
  };

  const switchRoleLink = role === "user" ? "/host" : role === "host" ? "/dashboard" : null;
  const switchRoleLabel = role === "user" ? "Switch to Host" : role === "host" ? "Switch to User" : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">H</span>
              </div>
              <div>
                <span className="text-lg font-bold text-sidebar-foreground">Humbri</span>
                <div className={`text-xs px-2 py-0.5 rounded-full ${roleColors[role]} text-white inline-block ml-2`}>
                  {role}
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            {switchRoleLink && (
              <Link to={switchRoleLink}>
                <Button variant="outline" className="w-full justify-between border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
                  {switchRoleLabel}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
              onClick={() => navigate("/")}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold">{roleLabels[role]}</h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
