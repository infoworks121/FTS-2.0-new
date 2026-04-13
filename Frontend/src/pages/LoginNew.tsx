import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginNew() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    panel: "businessman",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePanelChange = (value: string) => {
    setFormData((prev) => ({ ...prev, panel: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
          panel: formData.panel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Simple alert instead of toast
      alert(`Welcome ${data.user.full_name}`);

      // Navigate based on role
      switch (data.user.role_code) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "core_body":
        case "core_body_a":
        case "core_body_b":
          navigate("/corebody", { replace: true });
          break;
        case "dealer":
          navigate("/dealer", { replace: true });
          break;
        case "businessman":
          navigate("/businessman", { replace: true });
          break;
        case "stock_point":
          navigate("/stockpoint", { replace: true });
          break;
        case "customer":
          navigate("/", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (error: any) {
      alert(`Login Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center text-white p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' }}>
        <div className="absolute inset-0 opacity-90 z-0" style={{ background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' }}></div>
        {/* Decorative Circles */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl z-0"></div>

        <div className="relative z-10 text-center max-w-lg space-y-6">
          <div className="flex justify-center mb-8">
            <img src="/fts-logo.jpeg" alt="FTS Logo" className="w-20 h-20 rounded-2xl" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Farm & Tech Service</h1>
          <p className="text-lg text-primary-100">
            Enterprise Distribution & Supply Chain Backbone. Manage your inventory, dealers, and regional distribution efficiently.
          </p>
          <div className="pt-8 flex justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span className="text-sm font-medium">Secure Access</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="text-sm font-medium">Role-based Routing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="text-slate-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="panel">Login As (Panel)</Label>
                <Select value={formData.panel} onValueChange={handlePanelChange}>
                  <SelectTrigger id="panel" className="w-full">
                    <SelectValue placeholder="Select your panel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">System Admin</SelectItem>
                    <SelectItem value="core_body">Core Body / Dealer</SelectItem>
                    <SelectItem value="businessman">Businessman</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Dealers should login via Core Body panel</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    className="pl-10 h-12"
                    placeholder="Enter your email or phone"
                    value={formData.identifier}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-sm font-medium text-primary hover:text-primary-700">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="pl-10 h-12"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={() => navigate("/register")}
                className="font-semibold text-primary hover:text-primary-700 cursor-pointer"
              >
                Create New Account
              </button>
            </p>
            <p className="text-xs text-slate-400">
              Protected by enterprise-grade security. By logging in, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}