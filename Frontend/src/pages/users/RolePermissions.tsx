import { useState } from "react";
import { Shield, Lock, Users, Info, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  UsersLayout, 
  UsersFilterBar, 
  UsersFilters, 
  UsersActions 
} from "@/components/users/UsersLayout";
import { SafeToggle } from "@/components/users/UserComponents";
import { UserConfirmationModal } from "@/components/users/UserConfirmationModal";
import { Role, Permission, permissionLabels } from "@/types/users";
import { cn } from "@/lib/utils";

// Mock data
const mockRoles: Role[] = [
  {
    id: "role001",
    name: "Admin",
    description: "Full system access with all permissions",
    permissions: ["view", "create", "edit", "approve", "withdraw", "audit"],
    userCount: 5,
    isLocked: true,
    canDelete: false,
    createdAt: "2023-01-01",
  },
  {
    id: "role002",
    name: "Core Body A",
    description: "District-level management with approval rights",
    permissions: ["view", "create", "edit", "approve", "audit"],
    userCount: 25,
    isLocked: true,
    canDelete: false,
    createdAt: "2023-03-15",
  },
  {
    id: "role003",
    name: "Core Body B",
    description: "District-level support with limited editing",
    permissions: ["view", "create", "edit"],
    userCount: 45,
    isLocked: true,
    canDelete: false,
    createdAt: "2023-03-15",
  },
  {
    id: "role004",
    name: "Businessman",
    description: "Standard business user with transaction access",
    permissions: ["view", "create"],
    userCount: 1250,
    isLocked: false,
    canDelete: true,
    createdAt: "2023-06-01",
  },
  {
    id: "role005",
    name: "Stock Point",
    description: "Fulfilment and inventory management",
    permissions: ["view", "edit"],
    userCount: 85,
    isLocked: false,
    canDelete: true,
    createdAt: "2023-08-10",
  },
];

const allPermissions: Permission[] = ["view", "create", "edit", "approve", "withdraw", "audit"];

export default function RolePermissions() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    variant: "default" | "danger" | "warning";
    sensitiveAction?: boolean;
  } | null>(null);

  const togglePermission = (roleId: string, permission: Permission) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.isLocked) return;

    const newPermissions = role.permissions.includes(permission)
      ? role.permissions.filter(p => p !== permission)
      : [...role.permissions, permission];

    setRoles(roles.map(r => 
      r.id === roleId ? { ...r, permissions: newPermissions } : r
    ));
    setHasChanges(true);
  };

  const handleSaveDraft = () => {
    setConfirmModal({
      isOpen: true,
      title: "Save Draft",
      description: "This will save your permission changes as a draft. You can publish them later.",
      action: () => {
        console.log("Saving draft permissions:", roles);
        setHasChanges(false);
        setConfirmModal(null);
      },
      variant: "warning",
    });
  };

  const handlePublish = () => {
    setConfirmModal({
      isOpen: true,
      title: "Publish Changes",
      description: "This will immediately apply your permission changes to all users. This action cannot be undone. Are you sure?",
      action: () => {
        console.log("Publishing permission changes:", roles);
        setHasChanges(false);
        setConfirmModal(null);
      },
      variant: "danger",
      sensitiveAction: true,
    });
  };

  const handleReset = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset Changes",
      description: "This will discard all your unsaved changes and restore the original permissions.",
      action: () => {
        setRoles(mockRoles);
        setHasChanges(false);
        setConfirmModal(null);
      },
      variant: "warning",
    });
  };

  const hasPermission = (role: Role, permission: Permission) => {
    return role.permissions.includes(permission);
  };

  // Critical permissions that shouldn't be easily modified
  const criticalPermissions: Permission[] = ["withdraw", "audit"];

  return (
    <UsersLayout
      title="Role Permissions"
      description="Define what each role can do in the system"
      actions={
        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button size="sm" onClick={handlePublish}>
                <Shield className="mr-2 h-4 w-4" />
                Publish
              </Button>
            </>
          )}
        </div>
      }
    >
      {/* Role Description Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {roles.map((role) => (
          <div 
            key={role.id}
            className={cn(
              "rounded-lg border bg-card p-4",
              role.isLocked && "border-warning/30"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className={cn("h-4 w-4", role.isLocked ? "text-warning" : "text-muted-foreground")} />
                <p className="font-semibold text-foreground">{role.name}</p>
                {role.isLocked && (
                  <Lock className="h-3 w-3 text-warning" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{role.description}</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px]">
                <Users className="mr-1 h-3 w-3" />
                {role.userCount} users
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="rounded-lg border border-border bg-card transition-colors duration-300 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[200px]">
                Role
              </TableHead>
              {allPermissions.map((permission) => (
                <TableHead 
                  key={permission} 
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{permissionLabels[permission]}</span>
                    {criticalPermissions.includes(permission) && (
                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 text-warning border-warning/50">
                        Critical
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id} className="border-border hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Shield className={cn("h-4 w-4", role.isLocked ? "text-warning" : "text-muted-foreground")} />
                    <div>
                      <p className="font-medium text-foreground">{role.name}</p>
                      {role.isLocked && (
                        <p className="text-[10px] text-warning flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" />
                          System protected
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                {allPermissions.map((permission) => {
                  const isLocked = role.isLocked || (criticalPermissions.includes(permission) && role.id !== "role001");
                  const isEnabled = hasPermission(role, permission);
                  
                  return (
                    <TableCell key={permission} className="text-center">
                      <div className="flex items-center justify-center">
                        <SafeToggle
                          enabled={isEnabled}
                          onChange={() => togglePermission(role.id, permission)}
                          disabled={isLocked}
                        />
                      </div>
                      {isLocked && !role.isLocked && criticalPermissions.includes(permission) && (
                        <div className="flex items-center justify-center mt-1">
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Warning Banner */}
      <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-warning">
            Important Notes
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Admin role permissions are locked and cannot be modified</li>
            <li>• Critical permissions (Withdraw, Audit) require special confirmation to modify</li>
            <li>• All permission changes are logged in the audit trail</li>
            <li>• Save as draft before publishing to review changes</li>
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
