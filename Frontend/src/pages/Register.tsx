import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Mail, Lock, Phone, User, X, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
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
    district: "",
    referral_code_used: searchParams.get("ref") || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role_code: value, core_body_type: "", businessman_type: "", district: "" }));
  };

  const handleCoreBodyTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, core_body_type: value, district: "" }));
  };

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
    setFormData((prev) => ({ ...prev, businessman_type: value }));
  };

  const handleDistrictChange = (value: string) => {
    setFormData((prev) => ({ ...prev, district: value }));
  };

  const isCoreBodyWithInvestment =
    formData.role_code === "core_body" &&
    (formData.core_body_type === "core_body_a" || formData.core_body_type === "core_body_b");

  const isRetailerA =
    formData.role_code === "businessman" && formData.businessman_type === "retailer_a";

  const needsInstallmentModal = isCoreBodyWithInvestment || isRetailerA;

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
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
      if ((formData.core_body_type === "core_body_a" || formData.core_body_type === "core_body_b") && !formData.district) {
        toast({
          title: "Validation Error",
          description: "Please select a district",
          variant: "destructive",
        });
        return;
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

    // Show installment modal for Core Body A/B or Retailer A
    if (needsInstallmentModal) {
      setShowInstallmentModal(true);
      return;
    }

    await submitRegistration();
  };

  const submitRegistration = async () => {
    if (formData.core_body_type === "core_body_b") {
      if (totalInvestment < 50000 || totalInvestment > 250000) {
        toast({
          title: "Invalid Investment",
          description: "Core Body B investment must be between ₹50,000 and ₹250,000.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    setShowInstallmentModal(false);

    try {
      const { data } = await api.post('/auth/register', {
        phone: formData.phone,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role_code: formData.role_code === "core_body" ? formData.core_body_type : formData.role_code,
        businessman_type: formData.businessman_type || null,
        district: formData.district || null,
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h2>
          <p className="text-slate-500 text-sm">Register to access the FTS platform</p>
        </div>

        {/* Installment Modal */}
        {showInstallmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Investment & Installment</h3>
                <button onClick={() => setShowInstallmentModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-500">
                Registering as <span className="font-semibold text-slate-700">
                  {isRetailerA ? "Retailer A" : formData.core_body_type === "core_body_a" ? "Core Body A" : "Core Body B"}
                </span>. Enter total investment and set each installment amount.
              </p>

              <div className="space-y-2">
                <Label>Total Investment Amount (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 100000"
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
                  className="h-11 disabled:bg-gray-100 disabled:opacity-100 disabled:text-gray-700"
                />
                {formData.core_body_type === "core_body_a" && (
                  <p className="text-xs text-slate-500 mt-1">Fixed at ₹1,00,000 for Core Body A</p>
                )}
                {formData.core_body_type === "core_body_b" && (
                  <p className={`text-xs mt-1 ${totalInvestment < 50000 || totalInvestment > 250000 ? "text-red-500 font-medium" : "text-green-600"}`}>
                    {totalInvestment < 50000 || totalInvestment > 250000 
                      ? "Amount must be between ₹50,000 and ₹2,50,000" 
                      : "✓ Valid amount"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Number of Installments</Label>
                <Select value={installmentData.installment_count} onValueChange={handleInstallmentCountChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Installment (Full Payment)</SelectItem>
                    <SelectItem value="2">2 Installments</SelectItem>
                    <SelectItem value="3">3 Installments</SelectItem>
                    <SelectItem value="4">4 Installments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {totalInvestment > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Installment Amounts (₹)</Label>
                    <span className={`text-xs font-medium ${Math.abs(remaining) < 0.01 ? "text-green-600" : "text-red-500"}`}>
                      {Math.abs(remaining) < 0.01 ? "✓ Balanced" : remaining > 0 ? `₹${remaining} remaining` : `₹${Math.abs(remaining)} over`}
                    </span>
                  </div>

                  {customAmounts.map((amt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-slate-500 w-24 shrink-0">Installment {i + 1}</span>
                      <Input
                        type="number"
                        min="1"
                        placeholder="₹ Amount"
                        value={amt}
                        onChange={(e) => handleCustomAmountChange(i, e.target.value)}
                        className="h-10"
                      />
                    </div>
                  ))}

                  <div className="bg-slate-50 rounded-xl p-3 flex justify-between text-sm font-semibold text-slate-800">
                    <span>Total</span>
                    <span className={customTotal > totalInvestment ? "text-red-500" : "text-slate-800"}>
                      ₹{customTotal.toLocaleString()} / ₹{totalInvestment.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setShowInstallmentModal(false)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!isCustomValid || isLoading || (formData.core_body_type === "core_body_b" && (totalInvestment < 50000 || totalInvestment > 250000))}
                  onClick={submitRegistration}
                >
                  {isLoading ? "Creating..." : "Confirm & Register"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">

          {/* Section: Account Type */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Account Type</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role_code">Register As</Label>
                <Select value={formData.role_code} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role_code" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="businessman">Businessman</SelectItem>
                    <SelectItem value="core_body">Core Body / Dealer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role_code === "businessman" && (
                <div className="space-y-2">
                  <Label htmlFor="businessman_type">Businessman Type</Label>
                  <Select value={formData.businessman_type} onValueChange={handleBusinessmanTypeChange}>
                    <SelectTrigger id="businessman_type" className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retailer_a">Retailer A</SelectItem>
                      <SelectItem value="retailer_b">Retailer B</SelectItem>
                      <SelectItem value="businessman">Businessman</SelectItem>
                      <SelectItem value="stock_point">Stock Point</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.role_code === "core_body" && (
                <div className="space-y-2">
                  <Label htmlFor="core_body_type">Core Body Type</Label>
                  <Select value={formData.core_body_type} onValueChange={handleCoreBodyTypeChange}>
                    <SelectTrigger id="core_body_type" className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="core_body_a">Core Body A</SelectItem>
                      <SelectItem value="core_body_b">Core Body B</SelectItem>
                      <SelectItem value="dealer">Dealer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {formData.role_code === "core_body" && (formData.core_body_type === "core_body_a" || formData.core_body_type === "core_body_b") && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="district">District (West Bengal)</Label>
                <Select value={formData.district} onValueChange={handleDistrictChange}>
                  <SelectTrigger id="district" className="h-11">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Alipurduar","Bankura","Birbhum","Cooch Behar","Dakshin Dinajpur","Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram","Kalimpong","Kolkata","Malda","Murshidabad","Nadia","North 24 Parganas","Paschim Bardhaman","Paschim Medinipur","Purba Bardhaman","Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"].map((d) => (
                      <SelectItem key={d} value={d.toLowerCase().replace(/ /g, "_")}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Section: Personal Info */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Personal Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="full_name" name="full_name" required className="pl-9 h-11" placeholder="Your full name" value={formData.full_name} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="phone" name="phone" required className="pl-9 h-11" placeholder="Phone number" value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="email" name="email" type="email" required className="pl-9 h-11" placeholder="Email address" value={formData.email} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="referral_code_used">Referral Code (Optional)</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="referral_code_used" name="referral_code_used" type="text" className="pl-9 h-11 uppercase" placeholder="e.g. FTS123ABC" value={formData.referral_code_used} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Password */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Security</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password" name="password" required
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10 h-11" placeholder="Create password"
                    value={formData.password} onChange={handleInputChange}
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword" name="confirmPassword" required
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-9 pr-10 h-11" placeholder="Confirm password"
                    value={formData.confirmPassword} onChange={handleInputChange}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((p) => !p)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating Account...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span>Create Account</span>
              </div>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-primary hover:text-primary-700">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
}
