import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail, Phone, Loader2, Camera, Calendar, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const { user, profile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>

          <div className="space-y-6">
            {/* Profile Header */}
            <div className="relative bg-gradient-primary rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/80" />
              <div className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-background/20 backdrop-blur-sm border-4 border-background/30 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name || "Profile"} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 md:w-16 md:h-16 text-primary-foreground" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-background shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5 text-foreground" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="text-center md:text-left text-primary-foreground">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {profile?.full_name || 'Welcome, Traveler'}
                    </h1>
                    <p className="text-primary-foreground/80 mt-1">{user?.email}</p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-sm text-primary-foreground/90">
                        <Calendar className="w-4 h-4" />
                        <span>Member since {memberSince}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-primary-foreground/90">
                        <Shield className="w-4 h-4" />
                        <span>Verified Account</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default UserProfile;
