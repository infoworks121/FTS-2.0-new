import React, { useState } from "react";
import {
  SettingsHeader,
  SettingsCard,
  SettingsRow,
  SettingsDivider,
  SettingsFooter,
} from "@/components/settings/SettingsComponents";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  Shield,
  Wrench,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Notification event type
interface NotificationEvent {
  id: string;
  name: string;
  description: string;
  priority: "low" | "medium" | "high";
  sms: boolean;
  email: boolean;
  push: boolean;
}

// Notification Rules Page
export default function NotificationRules() {
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [testNotificationOpen, setTestNotificationOpen] = useState(false);

  // Sample notification events
  const [notifications, setNotifications] = useState<NotificationEvent[]>([
    // Order events
    {
      id: "order_placed",
      name: "Order Placed",
      description: "When a new order is placed by a customer",
      priority: "high",
      sms: true,
      email: true,
      push: true,
    },
    {
      id: "order_completed",
      name: "Order Completed",
      description: "When an order is successfully completed",
      priority: "medium",
      sms: true,
      email: true,
      push: false,
    },
    {
      id: "order_cancelled",
      name: "Order Cancelled",
      description: "When an order is cancelled by customer or admin",
      priority: "medium",
      sms: true,
      email: true,
      push: true,
    },
    // Wallet events
    {
      id: "withdrawal_requested",
      name: "Withdrawal Requested",
      description: "When a user requests a withdrawal",
      priority: "high",
      sms: true,
      email: true,
      push: true,
    },
    {
      id: "withdrawal_approved",
      name: "Withdrawal Approved",
      description: "When a withdrawal request is approved",
      priority: "high",
      sms: true,
      email: true,
      push: true,
    },
    {
      id: "withdrawal_rejected",
      name: "Withdrawal Rejected",
      description: "When a withdrawal request is rejected",
      priority: "medium",
      sms: true,
      email: true,
      push: true,
    },
    // Cap events
    {
      id: "cap_reached",
      name: "Cap Reached",
      description: "When a user reaches their transaction cap",
      priority: "high",
      sms: false,
      email: true,
      push: true,
    },
    {
      id: "cap_warning",
      name: "Cap Warning",
      description: "When a user approaches their transaction cap",
      priority: "medium",
      sms: false,
      email: true,
      push: false,
    },
    // Risk events
    {
      id: "fraud_alert",
      name: "Fraud Alert",
      description: "When suspicious activity is detected",
      priority: "high",
      sms: true,
      email: true,
      push: true,
    },
    {
      id: "risk_warning",
      name: "Risk Warning",
      description: "When a transaction is flagged for review",
      priority: "high",
      sms: false,
      email: true,
      push: true,
    },
    // System events
    {
      id: "maintenance_scheduled",
      name: "Maintenance Scheduled",
      description: "When system maintenance is scheduled",
      priority: "low",
      sms: false,
      email: true,
      push: true,
    },
    {
      id: "maintenance_completed",
      name: "Maintenance Completed",
      description: "When system maintenance is completed",
      priority: "low",
      sms: false,
      email: false,
      push: true,
    },
  ]);

  const handleToggle = (
    id: string,
    channel: "sms" | "email" | "push"
  ) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, [channel]: !n[channel] } : n
      )
    );
    setHasChanges(true);
  };

  const handleBulkEnable = (channel: "sms" | "email" | "push", enabled: boolean) => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, [channel]: enabled }))
    );
    setHasChanges(true);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="secondary" className="text-xs">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => {
          if (activeTab === "sms") return n.sms;
          if (activeTab === "email") return n.email;
          if (activeTab === "push") return n.push;
          return true;
        });

  const handleSave = async () => {
    setShowConfirmDialog(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
    setShowConfirmDialog(false);
  };

  const handleReset = () => {
    // Reset to defaults
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        sms: n.priority === "high",
        email: true,
        push: n.priority === "high",
      }))
    );
    setHasChanges(false);
  };

  return (
    <div className="container mx-auto py-6 pb-24">
      <SettingsHeader
        title="Notification Rules"
        description="Configure how and when users receive notifications"
        lastUpdated={{
          by: "Admin User",
          time: "Feb 15, 2026 at 09:15 AM",
        }}
      />

      {/* Bulk Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkEnable("sms", true)}
          >
            Enable All SMS
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkEnable("email", true)}
          >
            Enable All Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkEnable("push", true)}
          >
            Enable All Push
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => setTestNotificationOpen(true)}
        >
          <Bell className="h-4 w-4 mr-2" />
          Send Test Notification
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="push">Push</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <SettingsCard
            title="Notification Events"
            description="Configure notification channels for each event type"
            icon={<Bell className="h-5 w-5" />}
          >
            <div className="space-y-0">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 py-3 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-4">Event</div>
                <div className="col-span-2 text-center">Priority</div>
                <div className="col-span-2 text-center">
                  <MessageSquare className="h-4 w-4 mx-auto" />
                </div>
                <div className="col-span-2 text-center">
                  <Mail className="h-4 w-4 mx-auto" />
                </div>
                <div className="col-span-2 text-center">
                  <Smartphone className="h-4 w-4 mx-auto" />
                </div>
              </div>

              {/* Notification Items */}
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <div
                    className={cn(
                      "grid grid-cols-12 gap-4 py-4 items-center",
                      index % 2 === 0 ? "bg-muted/30" : ""
                    )}
                  >
                    <div className="col-span-4">
                      <div className="font-medium">{notification.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {notification.description}
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {getPriorityBadge(notification.priority)}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Switch
                        checked={notification.sms}
                        onCheckedChange={() =>
                          handleToggle(notification.id, "sms")
                        }
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Switch
                        checked={notification.email}
                        onCheckedChange={() =>
                          handleToggle(notification.id, "email")
                        }
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Switch
                        checked={notification.push}
                        onCheckedChange={() =>
                          handleToggle(notification.id, "push")
                        }
                      />
                    </div>
                  </div>
                  {index < filteredNotifications.length - 1 && (
                    <div className="h-px bg-border" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </SettingsCard>
        </TabsContent>
      </Tabs>

      <SettingsFooter
        onSave={handleSave}
        onReset={handleReset}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Notification Changes</DialogTitle>
            <DialogDescription>
              This will update notification preferences for all users. Are you
              sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Notification Dialog */}
      <Dialog open={testNotificationOpen} onOpenChange={setTestNotificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Notification</DialogTitle>
            <DialogDescription>
              Send a test notification to verify your configuration
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" /> SMS
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
                <Button variant="outline" size="sm">
                  <Smartphone className="h-4 w-4 mr-1" /> Push
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Test Message</Label>
              <div className="p-3 bg-muted rounded-md text-sm">
                This is a test notification from FTS Admin Panel. If you
                receive this, your notification settings are working correctly.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTestNotificationOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setTestNotificationOpen(false)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
