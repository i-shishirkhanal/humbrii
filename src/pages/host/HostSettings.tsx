import { useState } from "react";
import HostLayout from "@/components/layout/HostLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Shield, CreditCard, LogOut, Wallet, Building, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HostSettings = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [methodType, setMethodType] = useState<"esewa" | "bank">("esewa");
  const [esewaData, setEsewaData] = useState({ esewa_id: "", esewa_phone: "" });
  const [bankData, setBankData] = useState({
    bank_name: "",
    bank_account_number: "",
    bank_account_holder: "",
    bank_branch: "",
  });

  const { data: payoutMethods = [], isLoading } = useQuery({
    queryKey: ["payout-methods", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("host_payout_methods")
        .select("*")
        .eq("host_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMethodMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const payload = {
        host_id: user.id,
        method_type: methodType,
        is_primary: payoutMethods.length === 0,
        ...(methodType === "esewa" ? esewaData : bankData),
      };

      console.log("Adding payment method, User ID:", user.id);
      console.log("Payload:", payload);

      const { error } = await supabase
        .from("host_payout_methods")
        .upsert(payload, { onConflict: "host_id,method_type" });

      if (error) {
        console.error("Supabase payment add error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
      toast.success("Payment method added successfully");
      setDialogOpen(false);
      setEsewaData({ esewa_id: "", esewa_phone: "" });
      setBankData({ bank_name: "", bank_account_number: "", bank_account_holder: "", bank_branch: "" });
    },
    onError: (error) => {
      console.error("Payment method error:", error);
      toast.error(`Failed to add payment method: ${error.message}`);
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (methodId: string) => {
      const { error } = await supabase
        .from("host_payout_methods")
        .delete()
        .eq("id", methodId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
      toast.success("Payment method removed");
    },
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleAddMethod = () => {
    if (methodType === "esewa" && (!esewaData.esewa_id || !esewaData.esewa_phone)) {
      toast.error("Please fill in all eSewa fields");
      return;
    }
    if (methodType === "bank" && (!bankData.bank_name || !bankData.bank_account_number || !bankData.bank_account_holder)) {
      toast.error("Please fill in all bank fields");
      return;
    }
    addMethodMutation.mutate();
  };

  const esewaMethod = payoutMethods.find(m => m.method_type === "esewa");
  const bankMethod = payoutMethods.find(m => m.method_type === "bank");

  return (
    <HostLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Host Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your host account preferences</p>
        </div>

        {/* Payout Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">Payout Settings</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : payoutMethods.length === 0 ? (
            <div className="text-center py-6">
              <Wallet className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No payment method added yet</p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                      Choose your preferred payout method
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Method Type</Label>
                      <Select value={methodType} onValueChange={(v) => setMethodType(v as "esewa" | "bank")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="esewa">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4" />
                              eSewa
                            </div>
                          </SelectItem>
                          <SelectItem value="bank">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Bank Transfer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {methodType === "esewa" ? (
                      <>
                        <div className="space-y-2">
                          <Label>eSewa ID</Label>
                          <Input
                            placeholder="Enter your eSewa ID"
                            value={esewaData.esewa_id}
                            onChange={(e) => setEsewaData({ ...esewaData, esewa_id: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>eSewa Phone Number</Label>
                          <Input
                            placeholder="98XXXXXXXX"
                            value={esewaData.esewa_phone}
                            onChange={(e) => setEsewaData({ ...esewaData, esewa_phone: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Bank Name</Label>
                          <Input
                            placeholder="e.g., Nepal Bank Ltd"
                            value={bankData.bank_name}
                            onChange={(e) => setBankData({ ...bankData, bank_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Number</Label>
                          <Input
                            placeholder="Enter account number"
                            value={bankData.bank_account_number}
                            onChange={(e) => setBankData({ ...bankData, bank_account_number: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Holder Name</Label>
                          <Input
                            placeholder="Name on account"
                            value={bankData.bank_account_holder}
                            onChange={(e) => setBankData({ ...bankData, bank_account_holder: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Branch (Optional)</Label>
                          <Input
                            placeholder="Branch name"
                            value={bankData.bank_branch}
                            onChange={(e) => setBankData({ ...bankData, bank_branch: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <Button
                      onClick={handleAddMethod}
                      className="w-full"
                      disabled={addMethodMutation.isPending}
                    >
                      {addMethodMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Add Payment Method
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-4">
              {esewaMethod && (
                <div className="p-4 rounded-lg bg-muted flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">eSewa</p>
                      <p className="text-sm text-muted-foreground">{esewaMethod.esewa_phone}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMethodMutation.mutate(esewaMethod.id)}
                  >
                    Remove
                  </Button>
                </div>
              )}

              {bankMethod && (
                <div className="p-4 rounded-lg bg-muted flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{bankMethod.bank_name}</p>
                      <p className="text-sm text-muted-foreground">****{bankMethod.bank_account_number?.slice(-4)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMethodMutation.mutate(bankMethod.id)}
                  >
                    Remove
                  </Button>
                </div>
              )}

              {payoutMethods.length < 2 && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                      <DialogDescription>
                        Choose your preferred payout method
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Method Type</Label>
                        <Select value={methodType} onValueChange={(v) => setMethodType(v as "esewa" | "bank")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {!esewaMethod && (
                              <SelectItem value="esewa">
                                <div className="flex items-center gap-2">
                                  <Wallet className="w-4 h-4" />
                                  eSewa
                                </div>
                              </SelectItem>
                            )}
                            {!bankMethod && (
                              <SelectItem value="bank">
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4" />
                                  Bank Transfer
                                </div>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {methodType === "esewa" ? (
                        <>
                          <div className="space-y-2">
                            <Label>eSewa ID</Label>
                            <Input
                              placeholder="Enter your eSewa ID"
                              value={esewaData.esewa_id}
                              onChange={(e) => setEsewaData({ ...esewaData, esewa_id: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>eSewa Phone Number</Label>
                            <Input
                              placeholder="98XXXXXXXX"
                              value={esewaData.esewa_phone}
                              onChange={(e) => setEsewaData({ ...esewaData, esewa_phone: e.target.value })}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <Input
                              placeholder="e.g., Nepal Bank Ltd"
                              value={bankData.bank_name}
                              onChange={(e) => setBankData({ ...bankData, bank_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Account Number</Label>
                            <Input
                              placeholder="Enter account number"
                              value={bankData.bank_account_number}
                              onChange={(e) => setBankData({ ...bankData, bank_account_number: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Account Holder Name</Label>
                            <Input
                              placeholder="Name on account"
                              value={bankData.bank_account_holder}
                              onChange={(e) => setBankData({ ...bankData, bank_account_holder: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Branch (Optional)</Label>
                            <Input
                              placeholder="Branch name"
                              value={bankData.bank_branch}
                              onChange={(e) => setBankData({ ...bankData, bank_branch: e.target.value })}
                            />
                          </div>
                        </>
                      )}

                      <Button
                        onClick={handleAddMethod}
                        className="w-full"
                        disabled={addMethodMutation.isPending}
                      >
                        {addMethodMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Add Payment Method
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
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
                <Label>Booking Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified for new bookings</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Guest Messages</Label>
                <p className="text-sm text-muted-foreground">Receive guest inquiry alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Payment Alerts</Label>
                <p className="text-sm text-muted-foreground">Get payment confirmations</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Secure your host account</p>
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
    </HostLayout>
  );
};

export default HostSettings;
