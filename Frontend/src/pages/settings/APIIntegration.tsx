import React, { useState } from "react";
import {
  SettingsHeader,
  SettingsCard,
  SettingsRow,
  SettingsDivider,
} from "@/components/settings/SettingsComponents";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Key,
  Copy,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Webhook,
  CreditCard,
  MessageSquare,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// API Integration type
interface APIIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "inactive";
  apiKey: string;
  apiSecret: string;
  webhooks: {
    incoming: boolean;
    outgoing: boolean;
  };
  lastActivity?: string;
}

// API & Integration Page
export default function APIIntegration() {
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [showRegenerateDialog, setShowRegenerateDialog] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiLogsOpen, setApiLogsOpen] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState<APIIntegration[]>([
    {
      id: "payment_gateway",
      name: "Payment Gateway",
      description: "Process online payments and transactions",
      icon: <CreditCard className="h-5 w-5" />,
      status: "active",
      apiKey: "pk_live_51HxK2EKLm...",
      apiSecret: "sk_live_51HxK2EKLm...",
      webhooks: { incoming: true, outgoing: true },
      lastActivity: "2 mins ago",
    },
    {
      id: "sms_gateway",
      name: "SMS Gateway",
      description: "Send SMS notifications to users",
      icon: <MessageSquare className="h-5 w-5" />,
      status: "active",
      apiKey: "SM5f7a8b9c...",
      apiSecret: "sm_auth_5f7a8b...",
      webhooks: { incoming: false, outgoing: true },
      lastActivity: "5 mins ago",
    },
    {
      id: "email_service",
      name: "Email Service",
      description: "Send transactional emails",
      icon: <Mail className="h-5 w-5" />,
      status: "active",
      apiKey: "sendgrid_k9j8h7g6...",
      apiSecret: "SG.k9j8h7g6f5e...",
      webhooks: { incoming: true, outgoing: true },
      lastActivity: "10 mins ago",
    },
    {
      id: "webhooks",
      name: "Webhooks",
      description: "Configure incoming and outgoing webhooks",
      icon: <Webhook className="h-5 w-5" />,
      status: "inactive",
      apiKey: "",
      apiSecret: "",
      webhooks: { incoming: false, outgoing: false },
    },
    {
      id: "future_api",
      name: "Future API (Coming Soon)",
      description: "Additional API integrations",
      icon: <Key className="h-5 w-5" />,
      status: "inactive",
      apiKey: "---",
      apiSecret: "---",
      webhooks: { incoming: false, outgoing: false },
    },
  ]);

  const toggleSecret = (id: string) => {
    setShowSecret((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStatus = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: i.status === "active" ? "inactive" : "active" }
          : i
      )
    );
  };

  const regenerateKey = async (id: string) => {
    // Simulate API key regeneration
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              apiKey: `pk_${Math.random().toString(36).substring(2, 15)}...`,
              apiSecret: `sk_${Math.random().toString(36).substring(2, 15)}...`,
            }
          : i
      )
    );
    setShowRegenerateDialog(null);
  };

  const getStatusBadge = (status: "active" | "inactive") => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="h-3 w-3 mr-1" /> Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" /> Inactive
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 pb-12">
      <SettingsHeader
        title="API & Integration"
        description="Manage external system connectivity and API keys"
        lastUpdated={{
          by: "Admin User",
          time: "Feb 14, 2026 at 04:45 PM",
        }}
      />

      <div className="space-y-6">
        {/* API Key Security Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Notice</AlertTitle>
          <AlertDescription>
            API keys provide full access to your system. Keep them secure and never
            share them publicly. Regenerate keys immediately if you suspect they
            have been compromised.
          </AlertDescription>
        </Alert>

        {/* API Integrations */}
        {integrations.map((integration) => (
          <SettingsCard
            key={integration.id}
            title={integration.name}
            description={integration.description}
            icon={integration.icon}
          >
            <div className="space-y-4">
              {/* Status and Toggle */}
              <div className="flex items-center justify-between">
                {getStatusBadge(integration.status)}
                {integration.id !== "future_api" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Enable
                    </span>
                    <Switch
                      checked={integration.status === "active"}
                      onCheckedChange={() => toggleStatus(integration.id)}
                      disabled={integration.id === "future_api"}
                    />
                  </div>
                )}
              </div>

              {integration.status === "active" && (
                <>
                  <SettingsDivider />

                  {/* API Key */}
                  <SettingsRow
                    label="API Key"
                    description="Public identifier for your integration"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={integration.apiKey}
                        readOnly
                        className="w-64 font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(integration.apiKey, `${integration.id}-key`)
                        }
                      >
                        {copiedId === `${integration.id}-key` ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </SettingsRow>

                  <SettingsDivider />

                  {/* API Secret */}
                  <SettingsRow
                    label="API Secret"
                    description="Keep this secret - used for authentication"
                    tooltip="Never share this key with anyone"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        type={showSecret[integration.id] ? "text" : "password"}
                        value={integration.apiSecret}
                        readOnly
                        className="w-64 font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleSecret(integration.id)}
                      >
                        {showSecret[integration.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(
                            integration.apiSecret,
                            `${integration.id}-secret`
                          )
                        }
                      >
                        {copiedId === `${integration.id}-secret` ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </SettingsRow>

                  <SettingsDivider />

                  {/* Webhooks */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium">Webhooks</div>
                      <div className="text-sm text-muted-foreground">
                        Configure webhook endpoints
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Incoming
                        </span>
                        <Switch
                          checked={integration.webhooks.incoming}
                          disabled
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Outgoing
                        </span>
                        <Switch
                          checked={integration.webhooks.outgoing}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Last Activity */}
                  {integration.lastActivity && (
                    <>
                      <SettingsDivider />
                      <div className="text-xs text-muted-foreground">
                        Last activity: {integration.lastActivity}
                      </div>
                    </>
                  )}

                  <SettingsDivider />

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setApiLogsOpen(integration.id)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Logs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRegenerateDialog(integration.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate Keys
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SettingsCard>
        ))}
      </div>

      {/* Regenerate Key Dialog */}
      <Dialog
        open={!!showRegenerateDialog}
        onOpenChange={() => setShowRegenerateDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Regenerate API Keys
            </DialogTitle>
            <DialogDescription>
              This will invalidate your current API keys and generate new ones.
              Any existing integrations using the old keys will stop working.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action cannot be undone. Make sure to update any
              integrations before regenerating.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRegenerateDialog(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showRegenerateDialog && regenerateKey(showRegenerateDialog)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Keys
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Logs Dialog */}
      <Dialog open={!!apiLogsOpen} onOpenChange={() => setApiLogsOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Activity Logs</DialogTitle>
            <DialogDescription>
              Recent API activity for this integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <div className="p-3 bg-muted rounded-md font-mono text-xs space-y-1">
              <div className="text-green-600">[2026-02-15 10:30:45] POST /api/v1/payment/initiate - 200 OK</div>
              <div className="text-muted-foreground">Duration: 234ms</div>
            </div>
            <div className="p-3 bg-muted rounded-md font-mono text-xs space-y-1">
              <div className="text-green-600">[2026-02-15 10:28:12] GET /api/v1/payment/status - 200 OK</div>
              <div className="text-muted-foreground">Duration: 156ms</div>
            </div>
            <div className="p-3 bg-muted rounded-md font-mono text-xs space-y-1">
              <div className="text-red-600">[2026-02-15 10:25:33] POST /api/v1/payment/refund - 400 Bad Request</div>
              <div className="text-muted-foreground">Duration: 89ms</div>
            </div>
            <div className="p-3 bg-muted rounded-md font-mono text-xs space-y-1">
              <div className="text-green-600">[2026-02-15 10:20:15] GET /api/v1/user/verify - 200 OK</div>
              <div className="text-muted-foreground">Duration: 178ms</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiLogsOpen(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
