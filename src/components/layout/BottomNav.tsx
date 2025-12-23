import { Link, useLocation } from "react-router-dom";
import { Clock, Sun, Heart, Building2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Clock, label: "Hourly", href: "/properties?type=hourly" },
  { icon: Sun, label: "Daycation", href: "/properties?type=daycation" },
  { icon: Heart, label: "Favorites", href: "/dashboard/favorites", center: true },
  { icon: Building2, label: "Full Stay", href: "/properties?type=fullstay" },
  { icon: Sparkles, label: "Vibe & Chill", href: "/properties?type=vibe" },
];

const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (href: string) => {
    const url = new URL(href, window.location.origin);
    if (url.pathname !== location.pathname) return false;
    
    const searchParams = new URLSearchParams(location.search);
    const hrefParams = new URLSearchParams(url.search);
    
    if (hrefParams.has("type")) {
      return searchParams.get("type") === hrefParams.get("type");
    }
    
    return url.pathname === location.pathname;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const active = isActive(item.href);
          
          if (item.center) {
            return (
              <Link
                key={item.label}
                to={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                  active 
                    ? "bg-primary shadow-glow" 
                    : "bg-primary hover:scale-105"
                )}>
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col items-center justify-center py-2 px-3"
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-[10px] mt-1 font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
