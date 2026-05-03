import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">H</span>
              </div>
              <span className="text-lg font-bold">Humbri</span>
            </Link>
            <p className="text-secondary-foreground/70 text-xs leading-relaxed max-w-xs">
              Nepal's trusted platform for booking hotels, resorts, and unique stays.
            </p>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Legal</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/privacy-policy" className="text-xs text-secondary-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-xs text-secondary-foreground/70 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-xs text-secondary-foreground/70 hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
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
                <span>+977 9708500000</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-secondary-foreground/70">
                <Mail className="w-3 h-3 text-primary" />
                <a href="mailto:support@humbri.com" className="hover:text-primary transition-colors">
                  support@humbri.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-sidebar-border flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-xs text-secondary-foreground/50">
            © {currentYear} Humbri. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="p-1.5 rounded-full bg-secondary-foreground/5 hover:bg-primary/10 hover:text-primary transition-colors">
              <Facebook className="w-3 h-3" />
            </a>
            <a href="#" className="p-1.5 rounded-full bg-secondary-foreground/5 hover:bg-primary/10 hover:text-primary transition-colors">
              <Instagram className="w-3 h-3" />
            </a>
            <a href="#" className="p-1.5 rounded-full bg-secondary-foreground/5 hover:bg-primary/10 hover:text-primary transition-colors">
              <Twitter className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;