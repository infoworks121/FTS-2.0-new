import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SettingsHeader,
  SettingsCard,
  SettingsRow,
  SettingsDivider,
} from "@/components/settings/SettingsComponents";
import {
  AlertTriangle,
  Shield,
  Clock,
  Calendar,
  Wrench,
  CheckCircle,
  XCircle,
  User,
  Server,
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

// Maintenance Mode Page
export default function MaintenanceMode() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "We are currently performing scheduled maintenance. The system will be back online shortly. Thank you for your patience."
  );
  const [allowAdminAccess, setAllowAdminAccess] = useState(true);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [autoDisableEnabled, setAutoDisableEnabled] = useState(false);
  const [autoDisableDate, setAutoDisableDate] = useState("");
  const [autoDisableTime, setAutoDisableTime] = useState("");

  // Confirmation dialogs
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Countdown timer (for demo)
  const [countdown, setCountdown] = useState<string | null>(null);

  // Simulate countdown when maintenance is active
  useEffect(() => {
    if (isEnabled && autoDisableEnabled && autoDisableDate && autoDisableTime) {
      const targetDate = new Date(`${autoDisableDate}T${autoDisableTime}`);
      const interval = setInterval(() => {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        if (diff <= 0) {
          setCountdown(null);
          clearInterval(interval);
          setIsEnabled(false);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isEnabled, autoDisableEnabled, autoDisableDate, autoDisableTime]);

  const handleEnableMaintenance = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsEnabled(true);
    setIsProcessing(false);
    setShowEnableDialog(false);
  };

  const handleDisableMaintenance = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsEnabled(false);
    setIsProcessing(false);
    setShowDisableDialog(false);
  };

  return (
    <div className="container mx-auto py-6 pb-12">
      <SettingsHeader
        title="Maintenance Mode"
        description="Control system availability and schedule maintenance windows"
        lastUpdated={{
          by: "Admin User",
          time: "Feb 15, 2026 at 08:00 AM",
        }}
      />

      <div className="space-y-6">
        {/* Warning Banner when Maintenance is Active */}
        {isEnabled && (
          <Alert variant="destructive" className="border-red-500 bg-red-50">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-red-800">
              Maintenance Mode Active
            </AlertTitle>
            <AlertDescription className="text-red-700">
              The platform is currently in maintenance mode. Regular users cannot
              access the system.{" "}
              {allowAdminAccess
                ? "Admin access is enabled."
                : "Admin access is restricted."}
            </AlertDescription>
          </Alert>
        )}

        {/* Countdown Indicator */}
        {isEnabled && countdown && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <div className="font-medium text-amber-800">
                  Auto-disable countdown
                </div>
                <div className="text-sm text-amber-600">
                  Maintenance will be disabled in:{" "}
                  <span className="font-mono font-bold">{countdown}</span>
                </div>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-800">
              {countdown}
            </Badge>
          </div>
        )}

        {/* Main Toggle Card */}
        <SettingsCard
          title={isEnabled ? "Maintenance Mode Active" : "Maintenance Mode"}
          description={
            isEnabled
              ? "The system is currently in maintenance mode"
              : "Enable to put the system in maintenance mode"
          }
          icon={
            isEnabled ? (
              <Wrench className="h-5 w-5 text-red-500" />
            ) : (
              <Shield className="h-5 w-5" />
            )
          }
        >
          <div className="space-y-6">
            {/* Large Toggle */}
            <div className="flex items-center justify-between p-6 bg-muted/50 rounded-lg">
              <div>
                <div className="text-lg font-semibold">
                  {isEnabled ? (
                    <span className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      System Offline
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      System Online
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isEnabled
                    ? "Regular users cannot access the platform"
                    : "All users can access the platform normally"}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">Enable</div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => {
                    if (isEnabled) {
                      setShowDisableDialog(true);
                    } else {
                      setShowEnableDialog(true);
                    }
                  }}
                  className="scale-150"
                />
              </div>
            </div>

            {/* Maintenance Message */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Maintenance Message</Label>
              <p className="text-sm text-muted-foreground">
                This message will be displayed to users when they try to access
                the platform
              </p>
              <Textarea
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Enter maintenance message..."
                rows={4}
                disabled={!isEnabled}
                className={cn(!isEnabled && "opacity-50")}
              />
            </div>

            <SettingsDivider />

            {/* Access Control */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Access Control</Label>

              <SettingsRow
                label="Allow Admin Access"
                description="Administrators can still access the platform during maintenance"
              >
                <Switch
                  checked={allowAdminAccess}
                  onCheckedChange={setAllowAdminAccess}
                  disabled={!isEnabled}
                />
              </SettingsRow>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Admin Bypass</div>
                  <div className="text-muted-foreground">
                    When enabled, admin users can access all features even
                    during maintenance mode. Use this to perform system
                    configurations and updates.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Schedule Settings */}
        <SettingsCard
          title="Schedule Settings"
          description="Configure automatic maintenance scheduling"
          icon={<Calendar className="h-5 w-5" />}
        >
          <div className="space-y-6">
            <SettingsRow
              label="Enable Scheduled Maintenance"
              description="Automatically enable maintenance at a scheduled time"
            >
              <Switch
                checked={scheduleEnabled}
                onCheckedChange={setScheduleEnabled}
              />
            </SettingsRow>

            {scheduleEnabled && (
              <>
                <SettingsDivider />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <SettingsDivider />

            {/* Auto-disable */}
            <SettingsRow
              label="Auto-disable Maintenance"
              description="Automatically disable maintenance after a set time"
            >
              <Switch
                checked={autoDisableEnabled}
                onCheckedChange={setAutoDisableEnabled}
              />
            </SettingsRow>

            {autoDisableEnabled && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={autoDisableDate}
                    onChange={(e) => setAutoDisableDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={autoDisableTime}
                    onChange={(e) => setAutoDisableTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </SettingsCard>

        {/* System Status */}
        <SettingsCard
          title="System Status"
          description="Current platform availability status"
          icon={<Server className="h-5 w-5" />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-green-800">API Services</div>
              <div className="text-sm text-green-600">Operational</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-green-800">Database</div>
              <div className="text-sm text-green-600">Operational</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-green-800">Payment Gateway</div>
              <div className="text-sm text-green-600">Operational</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-green-800">CDN</div>
              <div className="text-sm text-green-600">Operational</div>
            </div>
          </div>
        </SettingsCard>
      </div>

      {/* Enable Maintenance Dialog */}
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Enable Maintenance Mode
            </DialogTitle>
            <DialogDescription>
              This will put the entire platform into maintenance mode. All
              regular users will be redirected to a maintenance page.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Make sure you have completed any critical operations before
              enabling maintenance mode.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEnableDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEnableMaintenance}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Wrench className="h-4 w-4 mr-2 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4 mr-2" />
                  Enable Maintenance
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Maintenance Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Maintenance Mode</DialogTitle>
            <DialogDescription>
              This will restore full access to the platform for all users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisableDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDisableMaintenance}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Wrench className="h-4 w-4 mr-2 animate-spin" />
                  Disabling...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Disable Maintenance
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
