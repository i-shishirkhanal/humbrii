import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Globe, CreditCard, Shield, Settings as SettingsIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Default settings structure
  const [settings, setSettings] = useState({
    general: {
      siteName: "Humbri",
      supportEmail: "support@humbri.com",
      currency: "NPR",
    },
    bookings: {
      commissionRate: 10,
      minimumPayout: 500,
    },
    security: {
      requireIdVerification: true,
      autoApproveListings: false,
    },
    system: {
      enableReviews: true,
      maintenanceMode: false,
    }
  });

  // Fetch settings from Supabase
  const { data: dbSettings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (dbSettings) {
      const newSettings = { ...settings };

      dbSettings.forEach((item: any) => {
        const key = item.key;
        const value = item.value;

        // Parse value based on key to maintain types
        let parsedValue: any = value;
        if (value === "true") parsedValue = true;
        else if (value === "false") parsedValue = false;
        else if (!isNaN(Number(value)) && value.trim() !== "") parsedValue = Number(value);

        if (key in newSettings.general) newSettings.general[key as keyof typeof settings.general] = parsedValue;
        else if (key in newSettings.bookings) newSettings.bookings[key as keyof typeof settings.bookings] = parsedValue;
        else if (key in newSettings.security) newSettings.security[key as keyof typeof settings.security] = parsedValue;
        else if (key in newSettings.system) newSettings.system[key as keyof typeof settings.system] = parsedValue;
      });

      setSettings(newSettings);
    }
  }, [dbSettings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = [];

      // Flatten settings object for saving
      const flatSettings = {
        ...settings.general,
        ...settings.bookings,
        ...settings.security,
        ...settings.system,
      };

      for (const [key, value] of Object.entries(flatSettings)) {
        updates.push({
          key,
          value: String(value),
          updated_at: new Date().toISOString(),
        });
      }

      const { error } = await supabase
        .from("admin_settings")
        .upsert(updates, { onConflict: "key" });

      if (error) throw error;

      // Log the action
      await supabase.from("audit_logs").insert({
        action: "settings.updated",
        target: "Global Settings",
        details: "Updated platform configuration",
      });

      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage platform configuration</p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">General Information</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting("general", "siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.general.currency}
                    onChange={(e) => updateSetting("general", "currency", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting("general", "supportEmail", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Booking Configuration</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission Rate (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    value={settings.bookings.commissionRate}
                    onChange={(e) => updateSetting("bookings", "commissionRate", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minPayout">Minimum Payout ({settings.general.currency})</Label>
                  <Input
                    id="minPayout"
                    type="number"
                    value={settings.bookings.minimumPayout}
                    onChange={(e) => updateSetting("bookings", "minimumPayout", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Security & Access</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require ID Verification</Label>
                    <p className="text-sm text-muted-foreground">Hosts must verify ID before listing properties</p>
                  </div>
                  <Switch
                    checked={settings.security.requireIdVerification}
                    onCheckedChange={(checked) => updateSetting("security", "requireIdVerification", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Approve Listings</Label>
                    <p className="text-sm text-muted-foreground">Automatically publish new listings without review</p>
                  </div>
                  <Switch
                    checked={settings.security.autoApproveListings}
                    onCheckedChange={(checked) => updateSetting("security", "autoApproveListings", checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">System Controls</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Reviews</Label>
                    <p className="text-sm text-muted-foreground">Allow guests to write reviews for properties</p>
                  </div>
                  <Switch
                    checked={settings.system.enableReviews}
                    onCheckedChange={(checked) => updateSetting("system", "enableReviews", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Disable all public access to the platform</p>
                  </div>
                  <Switch
                    checked={settings.system.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting("system", "maintenanceMode", checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;