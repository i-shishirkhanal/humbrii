import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Shield, Moon, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const UserSettings = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account preferences</p>
            </div>

            {/* Notifications */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive booking updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Promotional Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive offers and promotions</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Privacy & Security</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Moon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Appearance</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Sign Out */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <LogOut className="w-5 h-5 text-destructive" />
                <h2 className="text-lg font-semibold text-card-foreground">Account</h2>
              </div>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default UserSettings;
