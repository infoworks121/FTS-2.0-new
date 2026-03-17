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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Globe,
  Languages,
  Type,
  DollarSign,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Language type
interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
  enabled: boolean;
  isDefault: boolean;
}

// Language & Localization Page
export default function LanguageLocalization() {
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewText, setPreviewText] = useState("Hello, Welcome to FTS!");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const [settings, setSettings] = useState({
    defaultLanguage: "en",
    numberFormat: "1,234.56",
    currencyFormat: "₹1,234.56",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    fallbackLanguage: "en",
    enableRTL: false,
  });

  const [languages, setLanguages] = useState<Language[]>([
    {
      id: "en",
      code: "en",
      name: "English",
      nativeName: "English",
      direction: "ltr",
      enabled: true,
      isDefault: true,
    },
    {
      id: "hi",
      code: "hi",
      name: "Hindi",
      nativeName: "हिन्दी",
      direction: "ltr",
      enabled: true,
      isDefault: false,
    },
    {
      id: "bn",
      code: "bn",
      name: "Bengali",
      nativeName: "বাংলা",
      direction: "ltr",
      enabled: true,
      isDefault: false,
    },
    {
      id: "ta",
      code: "ta",
      name: "Tamil",
      nativeName: "தமிழ்",
      direction: "ltr",
      enabled: false,
      isDefault: false,
    },
    {
      id: "te",
      code: "te",
      name: "Telugu",
      nativeName: "తెలుగు",
      direction: "ltr",
      enabled: false,
      isDefault: false,
    },
    {
      id: "ar",
      code: "ar",
      name: "Arabic",
      nativeName: "العربية",
      direction: "rtl",
      enabled: false,
      isDefault: false,
    },
  ]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const toggleLanguage = (id: string) => {
    setLanguages((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, enabled: !l.enabled } : l
      )
    );
    setHasChanges(true);
  };

  const setDefaultLanguage = (id: string) => {
    setLanguages((prev) =>
      prev.map((l) => ({
        ...l,
        isDefault: l.id === id,
        enabled: l.id === id ? true : l.enabled,
      }))
    );
    handleSettingChange("defaultLanguage", id);
  };

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
    setSettings({
      defaultLanguage: "en",
      numberFormat: "1,234.56",
      currencyFormat: "₹1,234.56",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "12h",
      fallbackLanguage: "en",
      enableRTL: false,
    });
    setHasChanges(false);
  };

  const selectedLang = languages.find((l) => l.id === selectedLanguage);

  return (
    <div className="container mx-auto py-6 pb-24">
      <SettingsHeader
        title="Language & Localization"
        description="Configure multi-language support and regional settings"
        lastUpdated={{
          by: "Admin User",
          time: "Feb 13, 2026 at 02:20 PM",
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Default Language */}
          <SettingsCard
            title="Default Language"
            description="Primary language for the platform"
            icon={<Globe className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <SettingsRow
                label="System Default"
                description="Language shown to new users"
              >
                <Select
                  value={settings.defaultLanguage}
                  onValueChange={(value) => {
                    handleSettingChange("defaultLanguage", value);
                    setDefaultLanguage(value);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages
                      .filter((l) => l.enabled)
                      .map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.nativeName} ({lang.name})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </SettingsRow>

              <SettingsDivider />

              <SettingsRow
                label="Fallback Language"
                description="Language when translation is missing"
              >
                <Select
                  value={settings.fallbackLanguage}
                  onValueChange={(value) =>
                    handleSettingChange("fallbackLanguage", value)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages
                      .filter((l) => l.enabled)
                      .map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.nativeName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </SettingsRow>
            </div>
          </SettingsCard>

          {/* Supported Languages */}
          <SettingsCard
            title="Supported Languages"
            description="Enable or disable languages for your platform"
            icon={<Languages className="h-5 w-5" />}
          >
            <div className="space-y-2">
              {languages.map((lang, index) => (
                <React.Fragment key={lang.id}>
                  <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {lang.direction === "rtl" ? (
                          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{lang.nativeName}</span>
                        <span className="text-muted-foreground">({lang.name})</span>
                        <span className="text-xs text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                          {lang.code}
                        </span>
                      </div>
                      {lang.isDefault && (
                        <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={lang.enabled}
                        onCheckedChange={() => toggleLanguage(lang.id)}
                        disabled={lang.isDefault}
                      />
                    </div>
                  </div>
                  {index < languages.length - 1 && (
                    <div className="h-px bg-border" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </SettingsCard>

          {/* RTL Support */}
          <SettingsCard
            title="RTL Support"
            description="Enable right-to-left layout for supported languages"
            icon={<Type className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <SettingsRow
                label="Enable RTL"
                description="Automatically switch to RTL for Arabic and other RTL languages"
              >
                <Switch
                  checked={settings.enableRTL}
                  onCheckedChange={(checked) =>
                    handleSettingChange("enableRTL", checked)
                  }
                />
              </SettingsRow>
            </div>
          </SettingsCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Number & Currency */}
          <SettingsCard
            title="Number & Currency"
            description="Configure number, currency, and decimal formats"
            icon={<DollarSign className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <SettingsRow
                label="Number Format"
                description="How numbers are displayed"
              >
                <Select
                  value={settings.numberFormat}
                  onValueChange={(value) =>
                    handleSettingChange("numberFormat", value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1,234.56">1,234.56</SelectItem>
                    <SelectItem value="1.234,56">1.234,56</SelectItem>
                    <SelectItem value="1 234.56">1 234.56</SelectItem>
                    <SelectItem value="1,234.56">1,234.56 (India)</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>

              <SettingsDivider />

              <SettingsRow
                label="Currency Format"
                description="How currency amounts are displayed"
              >
                <Select
                  value={settings.currencyFormat}
                  onValueChange={(value) =>
                    handleSettingChange("currencyFormat", value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="₹1,234.56">₹1,234.56</SelectItem>
                    <SelectItem value="$1,234.56">$1,234.56</SelectItem>
                    <SelectItem value="€1,234.56">€1,234.56</SelectItem>
                    <SelectItem value="£1,234.56">£1,234.56</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
            </div>
          </SettingsCard>

          {/* Date & Time */}
          <SettingsCard
            title="Date & Time"
            description="Configure date and time display formats"
            icon={<Calendar className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <SettingsRow
                label="Date Format"
                description="How dates are displayed"
              >
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) =>
                    handleSettingChange("dateFormat", value)
                  }
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
                label="Time Format"
                description="12-hour or 24-hour clock"
              >
                <Select
                  value={settings.timeFormat}
                  onValueChange={(value) =>
                    handleSettingChange("timeFormat", value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
            </div>
          </SettingsCard>

          {/* Live Preview */}
          <SettingsCard
            title="Live Preview"
            description="Preview how content will appear in selected language"
            icon={<Eye className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages
                      .filter((l) => l.enabled)
                      .map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.nativeName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline">
                  {selectedLang?.direction.toUpperCase()}
                </Badge>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  Preview Text
                </Label>
                <Textarea
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="mt-1"
                  placeholder="Enter text to preview..."
                />
              </div>

              <div
                className={cn(
                  "p-4 bg-muted rounded-lg border-2 border-dashed",
                  selectedLang?.direction === "rtl" ? "text-right" : "text-left",
                  selectedLang?.direction === "rtl" && "rtl"
                )}
                dir={selectedLang?.direction}
              >
                <div className="text-2xl font-bold mb-2">{previewText}</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Number: {settings.numberFormat.replace("1,234.56", "12,345.67")}</div>
                  <div>Currency: {settings.currencyFormat.replace("1,234.56", "₹12,345.67")}</div>
                  <div>Date: {settings.dateFormat.replace("DD/MM/YYYY", "15/02/2026")}</div>
                  <div>Time: {settings.timeFormat === "12h" ? "10:30 AM" : "10:30"}</div>
                </div>
              </div>
            </div>
          </SettingsCard>
        </div>
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
            <DialogTitle>Save Language Settings</DialogTitle>
            <DialogDescription>
              These changes will affect how content is displayed to users. Are
              you sure you want to continue?
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
    </div>
  );
}
