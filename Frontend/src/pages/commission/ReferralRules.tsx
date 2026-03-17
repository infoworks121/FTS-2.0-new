import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CommissionLayout,
  PercentageCard,
  RuleHistoryTable,
  ChangePreview,
} from "@/components/commission";
import { 
  Info, 
  Users, 
  Gift, 
  Clock, 
  Shield, 
  AlertTriangle,
  Calculator,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface ReferralRulesData {
  selfPurchaseAllowed: boolean;
  referralPercentage: number;
  payoutDelayDays: number;
  returnWindowDays: number;
  minOrderValue: number;
  maxReferralEarning: number;
}

const initialData: ReferralRulesData = {
  selfPurchaseAllowed: false,
  referralPercentage: 10,
  payoutDelayDays: 7,
  returnWindowDays: 15,
  minOrderValue: 500,
  maxReferralEarning: 5000,
};

const historyData = [
  {
    id: "1",
    version: 3,
    effectiveFrom: "2025-12-01",
    effectiveTo: "—",
    status: "active" as const,
    changes: "Increased return window and max earning cap",
    changedBy: "Admin",
    changedAt: "2025-11-25 14:00",
    details: [
      { field: "Return Window", oldValue: "10 days", newValue: "15 days" },
      { field: "Max Referral Earning", oldValue: "₹3000", newValue: "₹5000" },
    ],
  },
  {
    id: "2",
    version: 2,
    effectiveFrom: "2025-08-15",
    effectiveTo: "2025-11-30",
    status: "archived" as const,
    changes: "Enabled self-purchase referrals",
    changedBy: "Admin",
    changedAt: "2025-08-12 09:30",
    details: [
      { field: "Self Purchase Allowed", oldValue: "No", newValue: "Yes" },
    ],
  },
];

// Eligibility checklist items
const eligibilityChecklist = [
  { label: "Valid referral code used", required: true },
  { label: "Minimum order value met", required: true },
  { label: "Not in return window", required: true },
  { label: "Referrer verified", required: true },
  { label: "No duplicate accounts", required: true },
  { label: "Device not flagged", required: false },
];

// Scenario configurations
const scenarioConfigs = [
  {
    scenario: "New Customer Referral",
    percentage: 10,
    description: "Referrer earns when new customer makes first purchase",
    badge: "Active",
  },
  {
    scenario: "Repeat Purchase Referral",
    percentage: 5,
    description: "Reduced rate for subsequent referrals",
    badge: "Active",
  },
  {
    scenario: "Self Purchase",
    percentage: 0,
    description: "No commission for self-referral",
    badge: "Disabled",
  },
];

export default function ReferralRules() {
  const [data, setData] = useState<ReferralRulesData>(initialData);
  const [originalData] = useState<ReferralRulesData>(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [simulationAmount, setSimulationAmount] = useState(5000);

  const updateField = (
    field: keyof ReferralRulesData,
    value: number | boolean
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const getChanges = (): ChangePreview[] => {
    const changes: ChangePreview[] = [];
    
    if (data.selfPurchaseAllowed !== originalData.selfPurchaseAllowed) {
      changes.push({
        field: "Self Purchase Allowed",
        oldValue: originalData.selfPurchaseAllowed ? "Yes" : "No",
        newValue: data.selfPurchaseAllowed ? "Yes" : "No",
      });
    }
    if (data.referralPercentage !== originalData.referralPercentage) {
      changes.push({
        field: "Referral Percentage",
        oldValue: `${originalData.referralPercentage}%`,
        newValue: `${data.referralPercentage}%`,
      });
    }
    if (data.payoutDelayDays !== originalData.payoutDelayDays) {
      changes.push({
        field: "Payout Delay",
        oldValue: `${originalData.payoutDelayDays} days`,
        newValue: `${data.payoutDelayDays} days`,
      });
    }
    if (data.returnWindowDays !== originalData.returnWindowDays) {
      changes.push({
        field: "Return Window",
        oldValue: `${originalData.returnWindowDays} days`,
        newValue: `${data.returnWindowDays} days`,
      });
    }
    
    return changes;
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 1500);
  };

  const handleReset = () => {
    setData(initialData);
    setHasChanges(false);
  };

  const simulatedEarning = (simulationAmount * data.referralPercentage) / 100;

  return (
    <CommissionLayout
      title="Referral Percentage Rules"
      description="Control single-level referral earnings and eligibility"
      status="active"
      lastUpdated={{ by: "Admin", time: "2025-11-25 14:00" }}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
      changes={getChanges()}
      historySection={
        <RuleHistoryTable history={historyData} title="" />
      }
    >
      {/* Self Purchase Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Self Purchase Configuration
          </CardTitle>
          <CardDescription>
            Control whether users can earn referral commissions on their own purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <Label className="text-base font-medium">Allow Self Purchase Referrals</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, users can earn referral commissions on their own orders using their referral code
              </p>
            </div>
            <Switch
              checked={data.selfPurchaseAllowed}
              onCheckedChange={(checked) => updateField("selfPurchaseAllowed", checked)}
            />
          </div>
          
          {!data.selfPurchaseAllowed && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>Self-referrals are blocked. Users cannot earn on their own purchases.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Percentage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Percentage
          </CardTitle>
          <CardDescription>
            Configure how much referrers earn from successful referrals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PercentageCard
              label="Referral Percentage"
              value={data.referralPercentage}
              onChange={(v) => updateField("referralPercentage", v)}
              tooltip="Percentage of order value earned by the referrer"
              variant="profit"
              max={50}
            />
            
            <div className="space-y-4">
              <PercentageCard
                label="Minimum Order Value"
                value={data.minOrderValue}
                onChange={(v) => updateField("minOrderValue", v)}
                tooltip="Minimum order amount to qualify for referral commission"
                variant="default"
                max={10000}
              />
              <PercentageCard
                label="Maximum Earning Cap"
                value={data.maxReferralEarning}
                onChange={(v) => updateField("maxReferralEarning", v)}
                tooltip="Maximum total referral earnings allowed per referrer"
                variant="reserve"
                max={50000}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout & Return Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Payout & Return Window Rules
          </CardTitle>
          <CardDescription>
            Configure when referral earnings are paid out
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Payout Delay (Days)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Number of days to wait before releasing referral commission
              </p>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={data.payoutDelayDays}
                  onChange={(e) => updateField("payoutDelayDays", parseInt(e.target.value) || 0)}
                  className="w-24 text-center font-mono"
                  min={0}
                  max={90}
                />
                <span className="text-muted-foreground">days</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Return Window Lock (Days)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Referral is locked if referred customer returns within this period
              </p>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={data.returnWindowDays}
                  onChange={(e) => updateField("returnWindowDays", parseInt(e.target.value) || 0)}
                  className="w-24 text-center font-mono"
                  min={0}
                  max={90}
                />
                <span className="text-muted-foreground">days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario-Based Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scenario-Based Configuration</CardTitle>
          <CardDescription>
            Different commission rates based on referral scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase">Scenario</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Rate</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Description</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarioConfigs.map((config, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{config.scenario}</TableCell>
                  <TableCell className="font-mono">{config.percentage}%</TableCell>
                  <TableCell className="text-muted-foreground">{config.description}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={config.badge === "Active" ? "default" : "secondary"}
                      className={config.badge === "Active" ? "bg-profit/10 text-profit" : ""}
                    >
                      {config.badge}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Referral Eligibility Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Referral Eligibility Checklist
          </CardTitle>
          <CardDescription>
            Conditions that must be met for referral commission to be valid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eligibilityChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {item.required ? (
                    <CheckCircle2 className="h-4 w-4 text-profit" />
                  ) : (
                    <Info className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">{item.label}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.required ? "Required" : "Optional"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fake Order Warning */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-warning">
            <AlertTriangle className="h-4 w-4" />
            Fake Order Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Same-device referrals</span>
              <span className="font-mono text-warning">Blocked</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Same-IP referrals (24h)</span>
              <span className="font-mono text-warning">Flagged</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Bulk account detection</span>
              <span className="font-mono text-warning">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Preview */}
      <Card className="border-profit/30 bg-profit/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-profit" />
            Simulation Preview
          </CardTitle>
          <CardDescription>
            Preview referral earnings with sample order values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm">Order Amount:</Label>
              <Input
                type="number"
                value={simulationAmount}
                onChange={(e) => setSimulationAmount(parseInt(e.target.value) || 0)}
                className="w-32 font-mono"
              />
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Referral Rate</span>
                <p className="font-mono font-bold text-profit">{data.referralPercentage}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Estimated Earnings</span>
                <p className="font-mono font-bold text-lg">₹{simulatedEarning.toFixed(0)}</p>
              </div>
            </div>
            
            {simulatedEarning > data.maxReferralEarning && (
              <div className="flex items-center gap-2 text-warning text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span>Capped at maximum earning limit of ₹{data.maxReferralEarning}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}
