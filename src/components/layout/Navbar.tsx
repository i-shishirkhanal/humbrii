import { Link, useNavigate } from "react-router-dom";
import { User, CalendarCheck, Settings, Activity, LogOut, ArrowRightLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut, roles, requestHostRole } = useAuth();
  const navigate = useNavigate();
  const isHost = roles.includes("host");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSwitchToHost = async () => {
    if (isHost) {
      navigate("/host");
    } else {
      // Request host role
      const { error } = await requestHostRole();
      if (error) {
        toast.error("Failed to become a host. Please try again.");
      } else {
        toast.success("You are now a host!");
        navigate("/host");
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-xl font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-xl font-bold text-foreground">Humbri</span>
          </Link>

          {/* Profile Button / Auth */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <User className="w-5 h-5 text-primary" />
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
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="flex items-center gap-3 cursor-pointer py-2.5">
                      <Settings className="w-4 h-4 text-primary" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer py-2.5">
                      <Activity className="w-4 h-4 text-primary" />
                      <span>Activities</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSwitchToHost}
                    className="flex items-center gap-3 cursor-pointer py-2.5 text-accent"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>{isHost ? "Switch to Host" : "Become a Host"}</span>
                  </DropdownMenuItem>
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
