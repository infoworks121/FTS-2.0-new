import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus } from "lucide-react";

export default function SelectRole() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [roleCode, setRoleCode] = useState("businessman");
  
  const googleData = location.state?.googleData;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/google/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleData.email,
          full_name: googleData.name,
          role_code: roleCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Registration Successful",
        description: `Welcome ${data.user.full_name}`,
      });

      // Redirect based on role
      switch (data.user.role_code) {
        case "admin":
          navigate("/admin");
          break;
        case "core_body":
        case "core_body_a":
        case "core_body_b":
        case "dealer":
          navigate("/corebody");
          break;
        case "businessman":
          navigate("/businessman");
          break;
        case "stock_point":
          navigate("/stockpoint");
          break;
        case "customer":
          navigate("/");
          break;
        default:
          navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!googleData) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Select Your Role</h2>
          <p className="text-slate-500">
            Welcome, <strong>{googleData.name}</strong>
          </p>
          <p className="text-sm text-slate-400">{googleData.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="space-y-2">
            <Label htmlFor="role_code">Register As</Label>
            <Select value={roleCode} onValueChange={setRoleCode}>
              <SelectTrigger id="role_code">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="businessman">Businessman</SelectItem>
                <SelectItem value="stock_point">Stock Point Partner</SelectItem>
                <SelectItem value="core_body">Core Body / Dealer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Completing Registration...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span>Complete Registration</span>
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
