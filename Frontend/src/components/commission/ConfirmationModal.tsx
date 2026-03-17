import React from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChangePreview {
  field: string;
  oldValue: string | number;
  newValue: string | number;
}

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  changes?: ChangePreview[];
  reason?: string;
  onReasonChange?: (reason: string) => void;
  confirmLabel?: string;
  isLoading?: boolean;
  type?: "save" | "activate" | "deactivate" | "archive";
}

const typeConfig = {
  save: {
    title: "Confirm Save",
    description: "Please review the changes and provide a reason for this update.",
    icon: ShieldCheck,
    iconColor: "text-profit",
  },
  activate: {
    title: "Activate Rule",
    description: "This will activate the rule for all new transactions.",
    icon: ShieldCheck,
    iconColor: "text-profit",
  },
  deactivate: {
    title: "Deactivate Rule",
    description: "This will deactivate the rule. Existing transactions will not be affected.",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  archive: {
    title: "Archive Rule",
    description: "This will archive the rule. You can restore it later if needed.",
    icon: AlertTriangle,
    iconColor: "text-muted-foreground",
  },
};

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  changes = [],
  reason = "",
  onReasonChange,
  confirmLabel = "Confirm",
  isLoading = false,
  type = "save",
}: ConfirmationModalProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-muted", config.iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
            <AlertDialogTitle>{title || config.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="ml-13">
            {description || config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {changes.length > 0 && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Changes Preview</p>
            {changes.map((change, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{change.field}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-muted-foreground line-through">{change.oldValue}</span>
                  <span className="text-profit">→</span>
                  <span className="text-card-foreground font-semibold">{change.newValue}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium">
            Reason for change <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Enter reason for this change..."
            value={reason}
            onChange={(e) => onReasonChange?.(e.target.value)}
            className="min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground">
            This reason will be recorded in the audit log
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={!reason.trim() || isLoading}
            className={cn(
              type === "deactivate" && "bg-warning hover:bg-warning/90",
              type === "archive" && "bg-muted hover:bg-muted/80"
            )}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
