import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tag, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ChevronRight,
  Link as LinkIcon,
  Edit,
  Eye,
} from "lucide-react";
import { CategoryCommissionMapping as CategoryCommissionMappingType } from "@/types/product";

interface CategoryCommissionMappingProps {
  mappings: CategoryCommissionMappingType[];
  onEditRule?: (mapping: CategoryCommissionMappingType) => void;
  onViewRule?: (mapping: CategoryCommissionMappingType) => void;
  showWarnings?: boolean;
}

export function CategoryCommissionMapping({ 
  mappings,
  onEditRule,
  onViewRule,
  showWarnings = true,
}: CategoryCommissionMappingProps) {
  const hasMissingRules = mappings.some(m => !m.commissionRuleId);

  return (
    <div className="space-y-4">
      {/* Warning for missing rules */}
      {showWarnings && hasMissingRules && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Some categories don't have commission rules assigned. Products in these categories may not earn commissions.
          </p>
        </div>
      )}

      {/* Mapping Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Category to Commission Rule Mappings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Category</TableHead>
                <TableHead>Commission Rule</TableHead>
                <TableHead>Effective From</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No category mappings found
                  </TableCell>
                </TableRow>
              ) : (
                mappings.map((mapping) => (
                  <TableRow key={mapping.categoryId}>
                    <TableCell className="font-medium">
                      {mapping.categoryName}
                    </TableCell>
                    <TableCell>
                      {mapping.commissionRuleId ? (
                        <Badge variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {mapping.commissionRuleName}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          No rule assigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mapping.effectiveFrom ? (
                        new Date(mapping.effectiveFrom).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {mapping.isDefault ? (
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      ) : mapping.effectiveTo ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {mapping.commissionRuleId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewRule?.(mapping)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRule?.(mapping)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Rule Card for selection
interface CommissionRuleOptionProps {
  id: string;
  name: string;
  percentage: number;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function CommissionRuleOption({
  id,
  name,
  percentage,
  isSelected,
  onSelect,
}: CommissionRuleOptionProps) {
  return (
    <div 
      onClick={() => onSelect?.(id)}
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-5 w-5 rounded-full border-2 flex items-center justify-center",
          isSelected ? "border-primary bg-primary" : "border-muted-foreground"
        )}>
          {isSelected && (
            <div className="h-2 w-2 rounded-full bg-white" />
          )}
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">
            {percentage}% commission
          </p>
        </div>
      </div>
      <Badge variant="secondary">{percentage}%</Badge>
    </div>
  );
}

// Simple category selector
interface CategorySelectorProps {
  categories: { id: string; name: string; parentName?: string }[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function CategorySelector({ 
  categories, 
  selectedId,
  onSelect 
}: CategorySelectorProps) {
  return (
    <div className="space-y-1 max-h-64 overflow-y-auto">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect?.(category.id)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
            selectedId === category.id 
              ? "bg-primary/10 text-primary" 
              : "hover:bg-muted"
          )}
        >
          <Tag className="h-4 w-4 text-amber-500" />
          <span className="flex-1">{category.name}</span>
          {category.parentName && (
            <span className="text-xs text-muted-foreground">
              → {category.parentName}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
