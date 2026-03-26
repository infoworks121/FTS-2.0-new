import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serviceApi, ServiceFormData } from "@/lib/serviceApi";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Activity, DollarSign } from "lucide-react";

const steps = [
  { id: 1, title: "Service Details", description: "Name, Category, Duration", icon: Activity },
  { id: 2, title: "Pricing & Booking", description: "MSRP, Base Price, Booking rules", icon: DollarSign },
];

export default function AddNewService() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    serviceApi.getCategories().then((data) => {
      const cats = (data.categories || []).map((c: any) => ({
        id: String(c.id),
        name: c.name,
      }));
      setCategories(cats);
    }).catch(console.error);
  }, []);
  
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    categoryId: "",
    description: "",
    mrp: 0,
    basePrice: 0,
    sellingPrice: 0,
    serviceType: "installation", // default
    deliveryMode: "on-site", // default
    durationMinutes: 60,
    requiresBooking: false,
  });

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => currentStep < 2 && setCurrentStep(s => s + 1);
  const handleBack = () => currentStep > 1 && setCurrentStep(s => s - 1);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await serviceApi.create(formData);
      navigate("/admin/services");
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create service');
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.name && formData.categoryId;
    if (currentStep === 2) return formData.mrp > 0 && formData.basePrice > 0 && formData.sellingPrice > 0;
    return false;
  };

  return (
    <div className="space-y-6 pb-24">
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                currentStep >= step.id ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
              )}>
                {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <div className="hidden md:block">
                <p className={cn("text-sm font-medium", currentStep >= step.id ? "text-foreground" : "text-muted-foreground")}>{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn("w-12 lg:w-24 h-0.5 mx-2", currentStep > step.id ? "bg-primary" : "bg-muted")} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>Setup the core details of your service offering.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input placeholder="E.g., AC Installation" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.categoryId} onValueChange={(v) => handleInputChange("categoryId", v)}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Input placeholder="E.g., maintenance, consulting" value={formData.serviceType} onChange={(e) => handleInputChange("serviceType", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Delivery Mode</Label>
                <Select value={formData.deliveryMode} onValueChange={(v) => handleInputChange("deliveryMode", v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-site">On-Site</SelectItem>
                    <SelectItem value="remote">Remote / Online</SelectItem>
                    <SelectItem value="in-store">In-Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration (Minutes)</Label>
              <Input type="number" placeholder="60" value={formData.durationMinutes || ''} onChange={(e) => handleInputChange("durationMinutes", parseInt(e.target.value) || 0)} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} placeholder="Describe the service details..." value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Booking</CardTitle>
            <CardDescription>Define how much it costs and how it is scheduled.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>MRP (₹) *</Label>
                <Input type="number" value={formData.mrp || ''} onChange={(e) => handleInputChange("mrp", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Base Price (₹) *</Label>
                <Input type="number" value={formData.basePrice || ''} onChange={(e) => handleInputChange("basePrice", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Selling Price (₹) *</Label>
                <Input type="number" value={formData.sellingPrice || ''} onChange={(e) => handleInputChange("sellingPrice", parseFloat(e.target.value) || 0)} />
              </div>
            </div>

            <div className="pt-4 flex items-center space-x-2">
              <Checkbox id="requiresBooking" checked={formData.requiresBooking} onCheckedChange={(c) => handleInputChange("requiresBooking", c)} />
              <Label htmlFor="requiresBooking" className="font-normal cursor-pointer">
                Requires advance scheduling / booking slot allocation
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50">
        <div className="container flex h-16 items-center justify-between px-6">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentStep < 2 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>Next<ArrowRight className="h-4 w-4 ml-2" /></Button>
            ) : (
              <Button onClick={handleSave} disabled={!canProceed() || isSaving} className="bg-blue-600 hover:bg-blue-700">
                <Check className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Create Service"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
