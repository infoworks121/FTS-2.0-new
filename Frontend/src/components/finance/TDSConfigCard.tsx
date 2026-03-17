import React from "react";
import { cn } from "@/lib/utils";
import { FileText, Calendar, AlertTriangle, Clock, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TDSConfigCardProps {
  id: string;
  percentage: number;
  applicableWallets: string[];
  thresholdAmount: number;
  effectiveFrom: string;
  status: "active" | "scheduled" | "expired";
  version: number;
  createdBy?: string;
  createdAt?: string;
  onEdit?: () => void;
  onViewHistory?: () => void;
}

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  expired: {
    label: "Expired",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
};

export default function TDSConfigCard({
  id,
  percentage,
  applicableWallets,
  thresholdAmount,
  effectiveFrom,
  status,
  version,
  createdBy,
  createdAt,
  onEdit,
  onViewHistory,
}: TDSConfigCardProps) {
  const statusData = statusConfig[status];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                TDS Rule v{version}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rule ID: {id}
              </p>
            </div>
          </div>
          <Badge className={statusData.className}>{statusData.label}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* TDS Percentage */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            TDS Percentage
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {percentage}%
          </span>
        </div>

        {/* Threshold Amount */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Threshold Amount
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ₹{formatAmount(thresholdAmount)}
          </span>
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
          {createdBy && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              By: {createdBy}
            </div>
          )}
        </div>

        {/* Legal Notice */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            TDS rules are governed by income tax regulations. Changes may have 
            legal implications. Consult tax professionals before modification.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {onEdit && status !== "expired" && (
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
