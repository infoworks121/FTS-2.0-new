import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ShieldAlert, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface SetupPinModalProps {
  open: boolean;
  onSuccess: () => void;
}

export function SetupPinModal({ open, onSuccess }: SetupPinModalProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 6 || isNaN(Number(pin))) {
      toast({
        title: "Invalid PIN",
        description: "Your PIN must be exactly 6 digits.",
        variant: "destructive",
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "The confirmation PIN does not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/wallet/me/set-pin", { pin });
      
      // Update local storage user object
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.has_transaction_pin = true;
        localStorage.setItem("user", JSON.stringify(user));
      }

      toast({
        title: "Security PIN Set Successfully",
        description: "Your wallet is now secure. You can proceed with transactions.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Failed to set PIN",
        description: error.response?.data?.error || "A server error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Set Your Security PIN</DialogTitle>
          <DialogDescription className="text-center">
            For security reasons across the FTS platform, you must set a 6-digit transaction PIN. This PIN will be required for wallet and order transactions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">New 6-Digit PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6 digits"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
              className="text-center tracking-widest text-lg"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Confirm 6 digits"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ""))}
              className="text-center tracking-widest text-lg"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2 pt-4">
            <Button type="submit" className="w-full" disabled={isLoading || pin.length !== 6 || confirmPin.length !== 6}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set Security PIN
            </Button>
            <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={handleLogout} disabled={isLoading}>
              Sign out for now
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
