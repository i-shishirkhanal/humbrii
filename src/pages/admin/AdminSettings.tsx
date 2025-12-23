import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, Bell, Shield, DollarSign, Save } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "Humbri",
    defaultCurrency: "NPR",
    commissionRate: 10,
    minBookingHours: 3,
    maxPropertiesPerHost: 20,
    autoApproveProperties: false,
    autoApproveHosts: true,
    emailNotifications: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    // In a real app, this would save to database
    toast.success("Settings saved successfully");
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">Configure global platform settings</p>
        </div>

        {/* General Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Input
                id="currency"
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent/10">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Booking & Commission</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="commission">Commission Rate (%)</Label>
              <Input
                id="commission"
                type="number"
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Percentage taken from each booking</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minHours">Minimum Booking Hours (Hourly)</Label>
              <Input
                id="minHours"
                type="number"
                value={settings.minBookingHours}
                onChange={(e) => setSettings({ ...settings, minBookingHours: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxProperties">Max Properties Per Host</Label>
              <Input
                id="maxProperties"
                type="number"
                value={settings.maxPropertiesPerHost}
                onChange={(e) => setSettings({ ...settings, maxPropertiesPerHost: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Approval Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-success/10">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Approval Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve New Hosts</Label>
                <p className="text-xs text-muted-foreground">Automatically approve host registrations</p>
              </div>
              <Switch
                checked={settings.autoApproveHosts}
                onCheckedChange={(checked) => setSettings({ ...settings, autoApproveHosts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve Properties</Label>
                <p className="text-xs text-muted-foreground">Automatically approve new property listings</p>
              </div>
              <Switch
                checked={settings.autoApproveProperties}
                onCheckedChange={(checked) => setSettings({ ...settings, autoApproveProperties: checked })}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-warning/10">
              <Bell className="w-5 h-5 text-warning" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive email alerts for important events</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Settings className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Maintenance</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-xs text-muted-foreground">Temporarily disable the platform for maintenance</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;