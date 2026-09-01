import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "../types";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  hasCartItems: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "app_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      console.warn("Failed to parse cart from localStorage");
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("Failed to save cart to localStorage:", err);
    }
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    // Validate inputs
    if (!product || !product.id || quantity <= 0) return;
    
    // Warn if quantity exceeds stock
    if (quantity > product.stock) {
      console.warn(`Requested quantity (${quantity}) exceeds available stock (${product.stock})`);
    }
    
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const maxQuantity = product.stock || 1;
      
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, maxQuantity);
        return prev.map((item) =>
          item.product.id === product.id
            ? { 
                ...item, 
                quantity: newQuantity
              }
            : item,
        );
      }
      
      return [...prev, { 
        product, 
        quantity: Math.min(quantity, maxQuantity) 
      }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    if (!productId) return;
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (!productId || quantity < 0) return;
    
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId 
          ? { 
              ...item, 
              quantity: Math.min(quantity, item.product.stock || 999)
            } 
          : item,
      ),
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsCartOpen(false);
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const hasCartItems = items.length > 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        hasCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
