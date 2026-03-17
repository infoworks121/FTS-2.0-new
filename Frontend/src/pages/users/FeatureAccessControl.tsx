import { useState } from "react";
import { Settings, ToggleLeft, ToggleRight, Calendar, AlertTriangle, Info, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  UsersLayout, 
  UsersFilterBar, 
  UsersActions 
} from "@/components/users/UsersLayout";
import { SafeToggle } from "@/components/users/UserComponents";
import { UserConfirmationModal } from "@/components/users/UserConfirmationModal";
import { Feature, UserRole, roleConfig } from "@/types/users";
import { cn } from "@/lib/utils";

// Mock data
const mockFeatures: Feature[] = [
  {
    id: "feat001",
    name: "Bulk Order Access",
    description: "Allow placing orders in bulk quantities above standard limits",
    category: "Orders",
    isEnabled: true,
    isGlobal: true,
  },
  {
    id: "feat002",
    name: "Stock Issuing",
    description: "Permission to issue stock from inventory to fulfillment points",
    category: "Inventory",
    isEnabled: true,
    isGlobal: false,
  },
  {
    id: "feat003",
    name: "Negotiation Mode",
    description: "Ability to negotiate custom margins with bulk buyers",
    category: "Sales",
    isEnabled: true,
    isGlobal: false,
  },
  {
    id: "feat004",
    name: "Withdrawal Access",
    description: "Permission to initiate wallet withdrawals",
    category: "Finance",
    isEnabled: true,
    isGlobal: true,
  },
  {
    id: "feat005",
    name: "Upgrade Requests",
    description: "Ability to request mode upgrades (Entry to Advance, Advance to Bulk)",
    category: "Users",
    isEnabled: true,
    isGlobal: false,
  },
  {
    id: "feat006",
    name: "Commission Viewing",
    description: "View commission earnings and distribution details",
    category: "Finance",
    isEnabled: true,
    isGlobal: true,
  },
  {
    id: "feat007",
    name: "District Management",
    description: "Manage district-level settings and core body assignments",
    category: "Administration",
    isEnabled: false,
    isGlobal: false,
  },
  {
    id: "feat008",
    name: "KYC Verification",
    description: "Verify user identity documents (PAN, Aadhaar)",
    category: "Compliance",
    isEnabled: true,
    isGlobal: true,
  },
];

const roles: UserRole[] = ["admin", "corebody_a", "corebody_b", "businessman", "stock_point"];

// Mock access configuration
const initialAccess: Record<string, Record<UserRole, boolean>> = {
  feat001: { admin: true, corebody_a: true, corebody_b: true, businessman: false, stock_point: false },
  feat002: { admin: true, corebody_a: true, corebody_b: false, businessman: false, stock_point: true },
  feat003: { admin: true, corebody_a: true, corebody_b: false, businessman: false, stock_point: false },
  feat004: { admin: true, corebody_a: true, corebody_b: false, businessman: true, stock_point: false },
  feat005: { admin: true, corebody_a: true, corebody_b: true, businessman: true, stock_point: false },
  feat006: { admin: true, corebody_a: true, corebody_b: true, businessman: true, stock_point: true },
  feat007: { admin: true, corebody_a: false, corebody_b: false, businessman: false, stock_point: false },
  feat008: { admin: true, corebody_a: true, corebody_b: false, businessman: false, stock_point: false },
};

export default function FeatureAccessControl() {
  const [features, setFeatures] = useState<Feature[]>(mockFeatures);
  const [featureAccess, setFeatureAccess] = useState<Record<string, Record<UserRole, boolean>>>(initialAccess);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hasChanges, setHasChanges] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState<string>("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    variant: "default" | "danger" | "warning";
    sensitiveAction?: boolean;
  } | null>(null);

  const categories = Array.from(new Set(features.map(f => f.category)));

  const filteredFeatures = selectedCategory === "all" 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const toggleFeatureGlobal = (featureId: string) => {
    setFeatures(features.map(f => 
      f.id === featureId ? { ...f, isEnabled: !f.isEnabled } : f
    ));
    setHasChanges(true);
  };

  const toggleRoleAccess = (featureId: string, role: UserRole) => {
    setFeatureAccess(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [role]: !prev[featureId]?.[role],
      },
    }));
    setHasChanges(true);
  };

  const handlePublish = () => {
    if (!effectiveFrom) {
      setConfirmModal({
        isOpen: true,
        title: "Select Effective Date",
        description: "Please select an effective-from date before publishing changes.",
        action: () => setConfirmModal(null),
        variant: "warning",
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Publish Feature Access",
      description: `This will publish feature access changes effective from ${effectiveFrom}. All role-based access will be updated.`,
      action: () => {
        console.log("Publishing feature access changes:", { features, featureAccess, effectiveFrom });
        setHasChanges(false);
        setConfirmModal(null);
      },
      variant: "danger",
      sensitiveAction: true,
    });
  };

  return (
    <UsersLayout
      title="Feature Access Control"
      description="Fine-grained feature toggling and role-based access management"
      actions={
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button size="sm" onClick={handlePublish}>
              <Save className="mr-2 h-4 w-4" />
              Publish Changes
            </Button>
          )}
        </div>
      }
    >
      {/* Category Filter */}
      <UsersFilterBar>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All Features
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Effective From Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
            className="w-[160px] h-9"
          />
          <span className="text-xs text-muted-foreground">Effective from</span>
        </div>
      </UsersFilterBar>

      {/* Feature Access Matrix */}
      <div className="rounded-lg border border-border bg-card transition-colors duration-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[250px]">
                  Feature
                </th>
                <th className="text-left p-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[100px]">
                  Global
                </th>
                {roles.map(role => (
                  <th 
                    key={role} 
                    className="text-center p-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>{roleConfig[role].label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((feature) => (
                <tr key={feature.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {feature.category}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center">
                      <SafeToggle
                        enabled={feature.isEnabled}
                        onChange={() => toggleFeatureGlobal(feature.id)}
                      />
                    </div>
                  </td>
                  {roles.map(role => {
                    const hasAccess = featureAccess[feature.id]?.[role] ?? false;
                    const canAccess = feature.isEnabled;
                    
                    return (
                      <td key={role} className="p-4">
                        <div className="flex items-center justify-center">
                          <SafeToggle
                            enabled={hasAccess}
                            onChange={() => toggleRoleAccess(feature.id, role)}
                            disabled={!canAccess}
                          />
                        </div>
                        {!canAccess && (
                          <p className="text-[10px] text-muted-foreground text-center mt-1">
                            Feature disabled
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-400">
            How Feature Access Works
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Global Toggle:</strong> Enable/disable the feature for the entire system</li>
            <li>• <strong>Role Access:</strong> Grant feature access to specific roles (only works when global is enabled)</li>
            <li>• <strong>Effective From:</strong> Schedule when changes take effect</li>
            <li>• <strong>Changes are logged:</strong> All modifications are tracked in audit logs</li>
          </ul>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-warning">
            Business Rules
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Feature access cannot override financial cap rules</li>
            <li>• Withdrawal access requires KYC verification</li>
            <li>• Bulk order access is subject to SLA ratings</li>
            <li>• All changes require confirmation before publishing</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <UserConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.action}
          title={confirmModal.title}
          description={confirmModal.description}
          variant={confirmModal.variant}
          sensitiveAction={confirmModal.sensitiveAction}
        />
      )}
    </UsersLayout>
  );
}
