import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RuleStatusBadge } from "./RuleStatusBadge";
import { ConfirmationModal, ChangePreview } from "./ConfirmationModal";
import { 
  Save, 
  RotateCcw, 
  History, 
  AlertTriangle, 
  Info,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface CommissionLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  status?: "active" | "scheduled" | "archived";
  scheduledDate?: string;
  lastUpdated?: {
    by: string;
    time: string;
  };
  onSave: () => void;
  onReset?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
  changes?: ChangePreview[];
  effectiveFrom?: string;
  onEffectiveFromChange?: (date: string) => void;
  showHistory?: boolean;
  historySection?: React.ReactNode;
}

export function CommissionLayout({
  children,
  title,
  description,
  status = "active",
  scheduledDate,
  lastUpdated,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
  changes = [],
  effectiveFrom,
  onEffectiveFromChange,
  showHistory = true,
  historySection,
}: CommissionLayoutProps) {
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [saveReason, setSaveReason] = useState("");
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const handleSave = () => {
    if (saveReason.trim()) {
      onSave();
      setShowConfirmSave(false);
      setSaveReason("");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-card-foreground">{title}</h1>
            <RuleStatusBadge status={status} scheduledDate={scheduledDate} />
          </div>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-2">
              Last updated by <span className="font-medium text-card-foreground">{lastUpdated.by}</span> on{" "}
              <span className="font-medium text-card-foreground">{lastUpdated.time}</span>
            </p>
          )}
        </div>
        
        {effectiveFrom && onEffectiveFromChange && status !== "active" && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm text-muted-foreground">Effective From:</label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => onEffectiveFromChange(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-card-foreground"
            />
          </div>
        )}
      </div>

      {/* Warning Banner for Active Rules */}
      {status === "active" && hasChanges && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-warning/30 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
          <p className="text-sm text-warning">
            You have unsaved changes. Current active rule will continue until new rule is activated.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editable Content */}
        <div className="lg:col-span-2 space-y-6">
          {children}
        </div>
        
        {/* Sidebar - Summary & Info */}
        <div className="space-y-6">
          {/* Change Summary Card */}
          {changes.length > 0 && (
            <Card className="border-warning/30 bg-warning/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Changes Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {changes.map((change, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{change.field}</span>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <span className="text-muted-foreground line-through">{change.oldValue}</span>
                      <span className="text-warning">→</span>
                      <span className="text-card-foreground font-semibold">{change.newValue}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Configuration Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Applies to</span>
                <Badge variant="outline">New Transactions Only</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rule Type</span>
                <span className="text-card-foreground">Percentage-Based</span>
              </div>
            </CardContent>
          </Card>
          
          {/* History Toggle */}
          {showHistory && historySection && (
            <Card>
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-transparent"
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              >
                <span className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span className="text-sm font-medium">Rule History</span>
                </span>
                {showHistoryPanel ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {showHistoryPanel && (
                <CardContent className="pt-0">
                  {historySection}
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                You have unsaved changes
              </span>
            ) : (
              "No unsaved changes"
            )}
          </div>
          <div className="flex items-center gap-3">
            {onReset && (
              <Button
                variant="outline"
                onClick={onReset}
                disabled={!hasChanges || isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              onClick={() => setShowConfirmSave(true)}
              disabled={!hasChanges || isSaving}
              className="bg-profit hover:bg-profit/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmSave}
        onOpenChange={setShowConfirmSave}
        onConfirm={handleSave}
        title="Confirm Save"
        description="Please review the changes and provide a reason for this update."
        changes={changes}
        reason={saveReason}
        onReasonChange={setSaveReason}
        confirmLabel="Save Changes"
        isLoading={isSaving}
        type="save"
      />
    </div>
  );
}
