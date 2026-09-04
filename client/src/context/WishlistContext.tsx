import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

interface WishlistItem {
  productId: string;
  addedAt: number;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("app_wishlist_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
    } catch (error) {
      console.warn("Failed to load wishlist from localStorage:", error);
    }
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem("app_wishlist_v1", JSON.stringify(wishlist));
    } catch (error) {
      console.warn("Failed to save wishlist to localStorage:", error);
    }
  }, [wishlist]);

  const addToWishlist = (productId: string) => {
    setWishlist((prev) => {
      // Check if already in wishlist
      if (prev.some((item) => item.productId === productId)) {
        toast.success("موجود بالفعل في المفضلات! ❤️");
        return prev;
      }

      const updated = [...prev, { productId, addedAt: Date.now() }];
      toast.success("تمت الإضافة للمفضلات! ❤️");
      return updated;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      const updated = prev.filter((item) => item.productId !== productId);
      if (updated.length < prev.length) {
        toast.success("تمت الإزالة من المفضلات");
      }
      return updated;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlist.length,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
