import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Save, 
  RotateCcw,
  Tag,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Info,
  Link as LinkIcon,
  Edit,
  Eye,
} from "lucide-react";
import { ProductsLayout } from "@/components/products";
import { CategoryCommissionMapping } from "@/components/categories";

// Mock commission rules
const mockCommissionRules = [
  { id: "rule-1", name: "Standard Commission", percentage: 15, status: "active" },
  { id: "rule-2", name: "Digital Products Commission", percentage: 30, status: "active" },
  { id: "rule-3", name: "Service Commission", percentage: 20, status: "active" },
  { id: "rule-4", name: "Premium Products Commission", percentage: 10, status: "scheduled" },
];

// Mock category mappings
const mockMappings = [
  {
    categoryId: "cat-1",
    categoryName: "Electronics",
    commissionRuleId: "rule-1",
    commissionRuleName: "Standard Commission",
    effectiveFrom: "2024-01-01",
    isDefault: true,
  },
  {
    categoryId: "cat-1-1",
    categoryName: "Mobile Phones",
    commissionRuleId: "rule-1",
    commissionRuleName: "Standard Commission",
    effectiveFrom: "2024-01-01",
    isDefault: false,
  },
  {
    categoryId: "cat-1-2",
    categoryName: "Laptops",
    commissionRuleId: "rule-1",
    commissionRuleName: "Standard Commission",
    effectiveFrom: "2024-01-01",
    isDefault: false,
  },
  {
    categoryId: "cat-2",
    categoryName: "Digital Products",
    commissionRuleId: "rule-2",
    commissionRuleName: "Digital Products Commission",
    effectiveFrom: "2024-01-01",
    isDefault: true,
  },
  {
    categoryId: "cat-2-1",
    categoryName: "E-Books",
    commissionRuleId: "rule-2",
    commissionRuleName: "Digital Products Commission",
    effectiveFrom: "2024-01-01",
    isDefault: false,
  },
  {
    categoryId: "cat-3",
    categoryName: "Services",
    commissionRuleId: "rule-3",
    commissionRuleName: "Service Commission",
    effectiveFrom: "2024-01-01",
    isDefault: true,
  },
  {
    categoryId: "cat-4",
    categoryName: "Fashion",
    commissionRuleId: "none",
    commissionRuleName: "",
    effectiveFrom: "",
    isDefault: false,
  },
];

export default function CategoryCommissionRules() {
  const navigate = useNavigate();
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [defaultRuleId, setDefaultRuleId] = useState("rule-1");
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  const [mappings, setMappings] = useState(mockMappings);

  const categoriesWithoutRules = mappings.filter(m => !m.commissionRuleId);
  const categoriesWithRules = mappings.filter(m => m.commissionRuleId);

  const handleDefaultRuleChange = (ruleId: string) => {
    setDefaultRuleId(ruleId);
    setHasChanges(true);
  };

  const handleMappingRuleChange = (categoryId: string, ruleId: string) => {
    setMappings(prev => prev.map(m => 
      m.categoryId === categoryId 
        ? { 
            ...m, 
            commissionRuleId: ruleId === "none" ? "" : ruleId, 
            commissionRuleName: ruleId === "none" ? "" : (mockCommissionRules.find(r => r.id === ruleId)?.name || "") 
          }
        : m
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 1500);
  };

  const handleReset = () => {
    setMappings(mockMappings);
    setDefaultRuleId("rule-1");
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/categories")}
            className="mb-3 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Category Commission Rules</h1>
          <p className="text-muted-foreground mt-1">
            Link categories with commission rules for profit calculation
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      {categoriesWithoutRules.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-sm text-amber-600">
            {categoriesWithoutRules.length} category/categories without commission rules. Products in these categories may not earn commissions.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Default Rule */}
          <Card>
            <CardHeader>
              <CardTitle>Default Commission Rule</CardTitle>
              <CardDescription>
                This rule will be applied to categories without specific rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={defaultRuleId}
                onValueChange={handleDefaultRuleChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockCommissionRules.map((rule) => (
                    <SelectItem key={rule.id} value={rule.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{rule.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {rule.percentage}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    This default rule applies to new categories automatically
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Mappings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Category to Commission Rule Mappings
              </CardTitle>
              <CardDescription>
                Configure which commission rule applies to each category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mappings.map((mapping) => (
                <div 
                  key={mapping.categoryId}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    !mapping.commissionRuleId && "border-amber-500/30 bg-amber-500/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">{mapping.categoryName}</p>
                      {mapping.isDefault && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Inherits from parent
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!mapping.commissionRuleId ? (
                      <Badge variant="outline" className="text-amber-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No rule
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {mapping.commissionRuleName}
                      </Badge>
                    )}
                    
                    <Select
                      value={mapping.commissionRuleId}
                      onValueChange={(value) => handleMappingRuleChange(mapping.categoryId, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select rule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Rule</SelectItem>
                        {mockCommissionRules.map((rule) => (
                          <SelectItem key={rule.id} value={rule.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{rule.name}</span>
                              <Badge variant="secondary" className="ml-2">
                                {rule.percentage}%
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Commission Rules Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Available Commission Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCommissionRules.map((rule) => (
                <div 
                  key={rule.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    defaultRuleId === rule.id && "border-primary bg-primary/5"
                  )}
                >
                  <div>
                    <p className="font-medium text-sm">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.percentage}% commission
                    </p>
                  </div>
                  {rule.status === "scheduled" ? (
                    <Badge variant="outline" className="text-amber-600">
                      <Clock className="h-3 w-3 mr-1" />
                      Scheduled
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Mapping Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Categories</span>
                <span className="font-medium">{mappings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">With Rules</span>
                <span className="font-medium text-green-600">
                  {categoriesWithRules.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Without Rules</span>
                <span className="font-medium text-amber-600">
                  {categoriesWithoutRules.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">
                  Commission rules can be overridden at the product level
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">
                  You can schedule rule changes for future dates
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50">
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
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
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
