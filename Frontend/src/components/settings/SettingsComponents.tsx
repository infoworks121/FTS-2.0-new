import React from "react";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SettingsCard({
  title,
  description,
  icon,
  children,
  className,
}: SettingsCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">{children}</div>
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  tooltip?: string;
}

export function SettingsRow({
  label,
  description,
  children,
  tooltip,
}: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          {tooltip && (
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground cursor-help"
              title={tooltip}
            >
              ?
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

interface SettingsDividerProps {
  className?: string;
}

export function SettingsDivider({ className }: SettingsDividerProps) {
  return (
    <div
      className={cn("h-px bg-border my-2", className)}
      role="separator"
    />
  );
}

interface SettingsFooterProps {
  onSave: () => void;
  onReset?: () => void;
  saveLabel?: string;
  resetLabel?: string;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function SettingsFooter({
  onSave,
  onReset,
  saveLabel = "Save Changes",
  resetLabel = "Reset",
  isSaving = false,
  hasChanges = false,
}: SettingsFooterProps) {
  return (
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
            <button
              onClick={onReset}
              disabled={!hasChanges || isSaving}
              className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {resetLabel}
            </button>
          )}
          <button
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {isSaving ? "Saving..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SettingsHeaderProps {
  title: string;
  description?: string;
  lastUpdated?: {
    by: string;
    time: string;
  };
}

export function SettingsHeader({
  title,
  description,
  lastUpdated,
}: SettingsHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
      {lastUpdated && (
        <p className="text-sm text-muted-foreground mt-2">
          Last updated by <span className="font-medium">{lastUpdated.by}</span> on{" "}
          <span className="font-medium">{lastUpdated.time}</span>
        </p>
      )}
    </div>
  );
}
