import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Wallet, Users, Building2, Shield, Percent, Package } from "lucide-react";

interface FlowNode {
  id: string;
  label: string;
  value?: number;
  icon: React.ElementType;
  color: "default" | "profit" | "trust" | "company" | "admin" | "reserve";
}

interface FlowConnection {
  from: string;
  to: string;
  label?: string;
}

interface FlowDiagramProps {
  nodes: FlowNode[];
  connections: FlowConnection[];
  title?: string;
  className?: string;
}

const colorStyles = {
  default: {
    bg: "bg-muted/30",
    border: "border-border",
    icon: "text-muted-foreground",
    text: "text-card-foreground",
  },
  profit: {
    bg: "bg-profit/10",
    border: "border-profit/30",
    icon: "text-profit",
    text: "text-profit",
  },
  trust: {
    bg: "bg-trust/10",
    border: "border-trust/30",
    icon: "text-trust",
    text: "text-trust",
  },
  company: {
    bg: "bg-company/10",
    border: "border-company/30",
    icon: "text-company",
    text: "text-company",
  },
  admin: {
    bg: "bg-admin/10",
    border: "border-admin/30",
    icon: "text-admin",
    text: "text-admin",
  },
  reserve: {
    bg: "bg-reserve/10",
    border: "border-reserve/30",
    icon: "text-reserve",
    text: "text-reserve",
  },
};

export function FlowDiagram({ nodes, connections, title, className }: FlowDiagramProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-card-foreground mb-4">{title}</h3>
      )}
      
      <div className="flex items-center justify-between gap-4">
        {nodes.map((node, index) => {
          const styles = colorStyles[node.color];
          const Icon = node.icon;
          
          return (
            <React.Fragment key={node.id}>
              <div className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300",
                styles.bg,
                styles.border
              )}>
                <div className={cn("p-2 rounded-full bg-muted", styles.icon)}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn("text-sm font-medium", styles.text)}>{node.label}</span>
                {node.value !== undefined && (
                  <span className={cn("text-lg font-bold font-mono", styles.text)}>
                    {node.value}%
                  </span>
                )}
              </div>
              
              {index < nodes.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Specialized flow for profit distribution
interface ProfitFlowProps {
  totalProfit: number;
  flows: {
    label: string;
    percentage: number;
    wallet?: string;
    color: FlowNode["color"];
  }[];
}

export function ProfitFlowVisualization({ totalProfit, flows }: ProfitFlowProps) {
  const totalPercentage = flows.reduce((sum, f) => sum + f.percentage, 0);
  
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-card-foreground">Profit Distribution Flow</h3>
        <span className="font-mono font-bold text-card-foreground">{totalProfit}% Total</span>
      </div>
      
      {/* Stacked bar visualization */}
      <div className="h-8 rounded-full overflow-hidden flex">
        {flows.map((flow, idx) => {
          const styles = colorStyles[flow.color];
          return (
            <div
              key={idx}
              className={cn("h-full transition-all duration-500", styles.bg)}
              style={{ width: `${(flow.percentage / totalPercentage) * 100}%` }}
              title={`${flow.label}: ${flow.percentage}%`}
            />
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {flows.map((flow, idx) => {
          const styles = colorStyles[flow.color];
          return (
            <div key={idx} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", styles.bg.replace("/10", ""))} />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-card-foreground">{flow.label}</span>
                <span className={cn("text-xs font-mono font-bold", styles.text)}>{flow.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {totalPercentage !== 100 && (
        <div className="flex items-center gap-2 text-warning text-xs">
          <AlertTriangle className="h-3 w-3" />
          Total allocation is {totalPercentage}% (should be 100%)
        </div>
      )}
    </div>
  );
}

// Default flow nodes for common scenarios
export const defaultB2BFlowNodes: FlowNode[] = [
  { id: "total", label: "Total Profit", icon: Wallet, color: "default" },
  { id: "direct", label: "Direct Referral", icon: Users, color: "profit" },
  { id: "company", label: "Company (FTS)", icon: Building2, color: "company" },
  { id: "trust", label: "Trust Fund", icon: Shield, color: "trust" },
  { id: "admin", label: "Admin", icon: Percent, color: "admin" },
];

export const defaultB2CFlowNodes: FlowNode[] = [
  { id: "total", label: "Total Profit", icon: Wallet, color: "default" },
  { id: "trust", label: "Trust Fund", icon: Shield, color: "trust" },
  { id: "admin", label: "Admin", icon: Percent, color: "admin" },
  { id: "company", label: "Company", icon: Building2, color: "company" },
  { id: "stockpoint", label: "Stock Point", icon: Package, color: "reserve" },
  { id: "referral", label: "Referral", icon: Users, color: "profit" },
];

// Helper to create connections
export function createLinearConnections(nodeIds: string[]): FlowConnection[] {
  return nodeIds.slice(0, -1).map((id, idx) => ({
    from: id,
    to: nodeIds[idx + 1],
  }));
}

// Import AlertTriangle for warning
import { AlertTriangle } from "lucide-react";
