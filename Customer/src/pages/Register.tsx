import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, Eye, EyeOff, Mail, User, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const totalSteps = 3;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    referralCode: "",
  });

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual backend API call
      signIn({ id: "user-" + Date.now(), email: form.email, name: form.fullName, phone: form.phone });
      toast.success("Account created successfully!");
      navigate("/marketplace");
    } catch (error: any) {
      toast.error(error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = [
    { icon: User, label: "Account" },
    { icon: MapPin, label: "Location" },
    { icon: CheckCircle, label: "Finish" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-primary-foreground font-bold text-xl">FTS</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-foreground mb-1">Create Account</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Join the FTS Marketplace</p>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-8 px-4">
          {stepIcons.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                step > i + 1 ? "bg-primary text-primary-foreground" :
                  step === i + 1 ? "bg-primary/10 text-primary border-2 border-primary" :
                    "bg-muted text-muted-foreground"
              )}>
                {step > i + 1 ? <CheckCircle className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className={cn("text-xs font-medium", step >= i + 1 ? "text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Account Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Full Name</Label>
              <Input placeholder="Rajesh Kumar" value={form.fullName} onChange={e => update("fullName", e.target.value)}
                className={cn("rounded-xl h-12", errors.fullName && "border-destructive")} />
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block">Email Address</Label>
              <Input type="email" placeholder="rajesh@example.com" value={form.email} onChange={e => update("email", e.target.value)}
                className={cn("rounded-xl h-12", errors.email && "border-destructive")} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={form.password}
                  onChange={e => update("password", e.target.value)}
                  className={cn("rounded-xl h-12 pr-11", errors.password && "border-destructive")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block">Confirm Password</Label>
              <Input type="password" placeholder="Re-enter password" value={form.confirmPassword}
                onChange={e => update("confirmPassword", e.target.value)}
                className={cn("rounded-xl h-12", errors.confirmPassword && "border-destructive")} />
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block">Phone (optional)</Label>
              <Input placeholder="+91 98765 43210" value={form.phone} onChange={e => update("phone", e.target.value)}
                className="rounded-xl h-12" />
            </div>
            <Button className="w-full rounded-xl h-12 text-base font-semibold" onClick={() => { if (validateStep1()) setStep(2); }}>
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">State</Label>
              <select value={form.state} onChange={e => update("state", e.target.value)}
                className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select State</option>
                <option>Madhya Pradesh</option><option>Maharashtra</option><option>Rajasthan</option>
                <option>Gujarat</option><option>Uttar Pradesh</option><option>Karnataka</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">District</Label>
              <Input placeholder="Enter district" value={form.district} onChange={e => update("district", e.target.value)}
                className="rounded-xl h-12" />
            </div>
            <div>
              <Label className="mb-1.5 block">City</Label>
              <Input placeholder="Enter city" value={form.city} onChange={e => update("city", e.target.value)}
                className="rounded-xl h-12" />
            </div>
            <div>
              <Label className="mb-1.5 block">Pincode</Label>
              <Input placeholder="452001" value={form.pincode} onChange={e => update("pincode", e.target.value)}
                className="rounded-xl h-12 font-mono" maxLength={6} />
            </div>
            <div>
              <Label className="mb-1.5 block">Referral Code (optional)</Label>
              <Input placeholder="Enter referral code" value={form.referralCode} onChange={e => update("referralCode", e.target.value)}
                className="rounded-xl h-12 font-mono uppercase" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl h-12" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 rounded-xl h-12 text-base font-semibold" onClick={() => setStep(3)}>
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-muted rounded-xl p-4 space-y-2.5">
              <h3 className="font-semibold text-foreground text-sm">Review Your Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="text-foreground font-medium">{form.fullName}</span>
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground font-medium truncate">{form.email}</span>
                {form.phone && <><span className="text-muted-foreground">Phone</span><span className="text-foreground font-medium">{form.phone}</span></>}
                {form.city && <><span className="text-muted-foreground">Location</span><span className="text-foreground font-medium">{form.city}{form.state ? `, ${form.state}` : ""}</span></>}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl h-12" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 rounded-xl h-12 text-base font-semibold" onClick={handleRegister} disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-2" /> Create Account</>}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-primary hover:underline font-semibold">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
