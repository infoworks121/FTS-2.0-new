import { useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Phone, Mail, Lock, ArrowRight, ChevronLeft, Eye, EyeOff, Loader2, Leaf, Sprout, Tractor } from "lucide-react";
=======
import { Phone, Mail, Lock, ArrowRight, ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react";
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [method, setMethod] = useState<"phone" | "email">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validateEmail = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePhone = () => {
    const errs: Record<string, string> = {};
    if (!phone.trim()) errs.phone = "Phone number is required";
    else if (!/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ""))) errs.phone = "Invalid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEmailLogin = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
<<<<<<< HEAD
    if (error) { toast.error(error.message); return; }
=======
    if (error) {
      toast.error(error.message);
      return;
    }
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
    toast.success("Login successful!");
    navigate("/marketplace");
  };

  const sendOTP = async () => {
    if (!validatePhone()) return;
    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\s/g, "")}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    setLoading(false);
<<<<<<< HEAD
    if (error) { toast.error(error.message); return; }
=======
    if (error) {
      toast.error(error.message);
      return;
    }
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
    setOtpSent(true);
    setCountdown(60);
    const interval = setInterval(() => setCountdown(prev => {
      if (prev <= 1) { clearInterval(interval); return 0; }
      return prev - 1;
    }), 1000);
    toast.success("OTP sent to " + formattedPhone);
  };

  const verifyOTP = async () => {
    const otpCode = otp.join("");
<<<<<<< HEAD
    if (otpCode.length !== 6) { toast.error("Please enter the complete OTP"); return; }
=======
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete OTP");
      return;
    }
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\s/g, "")}`;
    const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otpCode, type: "sms" });
    setLoading(false);
<<<<<<< HEAD
    if (error) { toast.error(error.message); return; }
=======
    if (error) {
      toast.error(error.message);
      return;
    }
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
    toast.success("Login successful!");
    navigate("/marketplace");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
<<<<<<< HEAD
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  return (
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
            <h2 className="text-4xl font-bold text-white mb-3 leading-tight">Farm & Tech<br />Services</h2>
            <p className="text-green-200 text-lg leading-relaxed">Your trusted marketplace for agricultural products and services</p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            {["Quality Farm Products", "Trusted Suppliers", "Doorstep Delivery"].map(feat => (
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
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">Farm & Tech Services</h1>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your FTS account</p>
          </div>

          {!otpSent ? (
            <div className="space-y-5">
              {/* Method Tabs */}
              <div className="flex gap-1 p-1 bg-muted rounded-xl">
                <button
                  onClick={() => { setMethod("email"); setErrors({}); }}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                    method === "email" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Mail className="h-4 w-4" /> Email
                </button>
                <button
                  onClick={() => { setMethod("phone"); setErrors({}); }}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                    method === "phone" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Phone className="h-4 w-4" /> Phone
                </button>
              </div>

              {method === "email" ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground mb-1.5 block">Email Address</Label>
                    <Input type="email" placeholder="you@example.com" value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                      className={cn("rounded-xl h-12", errors.email && "border-destructive focus-visible:ring-destructive")} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label className="text-foreground mb-1.5 block">Password</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })); }}
                        className={cn("rounded-xl h-12 pr-11", errors.password && "border-destructive focus-visible:ring-destructive")} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                  </div>
                  <Button className="w-full rounded-xl h-12 text-base font-semibold" onClick={handleEmailLogin} disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-4 w-4 mr-2" /> Sign In</>}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground mb-1.5 block">Phone Number</Label>
                    <Input placeholder="+91 98765 43210" value={phone}
                      onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: "" })); }}
                      className={cn("rounded-xl h-12", errors.phone && "border-destructive focus-visible:ring-destructive")} />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  <Button className="w-full rounded-xl h-12 text-base font-semibold" onClick={sendOTP} disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4 ml-2" /></>}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <button onClick={() => { setOtpSent(false); setOtp(["", "", "", "", "", ""]); }}
                className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
                <ChevronLeft className="h-4 w-4" /> Change number
              </button>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit OTP sent to <strong className="text-foreground">{phone.startsWith("+") ? phone : `+91${phone}`}</strong>
              </p>
              <div className="flex gap-2.5 justify-center">
                {otp.map((digit, i) => (
                  <Input key={i} id={`otp-${i}`} maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl rounded-xl font-mono font-bold border-2 focus-visible:ring-primary" />
                ))}
              </div>
              <Button className="w-full rounded-xl h-12 text-base font-semibold" onClick={verifyOTP} disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Sign In"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                {countdown > 0
                  ? <span>Resend in <strong className="text-foreground">{countdown}s</strong></span>
                  : <button onClick={sendOTP} className="text-primary hover:underline font-semibold">Resend OTP</button>}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => navigate("/register")} className="text-primary hover:underline font-semibold">
                Create Account
              </button>
            </p>
          </div>
=======
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-primary-foreground font-bold text-xl">FTS</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-foreground mb-1">Welcome Back</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Sign in to your FTS account</p>

        {!otpSent ? (
          <div className="space-y-5">
            {/* Method Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl">
              <button
                onClick={() => { setMethod("email"); setErrors({}); }}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                  method === "email" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Mail className="h-4 w-4" /> Email
              </button>
              <button
                onClick={() => { setMethod("phone"); setErrors({}); }}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                  method === "phone" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Phone className="h-4 w-4" /> Phone
              </button>
            </div>

            {method === "email" ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground mb-1.5 block">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                    className={cn("rounded-xl h-12", errors.email && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label className="text-foreground mb-1.5 block">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })); }}
                      className={cn("rounded-xl h-12 pr-11", errors.password && "border-destructive focus-visible:ring-destructive")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </div>
                <Button className="w-full rounded-xl h-12 text-base font-semibold" onClick={handleEmailLogin} disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-4 w-4 mr-2" /> Sign In</>}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground mb-1.5 block">Phone Number</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: "" })); }}
                    className={cn("rounded-xl h-12", errors.phone && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <Button className="w-full rounded-xl h-12 text-base font-semibold" onClick={sendOTP} disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4 ml-2" /></>}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <button
              onClick={() => { setOtpSent(false); setOtp(["", "", "", "", "", ""]); }}
              className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Change number
            </button>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit OTP sent to <strong className="text-foreground">{phone.startsWith("+") ? phone : `+91${phone}`}</strong>
            </p>
            <div className="flex gap-2.5 justify-center">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  id={`otp-${i}`}
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl rounded-xl font-mono font-bold border-2 focus-visible:ring-primary"
                />
              ))}
            </div>
            <Button className="w-full rounded-xl h-12 text-base font-semibold" onClick={verifyOTP} disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Sign In"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {countdown > 0 ? (
                <span>Resend in <strong className="text-foreground">{countdown}s</strong></span>
              ) : (
                <button onClick={sendOTP} className="text-primary hover:underline font-semibold">Resend OTP</button>
              )}
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <button onClick={() => navigate("/register")} className="text-primary hover:underline font-semibold">
              Create Account
            </button>
          </p>
>>>>>>> 4d1cdb2e60a0103838b2143300cf1d4f08432f33
        </div>
      </div>
    </div>
  );
}
