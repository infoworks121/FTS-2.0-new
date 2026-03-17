import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CommissionLayout,
  PercentageCard,
  RuleHistoryTable,
  ChangePreview,
} from "@/components/commission";
import { 
  Info, 
  Users, 
  Wallet, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  Lock
} from "lucide-react";

interface CoreBodyData {
  coreBodyAShare: number;
  coreBodyBShare: number;
  capEnabled: boolean;
  monthlyCap: number;
  excessHandling: "rollover" | "company" | "reserve";
}

const initialData: CoreBodyData = {
  coreBodyAShare: 8,
  coreBodyBShare: 4,
  capEnabled: true,
  monthlyCap: 50000,
  excessHandling: "rollover",
};

const historyData = [
  {
    id: "1",
    version: 2,
    effectiveFrom: "2025-11-01",
    effectiveTo: "—",
    status: "active" as const,
    changes: "Added cap enforcement and excess handling",
    changedBy: "Admin",
    changedAt: "2025-10-25 14:00",
    details: [
      { field: "Monthly Cap", oldValue: "Unlimited", newValue: "₹50,000" },
      { field: "Excess Handling", oldValue: "None", newValue: "Rollover" },
    ],
  },
  {
    id: "2",
    version: 1,
    effectiveFrom: "2025-06-01",
    effectiveTo: "2025-10-31",
    status: "archived" as const,
    changes: "Initial core body share rules",
    changedBy: "Admin",
    changedAt: "2025-05-20 09:00",
    details: [],
  },
];

// Current cap usage by district
const districtCapUsage = [
  { district: "North District", used: 42000, total: 50000, status: "near-cap" },
  { district: "South District", used: 15000, total: 50000, status: "healthy" },
  { district: "East District", used: 48000, total: 50000, status: "at-cap" },
  { district: "West District", used: 28000, total: 50000, status: "healthy" },
];

// Upgrade eligibility
const upgradeEligibility = [
  { criteria: "Monthly Volume > ₹10L", status: "eligible" },
  { criteria: "Active Users > 100", status: "eligible" },
  { criteria: "Success Rate > 95%", status: "pending" },
  { criteria: "No Cap Violations", status: "eligible" },
];

export default function CoreBodyShareRules() {
  const [data, setData] = useState<CoreBodyData>(initialData);
  const [originalData] = useState<CoreBodyData>(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (
    field: keyof CoreBodyData,
    value: number | boolean | string
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const getChanges = (): ChangePreview[] => {
    const changes: ChangePreview[] = [];
    
    if (data.coreBodyAShare !== originalData.coreBodyAShare) {
      changes.push({
        field: "Core Body A Share",
        oldValue: `${originalData.coreBodyAShare}%`,
        newValue: `${data.coreBodyAShare}%`,
      });
    }
    if (data.coreBodyBShare !== originalData.coreBodyBShare) {
      changes.push({
        field: "Core Body B Share",
        oldValue: `${originalData.coreBodyBShare}%`,
        newValue: `${data.coreBodyBShare}%`,
      });
    }
    if (data.monthlyCap !== originalData.monthlyCap) {
      changes.push({
        field: "Monthly Cap",
        oldValue: `₹${originalData.monthlyCap.toLocaleString()}`,
        newValue: `₹${data.monthlyCap.toLocaleString()}`,
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

  const totalShare = data.coreBodyAShare + data.coreBodyBShare;
  const totalUsed = districtCapUsage.reduce((sum, d) => sum + d.used, 0);
  const totalCap = districtCapUsage.length * data.monthlyCap;

  return (
    <CommissionLayout
      title="Core Body Share Rules"
      description="District-level earning control and allocation"
      status="active"
      lastUpdated={{ by: "Admin", time: "2025-10-25 14:00" }}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
      changes={getChanges()}
      historySection={
        <RuleHistoryTable history={historyData} title="" />
      }
    >
      {/* Split View: Rule + Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Side */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Core Body A Share
            </CardTitle>
            <CardDescription>District lead earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <PercentageCard
              label="Core Body A Share"
              value={data.coreBodyAShare}
              onChange={(v) => updateField("coreBodyAShare", v)}
              tooltip="Percentage for Core Body A (District Lead)"
              variant="company"
              max={20}
            />
          </CardContent>
        </Card>

        {/* Impact Side */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Impact Preview
            </CardTitle>
            <CardDescription>Estimated district earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Monthly Revenue Share</span>
                <span className="font-mono font-bold">₹8,00,000</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Core Body A (8%)</span>
                <span className="font-mono font-bold text-company">₹64,000</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Core Body B (4%)</span>
                <span className="font-mono font-bold text-admin">₹32,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Body B Share */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Core Body B Share
          </CardTitle>
          <CardDescription>Secondary district coordinator earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <PercentageCard
            label="Core Body B Share"
            value={data.coreBodyBShare}
            onChange={(v) => updateField("coreBodyBShare", v)}
            tooltip="Percentage for Core Body B (Secondary Coordinator)"
            variant="admin"
            max={15}
          />
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-profit/30 bg-profit/5">
            <span className="text-sm font-medium">Total Core Body Allocation</span>
            <span className="font-mono font-bold text-profit text-lg">{totalShare}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Cap Enforcement Logic */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Cap Enforcement Logic
          </CardTitle>
          <CardDescription>Control maximum earnings per district</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Monthly Cap</Label>
              <p className="text-sm text-muted-foreground">
                Limit maximum earnings per district per month
              </p>
            </div>
            <Switch
              checked={data.capEnabled}
              onCheckedChange={(checked) => updateField("capEnabled", checked)}
            />
          </div>
          
          {data.capEnabled && (
            <>
              <PercentageCard
                label="Monthly Cap Amount"
                value={data.monthlyCap}
                onChange={(v) => updateField("monthlyCap", v)}
                tooltip="Maximum earnings per district per month"
                variant="reserve"
                max={100000}
              />
              
              <Separator />
              
              {/* Cap Progress Visualization */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Cap Usage by District</Label>
                {districtCapUsage.map((district, idx) => {
                  const percentage = (district.used / district.total) * 100;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{district.district}</span>
                        <span className="font-mono">
                          ₹{district.used.toLocaleString()} / ₹{district.total.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`
                          h-2
                          ${district.status === "at-cap" ? "[&>div]:bg-destructive" : ""}
                          ${district.status === "near-cap" ? "[&>div]:bg-warning" : ""}
                          ${district.status === "healthy" ? "[&>div]:bg-profit" : ""}
                        `}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Excess Profit Handling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Excess Profit Handling</CardTitle>
          <CardDescription>What happens when earnings exceed cap</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: "rollover", label: "Rollover", desc: "Carry to next month" },
              { value: "company", label: "Company", desc: "Goes to company" },
              { value: "reserve", label: "Reserve", desc: "Goes to reserve fund" },
            ] as const).map((option) => (
              <button
                key={option.value}
                onClick={() => updateField("excessHandling", option.value)}
                className={`
                  p-4 rounded-lg border text-center transition-all
                  ${data.excessHandling === option.value
                    ? "border-profit bg-profit/10"
                    : "border-border hover:border-muted-foreground"}
                `}
              >
                <span className="font-medium block">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Stop Indicator */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Auto-Stop Indicator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted-foreground">Current Usage</span>
            <span className="font-mono">₹{totalUsed.toLocaleString()} / ₹{totalCap.toLocaleString()}</span>
          </div>
          <Progress 
            value={(totalUsed / totalCap) * 100} 
            className="h-3 mb-3 [&>div]:bg-warning"
          />
          <div className="flex items-center gap-2 text-warning text-xs">
            <AlertTriangle className="h-3 w-3" />
            <span>2 districts are near or at cap limit</span>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Eligibility Hint */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Upgrade Eligibility
          </CardTitle>
          <CardDescription>Criteria for district upgrade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upgradeEligibility.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <span className="text-sm">{item.criteria}</span>
                {item.status === "eligible" ? (
                  <CheckCircle2 className="h-4 w-4 text-profit" />
                ) : (
                  <Badge variant="outline" className="text-warning">
                    Pending
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}
