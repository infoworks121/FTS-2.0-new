import { cn } from "@/lib/utils";
import { ProductType, productTypeConfig } from "@/types/product";
import { Package, Download, Wrench, LucideIcon } from "lucide-react";

interface ProductTypeBadgeProps {
  type: ProductType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

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

const typeIcons: Record<ProductType, LucideIcon> = {
  physical: Package,
  digital: Download,
  service: Wrench,
};

const typeColors: Record<ProductType, { bg: string; text: string; border: string }> = {
  physical: { 
    bg: "bg-blue-500/10", 
    text: "text-blue-600",
    border: "border-blue-500/20"
  },
  digital: { 
    bg: "bg-purple-500/10", 
    text: "text-purple-600",
    border: "border-purple-500/20"
  },
  service: { 
    bg: "bg-orange-500/10", 
    text: "text-orange-600",
    border: "border-orange-500/20"
  },
};

const typeColorsDark: Record<ProductType, { bg: string; text: string; border: string }> = {
  physical: { 
    bg: "bg-blue-500/20", 
    text: "text-blue-400",
    border: "border-blue-500/30"
  },
  digital: { 
    bg: "bg-purple-500/20", 
    text: "text-purple-400",
    border: "border-purple-500/30"
  },
  service: { 
    bg: "bg-orange-500/20", 
    text: "text-orange-400",
    border: "border-orange-500/30"
  },
};

export function ProductTypeBadge({ 
  type, 
  size = "md",
  showIcon = true,
}: ProductTypeBadgeProps) {
  const config = productTypeConfig[type];
  const Icon = typeIcons[type];
  const colors = typeColors[type];

  return (
    <div
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        colors.bg,
        colors.text,
        colors.border,
        sizeConfig[size]
      )}
    >
      {showIcon && <Icon className={iconSizeConfig[size]} />}
      <span>{config.label}</span>
    </div>
  );
}

export function ProductTypeBadgeDark({ 
  type, 
  size = "md",
  showIcon = true,
}: ProductTypeBadgeProps) {
  const config = productTypeConfig[type];
  const Icon = typeIcons[type];
  const colors = typeColorsDark[type];

  return (
    <div
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        colors.bg,
        colors.text,
        colors.border,
        sizeConfig[size]
      )}
    >
      {showIcon && <Icon className={iconSizeConfig[size]} />}
      <span>{config.label}</span>
    </div>
  );
}

// Compact version for table cells
export function ProductTypeCell({ type }: { type: ProductType }) {
  const Icon = typeIcons[type];
  const config = productTypeConfig[type];
  const colors = typeColors[type];

  return (
    <div className={cn("flex items-center gap-2", colors.text)}>
      <Icon className="h-4 w-4" />
      <span className="text-sm">{config.label}</span>
    </div>
  );
}
