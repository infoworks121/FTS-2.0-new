import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { cartApi, CartItem } from "@/lib/cartApi";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  totalItems: number;
  totalCost: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data = await cartApi.getCart();
      setItems(data.items || []);
    } catch (error: any) {
      console.error("Failed to fetch cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (newItem: CartItem) => {
    try {
      const existingItem = items.find((item) => item.id === newItem.id);
      
      if (existingItem && (existingItem.quantity + newItem.quantity > newItem.stock)) {
          toast({
            title: "Cannot Add To Cart",
            description: `Only ${newItem.stock} items left in stock.`,
            variant: "destructive",
          });
          return;
      }

      await cartApi.addToCart(newItem.id, newItem.quantity);
      await fetchCart(); // Refetch to get updated state from DB
      
      toast({
        title: existingItem ? "Cart Updated" : "Added to Cart",
        description: `${newItem.name} added to your cart.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add to cart.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      await cartApi.removeFromCart(id);
      await fetchCart();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to remove item.", variant: "destructive" });
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const item = items.find(i => i.id === id);
      if (item && quantity > item.stock) {
        toast({
          title: "Stock Limit Reached",
          description: `Cannot exceed available stock of ${item.stock}.`,
          variant: "destructive",
        });
        quantity = item.stock;
      }
      
      await cartApi.updateQuantity(id, Math.max(1, quantity));
      await fetchCart();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update quantity.", variant: "destructive" });
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      setItems([]);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to clear cart.", variant: "destructive" });
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart,
        totalItems,
        totalCost,
        isCartOpen,
        setIsCartOpen,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
