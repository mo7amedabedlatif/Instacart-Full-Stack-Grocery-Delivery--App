import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

interface WishlistItem {
  productId: string;
  addedAt: number;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  isFavorited: (productId: string) => boolean;
  addToWishlist: (productId: string, productName: string) => void;
  removeFromWishlist: (productId: string, productName: string) => void;
  toggleWishlist: (productId: string, productName: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("app_wishlist_v1");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      setWishlist([]);
    }
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("app_wishlist_v1", JSON.stringify(wishlist));
  }, [wishlist]);

  const isFavorited = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const addToWishlist = (productId: string, productName: string) => {
    if (!isFavorited(productId)) {
      setWishlist((prev) => [
        ...prev,
        { productId, addedAt: Date.now() },
      ]);
      toast.success(`✓ تم إضافة "${productName}" للمفضلات!`, {
        icon: "❤️",
      });
    }
  };

  const removeFromWishlist = (productId: string, productName: string) => {
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
    toast.success(`تم إزالة "${productName}" من المفضلات`, {
      icon: "💔",
    });
  };

  const toggleWishlist = (productId: string, productName: string) => {
    if (isFavorited(productId)) {
      removeFromWishlist(productId, productName);
    } else {
      addToWishlist(productId, productName);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isFavorited,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
