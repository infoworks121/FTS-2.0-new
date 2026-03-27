import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  CheckCircle,
  Plus,
  Trash2
} from "lucide-react";
import { productApi } from "@/lib/productApi";
import { useToast } from "@/components/ui/use-toast";

export default function CategoryCommissionRules() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [commissionRules, setCommissionRules] = useState<any[]>([]);

  // Add rule state
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleData, setNewRuleData] = useState({ name: "", percentage: "" });
  const [isAddingRuleLoading, setIsAddingRuleLoading] = useState(false);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const rulesRes = await productApi.getCommissionRules();
      setCommissionRules(rulesRes.rules || []);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load commission rules", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreateRule = async () => {
    if (!newRuleData.name || !newRuleData.percentage) {
      return toast({ title: "Error", description: "Name and percentage are required", variant: "destructive" });
    }
    
    setIsAddingRuleLoading(true);
    try {
      await productApi.createCommissionRule({
        name: newRuleData.name,
        percentage: parseFloat(newRuleData.percentage),
        type: 'category'
      });
      toast({ title: "Success", description: "Commission rule created successfully" });
      setNewRuleData({ name: "", percentage: "" });
      setIsAddingRule(false);
      fetchInitialData();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to create rule", variant: "destructive" });
    } finally {
      setIsAddingRuleLoading(false);
    }
  };

  const handleDeleteRule = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the rule "${name}"?`)) {
      try {
        await productApi.deleteCommissionRule(id);
        toast({ title: "Success", description: "Rule deleted successfully" });
        fetchInitialData();
      } catch (error: any) {
        toast({ title: "Error", description: error.response?.data?.error || "Failed to delete rule", variant: "destructive" });
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading commission rules...</div>;
  }

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
          <h1 className="text-2xl font-bold tracking-tight">Commission Rules</h1>
          <p className="text-muted-foreground mt-1">
            Manage your master list of commission margins
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsAddingRule(!isAddingRule)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {isAddingRule && (
            <Card className="border-blue-500/20 shadow-md">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-base text-blue-600">Create New Commission Rule</CardTitle>
                <CardDescription>Configure a new base margin percentage</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Rule Name</Label>
                      <Input 
                        placeholder="e.g. Standard 15%" 
                        value={newRuleData.name} 
                        onChange={(e) => setNewRuleData({...newRuleData, name: e.target.value})} 
                      />
                   </div>
                   <div className="space-y-2">
                      <Label>Percentage (%)</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={newRuleData.percentage} 
                        onChange={(e) => setNewRuleData({...newRuleData, percentage: e.target.value})} 
                      />
                   </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                   <Button variant="ghost" onClick={() => setIsAddingRule(false)}>Cancel</Button>
                   <Button 
                      onClick={handleCreateRule} 
                      disabled={isAddingRuleLoading || !newRuleData.name || !newRuleData.percentage}
                      className="bg-blue-600 hover:bg-blue-700"
                   >
                      {isAddingRuleLoading ? "Creating..." : "Save Rule"}
                   </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Existing Commission Rules</CardTitle>
              <CardDescription>All active margin rules available for categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {commissionRules.length === 0 ? (
                 <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/10">
                   <p>No commission rules created yet.</p>
                   <Button variant="outline" className="mt-4" onClick={() => setIsAddingRule(true)}>
                     Create your first rule
                   </Button>
                 </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium">Rule Name</th>
                        <th className="px-4 py-3 font-medium">Margin (%)</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {commissionRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-4 font-medium">{rule.name}</td>
                          <td className="px-4 py-4">
                            <Badge variant="secondary" className="px-2 py-1 text-sm bg-blue-500/10 text-blue-700">
                              {rule.percentage}%
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                             <Badge variant="outline" className="text-green-600 border-green-200 bg-green-500/10">
                               <CheckCircle className="h-3 w-3 mr-1" /> Active
                             </Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                               onClick={() => handleDeleteRule(rule.id, rule.name)}
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Rules</span>
                <span className="font-medium text-lg">{commissionRules.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-700">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                1. Create your base margin templates (rules) here.
              </p>
              <p>
                2. Go to <strong>Manage Categories</strong> to assign these rules.
              </p>
              <p>
                3. Products created under those categories automatically inherit the mapped commission margin unless explicitly overridden.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
