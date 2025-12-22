import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">H</span>
              </div>
              <span className="text-lg font-bold">Humbri</span>
            </Link>
            <p className="text-secondary-foreground/70 text-xs leading-relaxed">
              Nepal's trusted platform for booking hotels, resorts, and unique stays.
            </p>
            <div className="flex items-center gap-2">
              <a href="#" className="p-1.5 rounded-lg bg-sidebar-accent hover:bg-primary transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="p-1.5 rounded-lg bg-sidebar-accent hover:bg-primary transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="p-1.5 rounded-lg bg-sidebar-accent hover:bg-primary transition-colors">
                <Twitter className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Quick Links</h4>
            <ul className="space-y-1.5">
              {["Hourly", "Daycation", "Full Stay", "Vibe & Chill"].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/properties?type=${item.toLowerCase().replace(" & ", "").replace(" ", "")}`}
                    className="text-xs text-secondary-foreground/70 hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Hosts */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">For Hosts</h4>
            <ul className="space-y-1.5">
              {["Become a Host", "Host Dashboard"].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-xs text-secondary-foreground/70 hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Contact</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-xs text-secondary-foreground/70">
                <MapPin className="w-3 h-3 text-primary" />
                <span>Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-secondary-foreground/70">
                <Phone className="w-3 h-3 text-primary" />
                <span>+977 9800000000</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-secondary-foreground/70">
                <Mail className="w-3 h-3 text-primary" />
                <span>hello@humbri.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-sidebar-border flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-xs text-secondary-foreground/50">
            © {currentYear} Humbri. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-secondary-foreground/50 hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-secondary-foreground/50 hover:text-primary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;