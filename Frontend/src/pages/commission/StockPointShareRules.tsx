import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CommissionLayout,
  PercentageCard,
  RuleHistoryTable,
  ChangePreview,
} from "@/components/commission";
import { 
  Info, 
  Package, 
  Clock, 
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Truck,
  BarChart3,
  Zap
} from "lucide-react";

interface StockPointData {
  stockPointPercentage: number;
  slaEnabled: boolean;
  slaHours: number;
  minInventoryRequired: boolean;
  minInventoryValue: number;
  performanceBased: boolean;
  performanceTiers: {
    gold: { threshold: number; bonus: number };
    silver: { threshold: number; bonus: number };
    bronze: { threshold: number; bonus: number };
  };
}

const initialData: StockPointData = {
  stockPointPercentage: 12,
  slaEnabled: true,
  slaHours: 24,
  minInventoryRequired: true,
  minInventoryValue: 50000,
  performanceBased: true,
  performanceTiers: {
    gold: { threshold: 100, bonus: 2 },
    silver: { threshold: 75, bonus: 1 },
    bronze: { threshold: 50, bonus: 0.5 },
  },
};

const historyData = [
  {
    id: "1",
    version: 2,
    effectiveFrom: "2025-12-01",
    effectiveTo: "—",
    status: "active" as const,
    changes: "Added performance tiers and SLA requirements",
    changedBy: "Admin",
    changedAt: "2025-11-20 11:30",
    details: [
      { field: "Performance Tiers", oldValue: "None", newValue: "Gold/Silver/Bronze" },
      { field: "SLA Hours", oldValue: "48h", newValue: "24h" },
    ],
  },
  {
    id: "2",
    version: 1,
    effectiveFrom: "2025-08-01",
    effectiveTo: "2025-11-30",
    status: "archived" as const,
    changes: "Initial stock point share rules",
    changedBy: "Admin",
    changedAt: "2025-07-25 09:00",
    details: [],
  },
];

// Stock point performance data
const stockPointPerformance = [
  { name: "North Hub", orders: 450, onTime: 98, inventory: 85 },
  { name: "South Hub", orders: 380, onTime: 92, inventory: 70 },
  { name: "East Hub", orders: 290, onTime: 88, inventory: 65 },
  { name: "West Hub", orders: 520, onTime: 95, inventory: 90 },
];

export default function StockPointShareRules() {
  const [data, setData] = useState<StockPointData>(initialData);
  const [originalData] = useState<StockPointData>(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (
    field: keyof StockPointData | `performanceTiers.${keyof StockPointData["performanceTiers"]}.${"threshold" | "bonus"}`,
    value: number | boolean
  ) => {
    setData((prev) => {
      if (field.includes(".")) {
        const [parent, child, grandchild] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof StockPointData] as any),
            [child]: {
              ...(prev[parent as keyof StockPointData] as any)[child as keyof typeof prev.performanceTiers],
              [grandchild]: value,
            },
          },
        };
      }
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  };

  const getChanges = (): ChangePreview[] => {
    const changes: ChangePreview[] = [];
    
    if (data.stockPointPercentage !== originalData.stockPointPercentage) {
      changes.push({
        field: "Stock Point Percentage",
        oldValue: `${originalData.stockPointPercentage}%`,
        newValue: `${data.stockPointPercentage}%`,
      });
    }
    if (data.slaHours !== originalData.slaHours) {
      changes.push({
        field: "SLA Hours",
        oldValue: `${originalData.slaHours}h`,
        newValue: `${data.slaHours}h`,
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

  return (
    <CommissionLayout
      title="Stock Point Share Rules"
      description="Incentivize and control fulfillment layer earnings"
      status="active"
      lastUpdated={{ by: "Admin", time: "2025-11-20 11:30" }}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
      changes={getChanges()}
      historySection={
        <RuleHistoryTable history={historyData} title="" />
      }
    >
      {/* Stock Point Overview */}
      <Card className="border-reserve/30 bg-reserve/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-reserve" />
            Stock Point Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Active Stock Points</span>
              <p className="font-mono font-bold text-lg">24</p>
            </div>
            <div>
              <span className="text-muted-foreground">Base Commission</span>
              <p className="font-mono font-bold text-lg">{data.stockPointPercentage}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Avg. On-Time %</span>
              <p className="font-mono font-bold text-lg text-profit">93%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p className="font-bold text-profit flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> Growing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Point Percentage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Point Percentage
          </CardTitle>
          <CardDescription>
            Base commission for stock point fulfillment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PercentageCard
            label="Stock Point Commission"
            value={data.stockPointPercentage}
            onChange={(v) => updateField("stockPointPercentage", v)}
            tooltip="Base percentage for stock point fulfillment"
            variant="reserve"
            max={30}
          />
        </CardContent>
      </Card>

      {/* SLA Dependency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Dependency
          </CardTitle>
          <CardDescription>
            Service level agreement requirements for commission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable SLA Requirements</Label>
              <p className="text-sm text-muted-foreground">
                Commission depends on meeting delivery timeframes
              </p>
            </div>
            <Switch
              checked={data.slaEnabled}
              onCheckedChange={(checked) => updateField("slaEnabled", checked)}
            />
          </div>
          
          {data.slaEnabled && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Delivery SLA (Hours)</Label>
              <div className="flex gap-3">
                {[12, 24, 48, 72].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => updateField("slaHours", hours)}
                    className={`
                      flex-1 p-3 rounded-lg border text-center transition-all
                      ${data.slaHours === hours
                        ? "border-reserve bg-reserve/10"
                        : "border-border hover:border-muted-foreground"}
                    `}
                  >
                    <span className="font-mono font-bold">{hours}h</span>
                  </button>
                ))}
              </div>
              
              {/* SLA Warning Badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>Stock points missing SLA will have commission reduced by 50%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Minimum Inventory Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Minimum Inventory Condition
          </CardTitle>
          <CardDescription>
            Stock point must maintain minimum inventory value
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <Label className="text-base font-medium">Require Minimum Inventory</Label>
              <p className="text-sm text-muted-foreground">
                Stock points must maintain minimum inventory value to qualify
              </p>
            </div>
            <Switch
              checked={data.minInventoryRequired}
              onCheckedChange={(checked) => updateField("minInventoryRequired", checked)}
            />
          </div>
          
          {data.minInventoryRequired && (
            <PercentageCard
              label="Minimum Inventory Value"
              value={data.minInventoryValue}
              onChange={(v) => updateField("minInventoryValue", v)}
              tooltip="Minimum inventory value required to qualify for full commission"
              variant="default"
              max={200000}
            />
          )}
        </CardContent>
      </Card>

      {/* Performance-Based Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance-Based Tiers
          </CardTitle>
          <CardDescription>
            Bonus commission based on performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Performance Tiers</Label>
              <p className="text-sm text-muted-foreground">
                Additional bonus for high-performing stock points
              </p>
            </div>
            <Switch
              checked={data.performanceBased}
              onCheckedChange={(checked) => updateField("performanceBased", checked)}
            />
          </div>
          
          {data.performanceBased && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gold Tier */}
              <div className="p-4 rounded-lg border-2 border-yellow-500/30 bg-yellow-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="font-semibold">Gold</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min. On-Time %</Label>
                    <div className="font-mono font-bold text-lg">{data.performanceTiers.gold.threshold}%</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bonus</Label>
                    <div className="font-mono font-bold text-profit">+{data.performanceTiers.gold.bonus}%</div>
                  </div>
                </div>
              </div>
              
              {/* Silver Tier */}
              <div className="p-4 rounded-lg border-2 border-gray-400/30 bg-gray-400/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="font-semibold">Silver</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min. On-Time %</Label>
                    <div className="font-mono font-bold text-lg">{data.performanceTiers.silver.threshold}%</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bonus</Label>
                    <div className="font-mono font-bold text-profit">+{data.performanceTiers.silver.bonus}%</div>
                  </div>
                </div>
              </div>
              
              {/* Bronze Tier */}
              <div className="p-4 rounded-lg border-2 border-orange-500/30 bg-orange-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="font-semibold">Bronze</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min. On-Time %</Label>
                    <div className="font-mono font-bold text-lg">{data.performanceTiers.bronze.threshold}%</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bonus</Label>
                    <div className="font-mono font-bold text-profit">+{data.performanceTiers.bronze.bonus}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Color Shift */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Current Stock Point Performance
          </CardTitle>
          <CardDescription>Live performance metrics by hub</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stockPointPerformance.map((sp, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{sp.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Orders:</span>
                    <span className="font-mono">{sp.orders}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`
                      h-4 w-4 
                      ${sp.onTime >= 95 ? "text-profit" : ""}
                      ${sp.onTime >= 85 && sp.onTime < 95 ? "text-warning" : ""}
                      ${sp.onTime < 85 ? "text-destructive" : ""}
                    `} />
                    <span className="font-mono">{sp.onTime}%</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`
                      ${sp.onTime >= 95 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : ""}
                      ${sp.onTime >= 85 && sp.onTime < 95 ? "bg-gray-500/10 text-gray-500 border-gray-500/20" : ""}
                      ${sp.onTime < 85 ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : ""}
                    `}
                  >
                    {sp.onTime >= 95 ? "Gold" : sp.onTime >= 85 ? "Silver" : "Bronze"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Removal Condition Preview */}
      <Card className="border-warning/30">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Stock Point Removal Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 rounded">
              <span className="text-muted-foreground">连续 3 months below 50% SLA</span>
              <Badge variant="destructive">Auto-Remove</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded">
              <span className="text-muted-foreground">Inventory value below ₹25,000</span>
              <Badge variant="destructive">Warning</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded">
              <span className="text-muted-foreground">Fraudulent activity detected</span>
              <Badge variant="destructive">Immediate</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}
