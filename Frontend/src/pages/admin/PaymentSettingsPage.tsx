import React, { useState, useEffect } from "react";
import { ShieldCheck, Save, RefreshCw, AlertTriangle, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

export default function PaymentSettingsPage() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchGateways = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/payment/admin/gateways");
      setGateways(response.data.gateways);
    } catch (error) {
      console.error("Error fetching gateways:", error);
      toast({
        title: "Error",
        description: "Failed to load payment configurations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGateway = async (gatewayId: string, updates: any) => {
    setIsUpdating(gatewayId);
    try {
      await api.put(`/payment/admin/gateways/${gatewayId}`, updates);
      toast({
        title: "Success",
        description: "Gateway configuration updated successfully",
      });
      fetchGateways();
    } catch (error) {
      console.error("Error updating gateway:", error);
      toast({
        title: "Update Failed",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground italic">Fetching secure configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" /> Payment Gateway Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure API keys and operational modes for automated payment gateways. Restricted to Super Admin.
          </p>
        </div>
        <Badge variant="outline" className="border-primary text-primary bg-primary/5 uppercase tracking-widest px-3 py-1">
          Secure Zone (L3)
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {gateways.map((gw) => (
          <Card key={gw.id} className={gw.is_active ? "border-primary/20 shadow-md" : "opacity-75 grayscale-[0.5]"}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="capitalize text-lg">{gw.gateway_name}</CardTitle>
                <CardDescription>Configure credentials for {gw.gateway_name} checkout.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={gw.is_active ? "border-emerald-500/40 text-emerald-500 bg-emerald-50/10" : "text-muted-foreground"}>
                  {gw.is_active ? "Active" : "Inactive"}
                </Badge>
                <Switch 
                  checked={gw.is_active} 
                  onCheckedChange={(checked) => handleUpdateGateway(gw.id, { is_active: checked })}
                  disabled={isUpdating === gw.id}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-md flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <p className="font-bold">Mode: {gw.is_test_mode ? "TEST MODE" : "LIVE MODE"}</p>
                  <p>Transactions in test mode do not move real money. Switch to live only after testing.</p>
                </div>
                <Button 
                   variant="outline" 
                   size="sm" 
                   className="ml-auto text-[10px] h-7 border-amber-300"
                   onClick={() => handleUpdateGateway(gw.id, { is_test_mode: !gw.is_test_mode })}
                   disabled={isUpdating === gw.id}
                >
                    Switch to {gw.is_test_mode ? "Live" : "Test"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center justify-between">
                  API Key ID
                </Label>
                <Input 
                  defaultValue={gw.api_key} 
                  className="font-mono text-sm"
                  onBlur={(e) => {
                    if (e.target.value !== gw.api_key) {
                        handleUpdateGateway(gw.id, { api_key: e.target.value });
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">API Secret Key</Label>
                <div className="relative">
                  <Input 
                    type={showSecrets[gw.id] ? "text" : "password"}
                    placeholder="Enter Secret Key"
                    className="font-mono text-sm pr-10"
                    onBlur={(e) => {
                        if (e.target.value.length > 0) {
                            handleUpdateGateway(gw.id, { api_secret: e.target.value });
                        }
                    }}
                  />
                  <button 
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => toggleSecretVisibility(gw.id)}
                  >
                    {showSecrets[gw.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Last updated at {new Date(gw.updated_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
           <CardTitle className="text-sm">Webhook Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
            <p>For Razorpay, point your webhooks to: <code className="bg-muted px-1 py-0.5 rounded">/api/payment/webhook</code></p>
            <p>Ensure you have enabled the following events: <code className="bg-muted px-1 py-0.5 rounded">payment.captured</code>, <code className="bg-muted px-1 py-0.5 rounded">order.paid</code>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
