import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { orderApi } from "@/lib/orderApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export function CartSheet() {
  const { items, totalItems, totalCost, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const [isCheckout, setIsCheckout] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pin, setPin] = useState("");

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    // Instead of direct checkout, open PIN dialog
    setPinDialogOpen(true);
  };

  const confirmCheckout = async () => {
    if (pin.length !== 6) {
      toast({ title: "Invalid PIN", description: "Please enter a 6-digit PIN", variant: "destructive" });
      return;
    }

    try {
      setIsCheckout(true);
      const orderItems = items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      await orderApi.createB2BOrder({
        items: orderItems,
        payment_method: "wallet",
        transaction_pin: pin,
        notes: "Marketplace Cart Order",
      });

      toast({
        title: "Order Placed Successfully",
        description: `Your order for ${totalItems} items has been placed. Funds deducted from wallet.`,
      });

      clearCart();
      setIsCartOpen(false);
      setPinDialogOpen(false);
      setPin("");
    } catch (error: any) {
      toast({
        title: "Checkout Failed",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
      // Don't close dialog if PIN is wrong so they can retry
      if (error.response?.data?.error?.includes("PIN")) {
        setPin(""); // Clear it to let them try again
      } else {
        setPinDialogOpen(false);
      }
    } finally {
      setIsCheckout(false);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-slate-300" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Your cart is empty</p>
                <p className="text-sm">Add some products to get started.</p>
              </div>
              <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                Explore Marketplace
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-50 border flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <ShoppingCart className="h-8 w-8 text-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 line-clamp-2 leading-tight mb-1">{item.name}</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(item.basePrice)}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 bg-slate-50 border rounded-lg p-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-semibold w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2 h-8"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-6 border-t bg-slate-50 shrink-0 flex-col sm:flex-col gap-4">
            <div className="space-y-1.5 w-full">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-semibold text-slate-900">{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Total</span>
                <span className="text-lg font-bold text-slate-900">{formatCurrency(totalCost)}</span>
              </div>
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-sm font-bold shadow-lg shadow-emerald-500/20"
              onClick={handleCheckout}
              disabled={isCheckout}
            >
              {isCheckout && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Checkout & Pay
            </Button>
          </SheetFooter>
        )}
      </SheetContent>

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Transaction PIN</DialogTitle>
            <DialogDescription>
              Please enter your 6-digit transaction PIN to confirm the payment from your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Label htmlFor="pin-input">Transaction PIN</Label>
            <InputOTP
              id="pin-input"
              maxLength={6}
              value={pin}
              onChange={setPin}
              disabled={isCheckout}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPinDialogOpen(false)}
              disabled={isCheckout}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmCheckout}
              disabled={pin.length !== 6 || isCheckout}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isCheckout ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
