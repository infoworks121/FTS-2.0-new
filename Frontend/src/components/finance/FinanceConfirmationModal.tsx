import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, XCircle, Shield, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type ActionType = "approve" | "reject" | "process";

interface FinanceConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: ActionType;
  title?: string;
  description?: string;
  items?: {
    label: string;
    value: string | number;
    type?: "text" | "amount" | "date" | "status";
  }[];
  totalAmount?: number;
  onConfirm: (remarks?: string) => void;
  isProcessing?: boolean;
  warningText?: string;
}

const actionConfig = {
  approve: {
    title: "Confirm Approval",
    icon: CheckCircle,
    iconClass: "text-green-500",
    buttonText: "Approve",
    buttonVariant: "default" as const,
    buttonClass: "bg-green-600 hover:bg-green-700",
    description: "You are about to approve the following transaction(s). This action will initiate the payout process.",
  },
  reject: {
    title: "Confirm Rejection",
    icon: XCircle,
    iconClass: "text-red-500",
    buttonText: "Reject",
    buttonVariant: "destructive" as const,
    buttonClass: "bg-red-600 hover:bg-red-700",
    description: "You are about to reject the following transaction(s). This action cannot be undone without authorization.",
  },
  process: {
    title: "Process Transaction",
    icon: Clock,
    iconClass: "text-blue-500",
    buttonText: "Process",
    buttonVariant: "default" as const,
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    description: "You are about to process the following transaction(s). Please verify all details before proceeding.",
  },
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function FinanceConfirmationModal({
  open,
  onOpenChange,
  actionType,
  title,
  description,
  items = [],
  totalAmount,
  onConfirm,
  isProcessing = false,
  warningText,
}: FinanceConfirmationModalProps) {
  const [remarks, setRemarks] = useState("");
  const config = actionConfig[actionType];
  const ActionIcon = config.icon;

  const handleConfirm = () => {
    onConfirm(remarks);
    if (!isProcessing) {
      setRemarks("");
    }
  };

  const handleCancel = () => {
    setRemarks("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <ActionIcon className={cn("w-6 h-6", config.iconClass)} />
            {title || config.title}
          </DialogTitle>
          <DialogDescription>
            {description || config.description}
          </DialogDescription>
        </DialogHeader>

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-3 py-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
                <span className={cn(
                  "text-sm font-semibold",
                  item.type === "amount" 
                    ? "text-gray-900 dark:text-gray-100" 
                    : "text-gray-900 dark:text-gray-100"
                )}>
                  {item.type === "amount" 
                    ? `₹${formatAmount(item.value as number)}` 
                    : item.value}
                </span>
              </div>
            ))}

            {/* Total Amount */}
            {totalAmount !== undefined && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  ₹{formatAmount(totalAmount)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Remarks Input (for reject) */}
        {actionType === "reject" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Enter reason for rejection (required)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        )}

        {/* Warning Notice */}
        {warningText && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              {warningText}
            </p>
          </div>
        )}

        {/* Audit Notice */}
        <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">Audit Trail</p>
            <p>This action will be permanently logged with timestamp, admin ID, and IP address for compliance and audit purposes.</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            className={config.buttonClass}
            onClick={handleConfirm}
            disabled={isProcessing || (actionType === "reject" && !remarks)}
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ActionIcon className="w-4 h-4 mr-2" />
                {config.buttonText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
