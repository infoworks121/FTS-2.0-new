import { useState } from "react";
import { AlertTriangle, Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger" | "warning";
  requireDoubleConfirm?: boolean;
  sensitiveAction?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  inputPlaceholder?: string;
}

export function UserConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  requireDoubleConfirm = false,
  sensitiveAction = false,
  inputValue,
  onInputChange,
  inputPlaceholder,
}: ConfirmationModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (requireDoubleConfirm && !isConfirmed) {
      setIsConfirmed(true);
      return;
    }
    
    setIsLoading(true);
    try {
      await onConfirm();
      setIsConfirmed(false);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  const variantStyles = {
    default: {
      icon: Shield,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      confirmBtn: "bg-primary hover:bg-primary/90",
    },
    danger: {
      icon: AlertTriangle,
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
      confirmBtn: "bg-destructive hover:bg-destructive/90",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      confirmBtn: "bg-warning hover:bg-warning/90",
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("rounded-full p-2", style.iconBg)}>
              <Icon className={cn("h-5 w-5", style.iconColor)} />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {sensitiveAction && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-xs text-destructive font-medium">
              ⚠️ This is a sensitive action that cannot be undone. Please proceed with caution.
            </p>
          </div>
        )}

        {requireDoubleConfirm && !isConfirmed && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              For your security, please type <span className="font-mono font-semibold text-foreground">CONFIRM</span> to proceed.
            </p>
            <input
              type="text"
              value={inputValue || ""}
              onChange={(e) => onInputChange?.(e.target.value)}
              placeholder={inputPlaceholder || "Type CONFIRM"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}

        {requireDoubleConfirm && isConfirmed && (
          <div className="rounded-lg border border-profit/20 bg-profit/5 p-3">
            <p className="text-xs text-profit font-medium">
              ✓ You have confirmed this action. Click "{confirmLabel}" to proceed.
            </p>
          </div>
        )}

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              (requireDoubleConfirm && (inputValue?.toUpperCase() !== "CONFIRM" || !isConfirmed)) ||
              isLoading
            }
            className={cn("w-full sm:w-auto text-white", style.confirmBtn)}
          >
            {isLoading ? (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {requireDoubleConfirm && !isConfirmed ? "First Confirmation" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Quick confirm for simple actions
export function useSafeAction() {
  const [pendingAction, setPendingAction] = useState<{
    title: string;
    description: string;
    action: () => Promise<void>;
    variant?: "default" | "danger" | "warning";
    sensitive?: boolean;
  } | null>(null);

  const confirmAction = (
    title: string,
    description: string,
    action: () => Promise<void>,
    variant: "default" | "danger" | "warning" = "default",
    sensitive = false
  ) => {
    setPendingAction({ title, description, action, variant, sensitive });
  };

  const clearAction = () => setPendingAction(null);

  return {
    pendingAction,
    confirmAction,
    clearAction,
  };
}
