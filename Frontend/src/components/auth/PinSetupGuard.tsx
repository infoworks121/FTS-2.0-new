import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SetupPinModal } from "@/components/wallet/SetupPinModal";

export function PinSetupGuard({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkPin = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      
      // Do not block auth routes or public landing page
      const publicPages = ['/login', '/register', '/verify-email', '/auth/callback', '/'];
      const isPublicPage = publicPages.includes(location.pathname);
      
      if (token && userStr && !isPublicPage) {
        try {
          const user = JSON.parse(userStr);
          // Only show if missing/false, and exclude admin role from needing a transaction PIN
          if (user.role_code !== "admin" && !user.has_transaction_pin) {
            setShowModal(true);
            return;
          }
        } catch (e) {
          console.error("Error parsing user data in PinSetupGuard", e);
        }
      }
      setShowModal(false);
    };
    
    checkPin();
  }, [location.pathname]);

  return (
    <>
      {children}
      <SetupPinModal open={showModal} onSuccess={() => setShowModal(false)} />
    </>
  );
}
