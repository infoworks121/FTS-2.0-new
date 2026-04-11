import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  UserPlus,
  Mail,
  Lock,
  Phone,
  User,
  X,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  CreditCard,
  Briefcase,
  MapPin,
  ShieldCheck,
  FileCheck,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Upload,
  UserCheck,
  Package
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// Registration Steps Configuration
const steps = [
  { id: 1, title: "Basic Details", description: "Account & Info", icon: User },
  { id: 2, title: "Security", description: "Password & Access", icon: ShieldCheck },
  { id: 3, title: "KYC Details", description: "Identity Verification", icon: FileCheck },
  { id: 4, title: "Review", description: "Finalize & Confirm", icon: UserCheck },
];

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [installmentData, setInstallmentData] = useState({
    investment_amount: "",
    installment_count: "1",
  });
  const [customAmounts, setCustomAmounts] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
    role_code: "customer",
    core_body_type: "",
    businessman_type: "",
    district_id: "",
    subdivision_id: "",
    product_id: "",
    referral_code_used: searchParams.get("ref") || "",
  });

  const [districts, setDistricts] = useState<{id: number, name: string}[]>([]);
  const [subdivisions, setSubdivisions] = useState<{id: number, name: string}[]>([]);
  const [dealerRoutedProducts, setDealerRoutedProducts] = useState<{id: string, name: string, is_dealer_routed: boolean}[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [assignedProductIds, setAssignedProductIds] = useState<string[]>([]);

  const [kycDocs, setKycDocs] = useState({
    identityType: "aadhaar",
    identityUrl: "",
    identityNumber: "",
    panUrl: "",
    panNumber: "",
    bankUrl: ""
  });

  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role_code: value, core_body_type: "", businessman_type: "", district_id: "", subdivision_id: "" }));
  };

  const handleCoreBodyTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, core_body_type: value, district_id: "", subdivision_id: "" }));
  };

  useEffect(() => {
    // Fetch Districts of West Bengal (ID: 1)
    const fetchDistricts = async () => {
      try {
        const res = await api.get('/geography/states/1/districts');
        setDistricts(res.data);
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (formData.core_body_type === "core_body_a") {
      setInstallmentData({ investment_amount: "100000", installment_count: "1" });
      setCustomAmounts(["100000"]);
    } else if (formData.core_body_type === "core_body_b") {
      setInstallmentData({ investment_amount: "50000", installment_count: "1" });
      setCustomAmounts(["50000"]);
    }
  }, [formData.core_body_type]);

  const handleBusinessmanTypeChange = (value: string) => {
    if (value === "stock_point") {
      setFormData((prev) => ({ ...prev, role_code: "stock_point", businessman_type: "stock_point" }));
    } else {
      setFormData((prev) => ({ ...prev, role_code: "businessman", businessman_type: value }));
    }
  };

  const handleDistrictChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, district_id: value, subdivision_id: "" }));
    // Fetch Subdivisions
    try {
      const res = await api.get(`/geography/districts/${value}/subdivisions`);
      setSubdivisions(res.data);
    } catch (err) {
      console.error('Error fetching subdivisions:', err);
      setSubdivisions([]);
    }
  };

  const handleSubdivisionChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, subdivision_id: value, product_id: "" }));
    // Fetch Already Assigned Products in this Subdivision
    try {
      const res = await api.get(`/geography/subdivisions/${value}/assigned-products`);
      setAssignedProductIds(res.data);
    } catch (err) {
      console.error('Error fetching assigned products:', err);
      setAssignedProductIds([]);
    }
  };

  useEffect(() => {
    if (formData.core_body_type === "dealer") {
      const fetchData = async () => {
        try {
          // Fetch Categories
          const catRes = await api.get('/catalog/categories');
          const rawCats = catRes.data.categories || [];
          
          // Process hierarchy for flat display (Show only leaf nodes)
          const parents = new Set(rawCats.filter((c: any) => c.parent_id).map((c: any) => c.parent_id));
          const leafCats = rawCats.filter((c: any) => !parents.has(c.id));
          
          const processedCats: any[] = [];
          const catMap = new Map();
          rawCats.forEach((c: any) => catMap.set(c.id, c));
          
          leafCats.forEach((c: any) => {
            if (c.parent_id) {
              const parent = catMap.get(c.parent_id);
              processedCats.push({
                id: c.id,
                name: `${parent ? parent.name + ' > ' : ''}${c.name}`,
              });
            } else {
              processedCats.push({
                id: c.id,
                name: c.name,
              });
            }
          });
          
          setCategories(processedCats.sort((a,b) => a.name.localeCompare(b.name)));

          // Keep product fetch as backup or mixed use if needed, but primary is category now
          const res = await api.get('/products?is_dealer_routed=true');
          setDealerRoutedProducts(res.data.products || []);
        } catch (err) {
          console.error('Error fetching dealer data:', err);
        }
      };
      fetchData();
    }
  }, [formData.core_body_type]);

  const isCoreBodyWithInvestment =
    formData.role_code === "core_body" &&
    (formData.core_body_type === "core_body_a" || formData.core_body_type === "core_body_b");

  const isRetailerA =
    formData.role_code === "businessman" && formData.businessman_type === "retailer_a";

  const needsInstallmentModal = isCoreBodyWithInvestment || isRetailerA;
  const isKycMandatory = isCoreBodyWithInvestment || isRetailerA;

  const totalInvestment = parseFloat(installmentData.investment_amount) || 0;
  const customTotal = customAmounts.reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const remaining = parseFloat((totalInvestment - customTotal).toFixed(2));
  const isCustomValid = totalInvestment > 0 && Math.abs(remaining) < 0.01;

  const handleInstallmentCountChange = (val: string) => {
    const count = parseInt(val);
    setInstallmentData((prev) => ({ ...prev, installment_count: val }));
    const total = parseFloat(installmentData.investment_amount) || 0;
    if (total > 0) {
      const equal = (total / count).toFixed(2);
      setCustomAmounts(Array(count).fill(equal));
    } else {
      setCustomAmounts(Array(count).fill(""));
    }
  };

  const handleCustomAmountChange = (index: number, value: string) => {
    setCustomAmounts((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use the public upload endpoint for registration
      const response = await api.post('/upload/public', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(prev => ({ ...prev, [type]: percentCompleted }));
        },
      });

      setKycDocs(prev => ({ ...prev, [type]: response.data.url }));
      toast({
        title: "Upload Successful",
        description: `${type.replace('Url', '')} document uploaded.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Could not upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Validate core_body requirements
    if (formData.role_code === "core_body") {
      if (!formData.core_body_type) {
        toast({
          title: "Validation Error",
          description: "Please select Core Body type",
          variant: "destructive",
        });
        return;
      }
      if ((formData.core_body_type === "core_body_a" || formData.core_body_type === "core_body_b" || formData.core_body_type === "dealer") && !formData.district_id) {
        toast({
          title: "Validation Error",
          description: "Please select a district",
          variant: "destructive",
        });
        return;
      }
      if (formData.core_body_type === "dealer") {
        if (!formData.subdivision_id) {
          toast({
            title: "Validation Error",
            description: "Please select a subdivision for Dealer registration",
            variant: "destructive",
          });
          return;
        }
        if (!formData.product_id && !formData.category_id) {
          toast({
            title: "Validation Error",
            description: "Please select a product specialization for Dealer registration",
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Validate businessman requirements
    if (formData.role_code === "businessman" && !formData.businessman_type) {
      toast({
        title: "Validation Error",
        description: "Please select Businessman type",
        variant: "destructive",
      });
      return;
    }

    // Validate KYC Documents if mandatory
    if (isKycMandatory) {
      if (!kycDocs.identityUrl || !kycDocs.panUrl || !kycDocs.bankUrl) {
        toast({
          title: "KYC Required",
          description: "Identity, PAN, and Bank Account documents are mandatory for your selected role.",
          variant: "destructive",
        });
        return;
      }
    }

    // Investment Validation for CBS B
    if (formData.core_body_type === "core_body_b") {
      if (totalInvestment < 50000 || totalInvestment > 250000) {
        toast({
          title: "Invalid Investment",
          description: "Core Body B requires investment between ₹50,000 and ₹2,50,000",
          variant: "destructive",
        });
        return;
      }
    }

    // Ensure balanced installments if investment is required
    if (needsInstallmentModal && !isCustomValid) {
       toast({
        title: "Investment Not Balanced",
        description: `Please ensure the total installments match the investment amount. Difference: ₹${remaining}`,
        variant: "destructive",
      });
      return;
    }

    await submitRegistration();
  };

  const submitRegistration = async () => {
    setIsLoading(true);

    const kycDocuments = [];
    if (kycDocs.identityUrl) kycDocuments.push({ doc_type: kycDocs.identityType, doc_url: kycDocs.identityUrl, doc_number: kycDocs.identityNumber });
    if (kycDocs.panUrl) kycDocuments.push({ doc_type: 'pan', doc_url: kycDocs.panUrl, doc_number: kycDocs.panNumber });
    if (kycDocs.bankUrl) kycDocuments.push({ doc_type: 'bank_account_proof', doc_url: kycDocs.bankUrl });

    try {
      const { data } = await api.post('/auth/register', {
        kycDocuments,
        phone: formData.phone,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role_code: formData.role_code === "core_body" ? formData.core_body_type : formData.role_code,
        businessman_type: formData.businessman_type || null,
        district_id: formData.district_id || null,
        subdivision_id: formData.subdivision_id || null,
        product_id: formData.product_id || null, // Included for Dealer role
        category_id: formData.category_id || null, // Added for Category Specialization
        referral_code_used: formData.referral_code_used || null,
        ...(needsInstallmentModal && {
          investment_amount: totalInvestment,
          installment_count: parseInt(installmentData.installment_count),
          installment_amounts: customAmounts.map((v) => parseFloat(v)),
        }),
      });

      toast({
        title: "Registration Successful",
        description: data.message || "Your account is pending admin approval.",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Unable to register. Please check if backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="border-t-4 border-t-primary shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-1">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-black">Account Type & Region</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Select Your Role</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: "businessman", label: "Businessman", icon: UserPlus },
                      { value: "core_body", label: "Corebody/Dealer", icon: Briefcase },
                    ].map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleRoleChange(role.value)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 text-left group",
                          (formData.role_code === role.value || (role.value === "businessman" && formData.role_code === "stock_point"))
                            ? "border-primary bg-primary/5 ring-2 ring-primary/5"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg shrink-0",
                          (formData.role_code === role.value || (role.value === "businessman" && formData.role_code === "stock_point")) ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-500"
                        )}>
                          <role.icon className="h-4 w-4" />
                        </div>
                        <span className={cn("text-sm font-black truncate", (formData.role_code === role.value || (role.value === "businessman" && formData.role_code === "stock_point")) ? "text-primary" : "text-slate-900")}>{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.role_code && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    {(formData.role_code === "businessman" || formData.role_code === "stock_point") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="businessman_type" className="text-[10px] font-bold uppercase text-slate-400">Businessman Type</Label>
                        <Select value={formData.businessman_type} onValueChange={handleBusinessmanTypeChange}>
                          <SelectTrigger id="businessman_type" className="h-10 border-slate-200 rounded-lg font-bold text-sm">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg font-medium">
                            <SelectItem value="retailer_a">Retailer A (Investment)</SelectItem>
                            <SelectItem value="retailer_b">Retailer B (Non-Investment)</SelectItem>
                            <SelectItem value="stock_point">Stock Point Partner</SelectItem>
                            <SelectItem value="businessman">General Businessman</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.role_code === "stock_point" && (
                      <div className="col-span-1 md:col-span-2">
                         <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100 text-yellow-800 text-xs font-medium">
                            Stock Point Partners are responsible for local fulfillment and B2C marketplace operations in a specific district/subdivision.
                         </div>
                      </div>
                    )}

                    {formData.role_code === "core_body" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="core_body_type" className="text-[10px] font-bold uppercase text-slate-400">Partner Type</Label>
                        <Select value={formData.core_body_type} onValueChange={handleCoreBodyTypeChange}>
                          <SelectTrigger id="core_body_type" className="h-10 border-slate-200 rounded-lg font-bold text-sm">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg font-medium">
                            <SelectItem value="core_body_a">Core Body A (District)</SelectItem>
                            <SelectItem value="core_body_b">Core Body B (Regional)</SelectItem>
                            <SelectItem value="dealer">Subdivision Dealer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="district" className="text-[10px] font-bold uppercase text-slate-400">District</Label>
                      <Select value={formData.district_id} onValueChange={handleDistrictChange}>
                        <SelectTrigger id="district" className="h-10 border-slate-200 rounded-lg font-bold text-sm">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg font-medium">
                          {districts.map((d) => (
                            <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(formData.role_code === "businessman" || formData.role_code === "stock_point" || formData.core_body_type === "dealer") && formData.district_id && (
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <Label htmlFor="subdivision" className="text-[10px] font-bold uppercase text-slate-400">Subdivision / Area</Label>
                        <Select value={formData.subdivision_id} onValueChange={handleSubdivisionChange}>
                          <SelectTrigger id="subdivision" className="h-10 border-slate-200 rounded-lg font-bold text-sm">
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg font-medium">
                            {subdivisions.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.core_body_type === "dealer" && formData.subdivision_id && (
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <Label htmlFor="product" className="text-[10px] font-bold uppercase text-slate-400">Assigned Specialization (Category / Sub-category)</Label>
                        <Select 
                          value={formData.category_id || formData.product_id} 
                          onValueChange={(val) => setFormData(p => ({ ...p, category_id: val, product_id: "" }))}
                        >
                          <SelectTrigger id="product" className="h-10 border-slate-200 rounded-lg font-bold text-sm">
                            <SelectValue placeholder="Select Specialization" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg font-medium">
                            {categories.map((c) => (
                              <SelectItem 
                                key={c.id} 
                                value={c.id.toString()} 
                              >
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[9px] text-slate-400 font-medium">
                          Note: You can choose a full category or a specific sub-category from the list.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-1">
                  <User className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg font-black">Personal Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name" className="text-[10px] font-bold uppercase text-slate-400">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input id="full_name" name="full_name" required className="pl-10 h-10 border-slate-200 rounded-lg text-sm" placeholder="Full Name" value={formData.full_name} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-[10px] font-bold uppercase text-slate-400">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input id="phone" name="phone" required className="pl-10 h-10 border-slate-200 rounded-lg text-sm" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <Label htmlFor="email" className="text-[10px] font-bold uppercase text-slate-400">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input id="email" name="email" type="email" required className="pl-10 h-10 border-slate-200 rounded-lg text-sm" placeholder="Email Address" value={formData.email} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <Label htmlFor="referral_code_used" className="text-[10px] font-bold uppercase text-slate-400">Referral Code (Optional)</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input id="referral_code_used" name="referral_code_used" className="pl-10 h-10 border-slate-200 rounded-lg text-sm" placeholder="Referral Code" value={formData.referral_code_used} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <Card className="border-t-4 border-t-indigo-500 shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-1">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-xl font-black">Security Credentials</CardTitle>
              </div>
              <CardDescription className="font-medium">Secure your account with a strong password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase text-slate-500">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password" name="password" required
                      type={showPassword ? "text" : "password"}
                      className="pl-12 pr-12 h-12 border-slate-200 rounded-xl font-medium" placeholder="At least 8 characters"
                      value={formData.password} onChange={handleInputChange}
                    />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase text-slate-500">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="confirmPassword" name="confirmPassword" required
                      type={showConfirmPassword ? "text" : "password"}
                      className="pl-12 pr-12 h-12 border-slate-200 rounded-xl font-medium" placeholder="Repeat password"
                      value={formData.confirmPassword} onChange={handleInputChange}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Passwords do not match
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-t-4 border-t-emerald-500 shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-1">
                <FileCheck className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-xl font-black">KYC Documents</CardTitle>
              </div>
              <CardDescription className="font-medium">
                {isKycMandatory 
                  ? "Required for your selected role. Please upload clear document photos." 
                  : "Optional for basic accounts. You can add these later in settings."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              {/* Identity Proof */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                    Identity Proof {isKycMandatory && <span className="text-red-500">*</span>}
                  </Label>
                  <Select value={kycDocs.identityType} onValueChange={(val) => setKycDocs(p => ({ ...p, identityType: val }))}>
                    <SelectTrigger className="w-[140px] h-8 text-xs font-bold border-slate-200">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="voter_id">Voter ID Card</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className={cn(
                  "relative group rounded-2xl border-2 border-dashed transition-all duration-300 p-8 flex flex-col items-center justify-center gap-3",
                  kycDocs.identityUrl ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-emerald-500/50 bg-slate-50/50"
                )}>
                  {kycDocs.identityUrl ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Check className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-bold text-emerald-700">Identity Document Uploaded</p>
                      <Button variant="ghost" size="sm" className="text-red-500 font-bold" onClick={() => setKycDocs(p => ({ ...p, identityUrl: "" }))}>Change File</Button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-white text-slate-400 flex items-center justify-center shadow-sm border border-slate-100">
                        {uploading['identityUrl'] ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <Upload className="h-8 w-8" />}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">Click to upload photo or PDF</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">MAX SIZE 5MB</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => handleFileUpload(e, 'identityUrl')}
                        disabled={uploading['identityUrl']}
                      />
                    </>
                  )}
                  {uploading['identityUrl'] && (
                    <div className="absolute inset-x-8 bottom-4">
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress['identityUrl']}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* PAN Card Upload */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-slate-500">PAN Card {isKycMandatory && "*"}</Label>
                  <div className={cn(
                    "relative p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center gap-2",
                    kycDocs.panUrl ? "border-emerald-200 bg-emerald-50/30 text-emerald-600" : "border-slate-200 hover:border-emerald-500/50 bg-slate-50/50"
                  )}>
                    {kycDocs.panUrl ? <Check className="h-5 w-5" /> : uploading['panUrl'] ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <ImageIcon className="h-5 w-5 text-slate-400" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{kycDocs.panUrl ? "Uploaded" : uploading['panUrl'] ? `${uploadProgress['panUrl']}%` : "PAN Photo"}</span>
                    {!kycDocs.panUrl && (
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'panUrl')} disabled={uploading['panUrl']} />
                    )}
                    {kycDocs.panUrl && <button className="text-[8px] font-black text-red-500 uppercase mt-1" onClick={() => setKycDocs(p => ({ ...p, panUrl: "" }))}>Clear</button>}
                  </div>
                </div>

                {/* Bank Account Upload */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-slate-500">Bank Passbook (1st Page) {isKycMandatory && "*"}</Label>
                  <div className={cn(
                    "relative p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center gap-2",
                    kycDocs.bankUrl ? "border-emerald-200 bg-emerald-50/30 text-emerald-600" : "border-slate-200 hover:border-emerald-500/50 bg-slate-50/50"
                  )}>
                    {kycDocs.bankUrl ? <Check className="h-5 w-5" /> : uploading['bankUrl'] ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <CreditCard className="h-5 w-5 text-slate-400" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{kycDocs.bankUrl ? "Uploaded" : uploading['bankUrl'] ? `${uploadProgress['bankUrl']}%` : "Bank Proof"}</span>
                    {!kycDocs.bankUrl && (
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'bankUrl')} disabled={uploading['bankUrl']} />
                    )}
                    {kycDocs.bankUrl && <button className="text-[8px] font-black text-red-500 uppercase mt-1" onClick={() => setKycDocs(p => ({ ...p, bankUrl: "" }))}>Clear</button>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="border-t-4 border-t-orange-500 shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden">
               <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-1">
                  <UserCheck className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-xl font-black">Final Review</CardTitle>
                </div>
                <CardDescription className="font-medium">Please confirm your account configuration before submitting.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Role</p>
                    <p className="text-sm font-bold text-slate-900 capitalize">{formData.role_code?.replace('_', ' ')}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Type</p>
                    <p className="text-sm font-bold text-slate-900 capitalize">{formData.businessman_type || formData.core_body_type || 'Customer'}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 col-span-2">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Operating Area</p>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">
                      {districts.find(d => d.id.toString() === formData.district_id)?.name || 'N/A'}
                      {formData.subdivision_id && ` / ${subdivisions.find(s => s.id.toString() === formData.subdivision_id)?.name}`}
                    </p>
                  </div>
                  {formData.core_body_type === "dealer" && (
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 col-span-2 md:col-span-4">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Product Specialization</p>
                      <p className="text-sm font-bold text-slate-900">
                        {dealerRoutedProducts.find(p => p.id === formData.product_id)?.name || 
                         categories.find(c => c.id.toString() === formData.category_id)?.name || 
                         'N/A'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Ready to create your account</p>
                    <p className="text-xs text-slate-500 font-medium">By clicking "Create Account", you agree to our terms and conditions for {formData.role_code} registration.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Section integration if required */}
            {needsInstallmentModal && (
              <Card className="border-t-4 border-t-blue-600 shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                 <CardHeader className="bg-blue-50/30 pb-6 border-b border-blue-100/50">
                    <div className="flex items-center gap-3 mb-1">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl font-black">Investment Settings</CardTitle>
                    </div>
                    <CardDescription className="text-blue-700 font-bold">
                      Required for {isRetailerA ? "Retailer A" : formData.core_body_type === "core_body_a" ? "Core Body A" : "Core Body B"}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Total Investment Amount (₹)</Label>
                        <Input
                          type="number"
                          placeholder="E.g. 1,00,000"
                          value={installmentData.investment_amount}
                          onChange={(e) => {
                            const newTotal = parseFloat(e.target.value) || 0;
                            setInstallmentData((prev) => ({ ...prev, investment_amount: e.target.value }));
                            const count = parseInt(installmentData.installment_count);
                            if (newTotal > 0) {
                              const equal = (newTotal / count).toFixed(2);
                              setCustomAmounts(Array(count).fill(equal));
                            } else {
                              setCustomAmounts(Array(count).fill(""));
                            }
                          }}
                          disabled={formData.core_body_type === "core_body_a"}
                          className="h-12 border-slate-200 rounded-xl font-black text-xl disabled:bg-slate-100/50 text-blue-600 disabled:text-slate-600"
                        />
                        {formData.core_body_type === "core_body_a" && <p className="text-[10px] text-slate-400 font-bold uppercase">Fixed for Core Body A</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Installment Count</Label>
                        <Select value={installmentData.installment_count} onValueChange={handleInstallmentCountChange}>
                          <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="font-bold">
                           <SelectItem value="1">Full Payment (1)</SelectItem>
                           <SelectItem value="2">2 Installments</SelectItem>
                           <SelectItem value="3">3 Installments</SelectItem>
                           <SelectItem value="4">4 Installments</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {totalInvestment > 0 && (
                      <div className="pt-4 space-y-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Breakdown</Label>
                          <span className={cn("text-xs font-black uppercase px-2 py-1 rounded-full", Math.abs(remaining) < 0.01 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                            {Math.abs(remaining) < 0.01 ? "Balanced" : remaining > 0 ? `₹${remaining} more needed` : `₹${Math.abs(remaining)} extra`}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {customAmounts.map((amt, i) => (
                            <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-400 w-8">#{i+1}</span>
                              <Input 
                                type="number" 
                                value={amt} 
                                onChange={(e) => handleCustomAmountChange(i, e.target.value)}
                                className="h-8 border-none bg-transparent font-bold focus-visible:ring-0 px-0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Role & Location Validation
        const isRoleValid = formData.role_code === "businessman" 
          ? !!formData.businessman_type && !!formData.district_id 
          : formData.role_code === "core_body" 
            ? !!formData.core_body_type && !!formData.district_id && (formData.core_body_type !== "dealer" || !!formData.subdivision_id)
            : !!formData.role_code;
        
        // Personal Details Validation
        const isPersonalValid = !!formData.full_name && !!formData.phone && !!formData.email;
        
        return isRoleValid && isPersonalValid;
      case 2:
        return !!formData.password && !!formData.confirmPassword && (formData.password === formData.confirmPassword);
      case 3:
        if (isKycMandatory) {
          return !!kycDocs.identityUrl && !!kycDocs.panUrl && !!kycDocs.bankUrl;
        }
        return true;
      case 4:
        // Final review should also validate balanced investment if needed
        if (needsInstallmentModal) {
          return isCustomValid;
        }
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-20 space-y-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Join FTS Platform</h2>
          <p className="text-slate-500 font-medium">Create your professional account in a few simple steps</p>
        </div>

        {/* Stepper Navigation */}
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center group shrink-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  currentStep >= step.id 
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "border-slate-200 text-slate-400 bg-white"
                )}>
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <div className="hidden sm:block text-left">
                  <p className={cn("text-xs font-bold leading-none mb-1", currentStep >= step.id ? "text-slate-900" : "text-slate-400")}>{step.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{step.description}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  "w-8 md:w-12 h-[2px] mx-4 rounded-full transition-colors duration-500",
                  currentStep > step.id ? "bg-primary" : "bg-slate-200"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mt-8">
          {renderStepContent()}
        </div>

        <div className="text-center pt-10">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <a href="/login" className="font-bold text-primary hover:underline transition-all">Sign In</a>
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur-lg z-50 py-4 px-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleBack} 
            disabled={currentStep === 1}
            className="font-bold gap-2 text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
             <Button 
              variant="outline" 
              type="button" 
              onClick={() => navigate("/login")}
              className="font-bold border-slate-200"
            >
              Cancel
            </Button>
             
             {currentStep < 4 ? (
               <Button 
                type="button" 
                onClick={handleNext} 
                disabled={!canProceed()}
                className="font-bold gap-2 px-8 shadow-lg shadow-primary/20"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
             ) : (
               <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={!canProceed() || isLoading} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-10 shadow-xl shadow-primary/30"
              >
                 {isLoading ? (
                   <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                    Creating Account...
                   </>
                 ) : (
                   <>
                    <UserCheck className="h-4 w-4 mr-2" /> 
                    Create Account
                   </>
                 )}
               </Button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
