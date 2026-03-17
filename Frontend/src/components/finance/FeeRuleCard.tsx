import React from "react";
import { cn } from "@/lib/utils";
import { DollarSign, Calendar, AlertTriangle, Clock, Shield, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface FeeRuleCardProps {
  id: string;
  feeType: "flat" | "percentage";
  feeValue: number;
  applicableWallets: string[];
  minimumFee?: number;
  maximumFee?: number;
  effectiveFrom: string;
  status: "active" | "disabled" | "scheduled";
  version: number;
  onToggle?: (enabled: boolean) => void;
  onEdit?: () => void;
  onViewHistory?: () => void;
}

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  disabled: {
    label: "Disabled",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

export default function FeeRuleCard({
  id,
  feeType,
  feeValue,
  applicableWallets,
  minimumFee,
  maximumFee,
  effectiveFrom,
  status,
  version,
  onToggle,
  onEdit,
  onViewHistory,
}: FeeRuleCardProps) {
  const statusData = statusConfig[status];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate preview
  const previewAmount = 10000;
  const calculatedFee = feeType === "flat" 
    ? feeValue 
    : (previewAmount * feeValue) / 100;
  
  const finalFee = Math.max(
    minimumFee || 0,
    Math.min(maximumFee || Infinity, calculatedFee)
  );

  return (
    <Card className={cn(
      "border-gray-200 dark:border-gray-700",
      status === "disabled" && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              feeType === "flat" 
                ? "bg-blue-100 dark:bg-blue-900/30" 
                : "bg-purple-100 dark:bg-purple-900/30"
            )}>
              <DollarSign className={cn(
                "w-5 h-5",
                feeType === "flat" 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-purple-600 dark:text-purple-400"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {feeType === "flat" ? "Flat Fee" : "Percentage Fee"} v{version}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rule ID: {id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onToggle && (
              <Switch
                checked={status === "active"}
                onCheckedChange={onToggle}
                disabled={status === "scheduled"}
              />
            )}
            <Badge className={statusData.className}>{statusData.label}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Fee Value */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {feeType === "flat" ? "Fixed Amount" : "Fee Percentage"}
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {feeType === "flat" ? `₹${formatAmount(feeValue)}` : `${feeValue}%`}
          </span>
        </div>

        {/* Min/Max Fees */}
        {(minimumFee !== undefined || maximumFee !== undefined) && (
          <div className="grid grid-cols-2 gap-3">
            {minimumFee !== undefined && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Minimum Fee
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  ₹{formatAmount(minimumFee)}
                </p>
              </div>
            )}
            {maximumFee !== undefined && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Maximum Fee
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  ₹{formatAmount(maximumFee)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Live Preview */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Live Preview (₹10,000 withdrawal)
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Calculated Fee:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              ₹{formatAmount(finalFee)}
            </span>
          </div>
        </div>

        {/* Applicable Wallets */}
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Applicable Wallets
          </p>
          <div className="flex flex-wrap gap-2">
            {applicableWallets.map((wallet) => (
              <Badge key={wallet} variant="outline">
                {wallet}
              </Badge>
            ))}
          </div>
        </div>

        {/* Effective From */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            Effective from: {effectiveFrom}
          </div>
        </div>

        {/* Legal Notice */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            Processing fees must comply with payment gateway regulations. 
            Unauthorized fee changes may result in regulatory action.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit Rule
            </Button>
          )}
          {onViewHistory && (
            <Button variant="ghost" size="sm" onClick={onViewHistory}>
              <Clock className="w-4 h-4 mr-2" />
              View History
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
