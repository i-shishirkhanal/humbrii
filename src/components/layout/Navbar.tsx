import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, CalendarCheck, LogOut, ArrowRightLeft, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Hourly", path: "/properties?type=hourly", type: "hourly" },
  { name: "Daycation", path: "/properties?type=daycation", type: "daycation" },
  { name: "Full Stay", path: "/properties?type=fullstay", type: "fullstay" },
  { name: "Vibe & Chill", path: "/properties?type=vibe", type: "vibe" },
];

const hostNavLinks = [
  { name: "Overview", path: "/host", exact: true },
  { name: "Properties", path: "/host/properties" },
  { name: "Bookings", path: "/host/bookings" },
  { name: "Calendar", path: "/host/calendar" },
  { name: "Earnings", path: "/host/earnings" },
];

const Navbar = () => {
  const { user, signOut, roles, requestHostRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHost = roles.includes("host");
  const isAdmin = roles.includes("admin");
  const isHostMode = location.pathname.startsWith("/host");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSwitchToHost = async () => {
    if (isHost) {
      navigate("/host");
    } else {
      // Navigate to intermediate page for first-time hosts
      navigate("/become-host");
    }
  };

  const handleSwitchToGuest = () => {
    navigate("/");
  };

  const isActive = (path: string, type?: string, exact = false) => {
    if (type) {
      const searchParams = new URLSearchParams(location.search);
      return location.pathname === "/properties" && searchParams.get("type") === type;
    }
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isHostMode ? "/host" : "/"} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-xl font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-xl font-bold text-foreground">Humbri</span>
            {isHostMode && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium ml-1">HOST</span>}
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {isHostMode ? (
              // Host Navigation
              hostNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-1",
                    isActive(link.path, undefined, link.exact)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.name}
                  {isActive(link.path, undefined, link.exact) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))
            ) : (
              // Guest Navigation
              navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-1",
                    isActive(link.path, link.type)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.name}
                  {isActive(link.path, link.type) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Profile Button / Auth */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center hover:bg-primary/20 transition-colors overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-card border border-border shadow-xl z-[100]">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/bookings" className="flex items-center gap-3 cursor-pointer py-2.5">
                      <CalendarCheck className="w-4 h-4 text-primary" />
                      <span>My Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="flex items-center gap-3 cursor-pointer py-2.5">
                      <User className="w-4 h-4 text-primary" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-3 cursor-pointer py-2.5 text-primary">
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {isHostMode ? (
                    <DropdownMenuItem
                      onClick={handleSwitchToGuest}
                      className="flex items-center gap-3 cursor-pointer py-2.5 text-accent"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>Switch to Guest</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={handleSwitchToHost}
                      className="flex items-center gap-3 cursor-pointer py-2.5 text-accent"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>{isHost ? "Switch to Host" : "Become a Host"}</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-3 cursor-pointer py-2.5 text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <button className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <User className="w-5 h-5 text-primary" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
