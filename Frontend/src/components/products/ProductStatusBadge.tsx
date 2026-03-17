import { cn } from "@/lib/utils";
import { ProductStatus } from "@/types/product";
import { CheckCircle, XCircle, Clock, Archive, LucideIcon } from "lucide-react";

interface ProductStatusBadgeProps {
  status: ProductStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const statusConfig: Record<ProductStatus, { 
  bg: string; 
  text: string; 
  label: string;
  icon: LucideIcon;
  border: string;
}> = {
  active: { 
    bg: "bg-green-500/10", 
    text: "text-green-600", 
    label: "Active",
    icon: CheckCircle,
    border: "border-green-500/20"
  },
  inactive: { 
    bg: "bg-red-500/10", 
    text: "text-red-600", 
    label: "Inactive",
    icon: XCircle,
    border: "border-red-500/20"
  },
  draft: { 
    bg: "bg-yellow-500/10", 
    text: "text-yellow-600", 
    label: "Draft",
    icon: Clock,
    border: "border-yellow-500/20"
  },
  archived: { 
    bg: "bg-gray-500/10", 
    text: "text-gray-600", 
    label: "Archived",
    icon: Archive,
    border: "border-gray-500/20"
  },
};

const sizeConfig = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
  lg: "text-base px-3 py-1.5 gap-2",
};

const iconSizeConfig = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function ProductStatusBadge({ 
  status, 
  size = "md",
  showIcon = true 
}: ProductStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        config.bg,
        config.text,
        config.border,
        sizeConfig[size]
      )}
    >
      {showIcon && <Icon className={iconSizeConfig[size]} />}
      <span>{config.label}</span>
    </div>
  );
}

// Dark mode variants
export function ProductStatusBadgeDark({ 
  status, 
  size = "md",
  showIcon = true 
}: ProductStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  // Override colors for dark mode
  const darkBg = {
    active: "bg-green-500/20",
    inactive: "bg-red-500/20",
    draft: "bg-yellow-500/20",
    archived: "bg-gray-500/20",
  };

  const darkText = {
    active: "text-green-400",
    inactive: "text-red-400",
    draft: "text-yellow-400",
    archived: "text-gray-400",
  };

  const darkBorder = {
    active: "border-green-500/30",
    inactive: "border-red-500/30",
    draft: "border-yellow-500/30",
    archived: "border-gray-500/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        darkBg[status],
        darkText[status],
        darkBorder[status],
        sizeConfig[size]
      )}
    >
      {showIcon && <Icon className={iconSizeConfig[size]} />}
      <span>{config.label}</span>
    </div>
  );
}
