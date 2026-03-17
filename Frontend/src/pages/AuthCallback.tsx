import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      const user = JSON.parse(decodeURIComponent(userStr));
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      switch (user.role_code) {
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
        case "customer":
          navigate("/");
          break;
        default:
          navigate("/");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-slate-600">Signing you in...</p>
      </div>
    </div>
  );
}
