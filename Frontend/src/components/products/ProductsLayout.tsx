import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  RotateCcw, 
  History, 
  AlertTriangle, 
  Info,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  subtitle?: string;
  status?: "active" | "inactive" | "draft" | "scheduled";
  scheduledDate?: string;
  lastUpdated?: {
    by: string;
    time: string;
  };
  onSave: () => void;
  onReset?: () => void;
  onBack?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
  showViewToggle?: boolean;
  viewMode?: "table" | "card";
  onViewModeChange?: (mode: "table" | "card") => void;
  showHistory?: boolean;
  historySection?: React.ReactNode;
  breadcrumbs?: { label: string; url?: string }[];
}

const statusConfig = {
  active: { color: "bg-green-500", label: "Active", icon: CheckCircle },
  inactive: { color: "bg-red-500", label: "Inactive", icon: XCircle },
  draft: { color: "bg-yellow-500", label: "Draft", icon: Clock },
  scheduled: { color: "bg-blue-500", label: "Scheduled", icon: Calendar },
};

export function ProductsLayout({
  children,
  title,
  description,
  subtitle,
  status = "active",
  scheduledDate,
  lastUpdated,
  onSave,
  onReset,
  onBack,
  isSaving = false,
  hasChanges = false,
  showViewToggle = false,
  viewMode = "table",
  onViewModeChange,
  showHistory = false,
  historySection,
  breadcrumbs,
}: ProductsLayoutProps) {
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const navigate = useNavigate();
  
  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  const renderBreadcrumbs = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;
    
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span>/</span>}
            {crumb.url ? (
              <button
                type="button"
                onClick={() => navigate(crumb.url)}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span>{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          {renderBreadcrumbs()}
          
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-3 -ml-2 h-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-card-foreground">{title}</h1>
            {subtitle && (
              <Badge variant="outline" className="text-sm font-normal">
                {subtitle}
              </Badge>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border">
              <StatusIcon className={cn("h-3.5 w-3.5", currentStatus.color)} />
              <span className="text-xs font-medium">{currentStatus.label}</span>
            </div>
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
        
        <div className="flex items-center gap-3">
          {showViewToggle && onViewModeChange && (
            <Tabs
              value={viewMode}
              onValueChange={(v) => onViewModeChange(v as "table" | "card")}
              className="h-9"
            >
              <TabsList className="h-full">
                <TabsTrigger value="table" className="px-3">Table</TabsTrigger>
                <TabsTrigger value="card" className="px-3">Cards</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          {scheduledDate && status === "scheduled" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Effective: {scheduledDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Warning Banner for Changes */}
      {hasChanges && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            You have unsaved changes. Please save before leaving this page.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {children}
        </div>
        
        <div className="space-y-6">
          {hasChanges && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Unsaved Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>You have made changes that have not been saved yet. These changes will not be applied until you save.</p>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Applies to</span>
                <Badge variant="outline">New Orders Only</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Module</span>
                <span className="text-card-foreground">Products & Categories</span>
              </div>
            </CardContent>
          </Card>
          
          {showHistory && historySection && (
            <Card>
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-transparent rounded-none border-b"
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              >
                <span className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span className="text-sm font-medium">History</span>
                </span>
                {showHistoryPanel ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {showHistoryPanel && (
                <CardContent className="pt-4">
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
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
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
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
