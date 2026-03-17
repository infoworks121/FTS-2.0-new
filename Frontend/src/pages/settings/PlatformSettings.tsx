import React, { useState } from "react";
import {
  SettingsHeader,
  SettingsCard,
  SettingsRow,
  SettingsDivider,
  SettingsFooter,
} from "@/components/settings/SettingsComponents";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Globe,
  Calendar,
  DollarSign,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Platform Settings Page
export default function PlatformSettings() {
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Platform settings state
  const [settings, setSettings] = useState({
    platformName: "FTS - Financial Trading System",
    platformLogo: "/logo.png",
    defaultCurrency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    defaultUserRole: "businessman",
    platformEnabled: true,
    registrationEnabled: true,
    kycRequired: true,
    referralEnabled: true,
    capEnabled: true,
  });

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setShowConfirmDialog(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
    setShowConfirmDialog(false);
  };

  const handleReset = () => {
    setSettings({
      platformName: "FTS - Financial Trading System",
      platformLogo: "/logo.png",
      defaultCurrency: "INR",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      numberFormat: "1,234.56",
      defaultUserRole: "businessman",
      platformEnabled: true,
      registrationEnabled: true,
      kycRequired: true,
      referralEnabled: true,
      capEnabled: true,
    });
    setHasChanges(false);
  };

  return (
    <div className="container mx-auto py-6 pb-24">
      <SettingsHeader
        title="Platform Settings"
        description="Configure core system settings and global preferences"
        lastUpdated={{
          by: "Admin User",
          time: "Feb 15, 2026 at 10:30 AM",
        }}
      />

      <div className="space-y-6">
        {/* Platform Identity */}
        <SettingsCard
          title="Platform Identity"
          description="Basic platform information"
          icon={<Building2 className="h-5 w-5" />}
        >
          <div className="grid gap-4">
            <SettingsRow
              label="Platform Name"
              description="The name displayed to users throughout the system"
              tooltip="This name will appear in the header, emails, and notifications"
            >
              <Input
                value={settings.platformName}
                onChange={(e) => handleChange("platformName", e.target.value)}
                className="w-64"
              />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              label="Platform Logo"
              description="Upload your platform logo (recommended: 200x50px)"
              tooltip="Supported formats: PNG, JPG, SVG"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-20 rounded border bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Logo</span>
                </div>
                <Button variant="outline" size="sm">
                  Upload
                </Button>
              </div>
            </SettingsRow>
          </div>
        </SettingsCard>

        {/* Regional Settings */}
        <SettingsCard
          title="Regional Settings"
          description="Currency, timezone, and format preferences"
          icon={<Globe className="h-5 w-5" />}
        >
          <div className="grid gap-4">
            <SettingsRow
              label="Default Currency"
              description="Primary currency for transactions"
              tooltip="Users can select their preferred currency, but this is the system default"
            >
              <Select
                value={settings.defaultCurrency}
                onValueChange={(value) => handleChange("defaultCurrency", value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">🇮🇳 INR (₹)</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                  <SelectItem value="GBP">🇬🇧 GBP (£)</SelectItem>
                  <SelectItem value="BDT">🇧🇩 BDT (৳)</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              label="Timezone"
              description="System timezone for date/time operations"
              tooltip="All timestamps will be displayed in this timezone"
            >
              <Select
                value={settings.timezone}
                onValueChange={(value) => handleChange("timezone", value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">
                    Asia/Kolkata (GMT+5:30)
                  </SelectItem>
                  <SelectItem value="Asia/Dhaka">
                    Asia/Dhaka (GMT+6:00)
                  </SelectItem>
                  <SelectItem value="UTC">UTC (GMT+0:00)</SelectItem>
                  <SelectItem value="America/New_York">
                    America/New_York (GMT-5:00)
                  </SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              label="Date Format"
              description="How dates are displayed throughout the system"
            >
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => handleChange("dateFormat", value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              label="Number Format"
              description="Decimal and thousand separators"
            >
              <Select
                value={settings.numberFormat}
                onValueChange={(value) => handleChange("numberFormat", value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1,234.56">1,234.56</SelectItem>
                  <SelectItem value="1.234,56">1.234,56</SelectItem>
                  <SelectItem value="1 234.56">1 234.56</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
          </div>
        </SettingsCard>

        {/* User Role Settings */}
        <SettingsCard
          title="Default Role Rules"
          description="Configure default user role and permissions"
          icon={<Users className="h-5 w-5" />}
        >
          <div className="grid gap-4">
            <SettingsRow
              label="Default User Role"
              description="Role assigned to new users by default"
              tooltip="Users can upgrade their role based on eligibility"
            >
              <Select
                value={settings.defaultUserRole}
                onValueChange={(value) => handleChange("defaultUserRole", value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="businessman">Businessman</SelectItem>
                  <SelectItem value="entry">Entry Mode</SelectItem>
                  <SelectItem value="stockpoint">Stock Point</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
          </div>
        </SettingsCard>

        {/* Global Enable/Disable Flags */}
        <SettingsCard
          title="Global Feature Flags"
          description="Enable or disable core platform features"
          icon={<AlertCircle className="h-5 w-5" />}
        >
          <div className="grid gap-4">
            <SettingsRow
              label="Platform Enabled"
              description="Enable or disable the entire platform"
              tooltip="When disabled, no users can access the platform"
            >
              <Switch
                checked={settings.platformEnabled}
                onCheckedChange={(checked) =>
                  handleChange("platformEnabled", checked)
                }
              />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              label="User Registration"
              description="Allow new users to register"
              tooltip="Existing users can still log in when disabled"
            >
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) =>
                  handleChange("registrationEnabled", checked)
                }
              />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              label="KYC Required"
              description="Require KYC verification for all users"
              tooltip="Users cannot transact without KYC approval"
            >
              <Switch
                checked={settings.kycRequired}
                onCheckedChange={(checked) =>
                  handleChange("kycRequired", checked)
                }
              />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              label="Referral System"
              description="Enable referral program for users"
              tooltip="Users can refer others and earn commissions"
            >
              <Switch
                checked={settings.referralEnabled}
                onCheckedChange={(checked) =>
                  handleChange("referralEnabled", checked)
                }
              />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              label="Cap Enforcement"
              description="Enforce transaction caps and limits"
              tooltip="Users cannot exceed their assigned caps"
            >
              <Switch
                checked={settings.capEnabled}
                onCheckedChange={(checked) => handleChange("capEnabled", checked)}
              />
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>

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
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to save these changes? Some settings may
              affect system behavior immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSave}>Yes, Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
