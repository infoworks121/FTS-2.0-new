import { useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, Eye, EyeOff, User, Leaf, Sprout, Tractor } from "lucide-react";
=======
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, Eye, EyeOff, Mail, User, MapPin, Lock } from "lucide-react";
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const totalSteps = 3;
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
<<<<<<< HEAD
=======
    state: "",
    district: "",
    city: "",
    pincode: "",
    referralCode: "",
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
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
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
<<<<<<< HEAD
        data: { full_name: form.fullName, phone: form.phone },
=======
        data: {
          full_name: form.fullName,
          phone: form.phone,
        },
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
<<<<<<< HEAD
    if (error) { toast.error(error.message); return; }
=======
    if (error) {
      toast.error(error.message);
      return;
    }
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
    toast.success("Account created! Please check your email to verify your account.");
    navigate("/login");
  };

  const stepIcons = [
    { icon: User, label: "Account" },
<<<<<<< HEAD
=======
    { icon: MapPin, label: "Location" },
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
    { icon: CheckCircle, label: "Finish" },
  ];

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0d3d20 0%, #1a6b3a 40%, #2d9e5e 75%, #3dbf74 100%)" }}>

        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #6ee7a0, transparent)" }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #a7f3d0, transparent)" }} />
        <div className="absolute top-1/2 left-[-40px] w-40 h-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ffffff, transparent)" }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Floating icons */}
        <div className="absolute top-16 right-16 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
          <Leaf className="h-6 w-6 text-green-200" />
        </div>
        <div className="absolute bottom-24 left-16 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
          <Sprout className="h-6 w-6 text-green-200" />
        </div>
        <div className="absolute top-1/3 right-10 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
          <Tractor className="h-5 w-5 text-green-200" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-12 space-y-6">
          <img src="/fts-logo.jpeg" alt="FTS Logo" className="w-24 h-24 rounded-3xl object-cover shadow-2xl mx-auto ring-4 ring-white/20" />
          <div>
            <h2 className="text-4xl font-bold text-white mb-3 leading-tight">Join FTS<br />Marketplace</h2>
            <p className="text-green-200 text-lg leading-relaxed">Start your journey with India's trusted farm & tech services platform</p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            {["Free Registration", "Exclusive Member Deals", "24/7 Support"].map(feat => (
              <div key={feat} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-green-300 flex-shrink-0" />
                <span className="text-white text-sm font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <img src="/fts-logo.jpeg" alt="FTS Logo" className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground">Create account</h1>
            <p className="text-muted-foreground mt-1">Join the FTS Marketplace today</p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-3">
            {stepIcons.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                    step > i + 1 ? "bg-primary text-primary-foreground" :
                    step === i + 1 ? "bg-primary/10 text-primary border-2 border-primary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <span className={cn("text-xs font-medium", step >= i + 1 ? "text-foreground" : "text-muted-foreground")}>
                    {s.label}
                  </span>
                </div>
                {i < stepIcons.length - 1 && (
                  <div className={cn("h-0.5 w-16 mb-4 rounded-full transition-all duration-300", step > i + 1 ? "bg-primary" : "bg-muted")} />
                )}
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
=======
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
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

<<<<<<< HEAD
          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-muted rounded-xl p-4 space-y-2.5">
                <h3 className="font-semibold text-foreground text-sm">Review Your Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground font-medium">{form.fullName}</span>
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground font-medium truncate">{form.email}</span>
                  {form.phone && <><span className="text-muted-foreground">Phone</span><span className="text-foreground font-medium">{form.phone}</span></>}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl h-12" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button className="flex-1 rounded-xl h-12 text-base font-semibold" onClick={handleRegister} disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-2" /> Create Account</>}
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-primary hover:underline font-semibold">
                Sign In
              </button>
            </p>
          </div>
=======
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
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
        </div>
      </div>
    </div>
  );
}
