import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, CalendarDays, User, Settings, Plus, CalendarCheck, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/host" },
  { icon: Building2, label: "Properties", href: "/host/properties" },
  { icon: CalendarDays, label: "Bookings", href: "/host/bookings" },
  { icon: CalendarCheck, label: "Calendar", href: "/host/calendar" },
  { icon: DollarSign, label: "Earnings", href: "/host/earnings" },
  { icon: User, label: "Profile", href: "/host/profile" },
  { icon: Settings, label: "Settings", href: "/host/settings" },
];

const HostNav = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/host") {
      return location.pathname === "/host";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border md:relative md:border-t-0 md:border-b md:bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around md:justify-start md:gap-1 h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden md:inline">{item.label}</span>
              <span className="md:hidden text-[10px]">{item.label}</span>
            </Link>
          ))}
          <Link
            to="/host/properties/new"
            className="hidden md:flex items-center gap-2 px-4 py-2 ml-auto rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default HostNav;
