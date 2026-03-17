import { ReactNode, useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type InventoryHealth = "Healthy" | "Low" | "Critical";
export type MinimumComplianceStatus = "OK" | "Below Minimum" | "Breach (SLA risk)";

export type InventoryProduct = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minimumRequired: number;
  lastUpdated: string;
};

export type InventoryLedgerEntry = {
  dateTime: string;
  product: string;
  type: "In" | "Out";
  quantity: number;
  reference: string;
  performedBy: string;
  balanceAfter: number;
};

export const inventoryProducts: InventoryProduct[] = [
  { id: "SKU-1001", name: "Premium Wheat Seed", category: "Seeds", currentStock: 180, minimumRequired: 90, lastUpdated: "2026-02-22 09:14" },
  { id: "SKU-1002", name: "Nitro Boost Fertilizer", category: "Fertilizer", currentStock: 28, minimumRequired: 40, lastUpdated: "2026-02-22 08:58" },
  { id: "SKU-1003", name: "Shield Pro Pesticide", category: "Pesticide", currentStock: 0, minimumRequired: 25, lastUpdated: "2026-02-22 08:05" },
  { id: "SKU-1004", name: "Smart Drip Kit", category: "Equipment", currentStock: 46, minimumRequired: 20, lastUpdated: "2026-02-22 09:26" },
  { id: "SKU-1005", name: "Hybrid Corn Seed", category: "Seeds", currentStock: 62, minimumRequired: 50, lastUpdated: "2026-02-21 18:44" },
  { id: "SKU-1006", name: "Bio Soil Conditioner", category: "Fertilizer", currentStock: 15, minimumRequired: 30, lastUpdated: "2026-02-22 07:49" },
  { id: "SKU-1007", name: "Micro Nutrient Pack", category: "Supplements", currentStock: 34, minimumRequired: 30, lastUpdated: "2026-02-22 07:20" },
  { id: "SKU-1008", name: "Crop Care Spray", category: "Pesticide", currentStock: 10, minimumRequired: 28, lastUpdated: "2026-02-22 06:56" },
];

export const inventoryLedger: InventoryLedgerEntry[] = [
  { dateTime: "2026-02-22 09:14", product: "Premium Wheat Seed", type: "In", quantity: 90, reference: "IN-2202-941", performedBy: "Ramesh K.", balanceAfter: 180 },
  { dateTime: "2026-02-22 08:58", product: "Nitro Boost Fertilizer", type: "Out", quantity: 12, reference: "OUT-2202-377", performedBy: "Ramesh K.", balanceAfter: 28 },
  { dateTime: "2026-02-22 08:05", product: "Shield Pro Pesticide", type: "Out", quantity: 8, reference: "OUT-2202-372", performedBy: "Ramesh K.", balanceAfter: 0 },
  { dateTime: "2026-02-22 07:49", product: "Bio Soil Conditioner", type: "Out", quantity: 5, reference: "OUT-2202-365", performedBy: "Ramesh K.", balanceAfter: 15 },
  { dateTime: "2026-02-21 18:44", product: "Hybrid Corn Seed", type: "In", quantity: 22, reference: "IN-2102-822", performedBy: "Ramesh K.", balanceAfter: 62 },
  { dateTime: "2026-02-21 17:10", product: "Crop Care Spray", type: "Out", quantity: 4, reference: "OUT-2102-341", performedBy: "Ramesh K.", balanceAfter: 10 },
  { dateTime: "2026-02-21 15:30", product: "Micro Nutrient Pack", type: "In", quantity: 6, reference: "IN-2102-810", performedBy: "Ramesh K.", balanceAfter: 34 },
  { dateTime: "2026-02-21 14:02", product: "Smart Drip Kit", type: "Out", quantity: 3, reference: "OUT-2102-301", performedBy: "Ramesh K.", balanceAfter: 46 },
  { dateTime: "2026-02-21 12:18", product: "Nitro Boost Fertilizer", type: "In", quantity: 20, reference: "IN-2102-751", performedBy: "Ramesh K.", balanceAfter: 40 },
  { dateTime: "2026-02-21 11:05", product: "Premium Wheat Seed", type: "Out", quantity: 24, reference: "OUT-2102-280", performedBy: "Ramesh K.", balanceAfter: 90 },
  { dateTime: "2026-02-20 18:33", product: "Smart Drip Kit", type: "In", quantity: 10, reference: "IN-2002-699", performedBy: "Ramesh K.", balanceAfter: 49 },
  { dateTime: "2026-02-20 16:51", product: "Shield Pro Pesticide", type: "Out", quantity: 7, reference: "OUT-2002-199", performedBy: "Ramesh K.", balanceAfter: 8 },
  { dateTime: "2026-02-20 13:26", product: "Bio Soil Conditioner", type: "In", quantity: 12, reference: "IN-2002-670", performedBy: "Ramesh K.", balanceAfter: 20 },
  { dateTime: "2026-02-20 11:10", product: "Hybrid Corn Seed", type: "Out", quantity: 8, reference: "OUT-2002-176", performedBy: "Ramesh K.", balanceAfter: 40 },
  { dateTime: "2026-02-20 09:35", product: "Premium Wheat Seed", type: "In", quantity: 40, reference: "IN-2002-640", performedBy: "Ramesh K.", balanceAfter: 114 },
];

export const hasSlaBreach = inventoryProducts.some((item) => getMinimumComplianceStatus(item.currentStock, item.minimumRequired) === "Breach (SLA risk)");

export const formatInventoryNumber = (value: number) => new Intl.NumberFormat("en-IN").format(value);

export function getInventoryHealth(currentStock: number, minimumRequired: number): InventoryHealth {
  if (currentStock <= 0) return "Critical";
  if (currentStock < minimumRequired) return "Low";
  return "Healthy";
}

export function getMinimumComplianceStatus(currentStock: number, minimumRequired: number): MinimumComplianceStatus {
  if (currentStock >= minimumRequired) return "OK";
  if (currentStock <= Math.floor(minimumRequired * 0.4)) return "Breach (SLA risk)";
  return "Below Minimum";
}

export function InventoryHealthBadge({ status }: { status: InventoryHealth }) {
  const classes: Record<InventoryHealth, string> = {
    Healthy: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
    Low: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    Critical: "border-red-500/40 bg-red-500/10 text-red-500",
  };

  return <Badge variant="outline" className={classes[status]}>{status}</Badge>;
}

export function MinimumStockBadge({ status }: { status: MinimumComplianceStatus }) {
  const classes: Record<MinimumComplianceStatus, string> = {
    OK: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
    "Below Minimum": "border-amber-500/40 bg-amber-500/10 text-amber-500",
    "Breach (SLA risk)": "border-red-500/40 bg-red-500/10 text-red-500",
  };

  return <Badge variant="outline" className={classes[status]}>{status}</Badge>;
}

export function MovementTypeBadge({ type }: { type: "In" | "Out" }) {
  return (
    <Badge variant="outline" className={type === "In" ? "border-emerald-500/40 text-emerald-500" : "border-red-500/40 text-red-500"}>
      {type}
    </Badge>
  );
}

export function SlaWarningBadge() {
  return (
    <Badge className="bg-amber-500 text-black hover:bg-amber-500">
      SLA Warning
    </Badge>
  );
}

export function InventoryTableCard({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function InventorySlaBanner() {
  if (!hasSlaBreach) return null;

  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-amber-500">SLA risk detected in minimum stock compliance</p>
        <p className="text-xs text-muted-foreground">Breach-level stock shortages are highlighted across inventory views until restock is completed.</p>
      </div>
    </div>
  );
}

export function InventoryConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm}>{confirmLabel}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function InventoryProductCombobox({
  value,
  onValueChange,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const label = useMemo(
    () => inventoryProducts.find((item) => item.name === value)?.name ?? "Select product",
    [value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search product..." />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {inventoryProducts.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.id} ${item.name} ${item.category}`}
                  onSelect={() => {
                    onValueChange(item.name);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{item.name}</span>
                  <Check className={cn("h-4 w-4", value === item.name ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

