"use client";

import { CorporateMenuItem } from "@/types/menuItem";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface CartItem {
  item: CorporateMenuItem;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalPrice: number;
  addToCart: (item: CorporateMenuItem, quantity?: number) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  getTotalPrice: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// LocalStorage keys
const STORAGE_KEYS = {
  CART_ITEMS: "corporate_cart_items",
  ORDER_SUBMITTED: "corporate_order_submitted",
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [cartItems, setCartItemsState] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      // Check if order was submitted in previous session
      const orderSubmitted = localStorage.getItem(STORAGE_KEYS.ORDER_SUBMITTED);

      if (orderSubmitted === "true") {
        // Clear all cart data if order was submitted
        localStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
        localStorage.removeItem(STORAGE_KEYS.ORDER_SUBMITTED);

        // States are already initialized to empty values
        setIsHydrated(true);
        return;
      }

      const savedItems = localStorage.getItem(STORAGE_KEYS.CART_ITEMS);

      if (savedItems) {
        const items = JSON.parse(savedItems);
        setCartItemsState(items);
        calculateTotalPrice(items);
      }
    } catch (error) {
      console.error("Error loading cart data from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const calculateTotalPrice = (items: CartItem[]) => {
    const newTotalPrice = items.reduce((sum, { item, quantity }) => {
      const price = parseFloat(item.price?.toString() || "0");
      const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
      const itemPrice =
        item.isDiscount && discountPrice > 0 ? discountPrice : price;
      return sum + itemPrice * quantity;
    }, 0);
    setTotalPrice(newTotalPrice);
    return newTotalPrice;
  };

  const addToCart = (item: CorporateMenuItem, quantity: number = 1) => {
    setCartItemsState((prev) => {
      const existingIndex = prev.findIndex(
        (cartItem) => cartItem.item.id === item.id
      );

      let updated;
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex].quantity += quantity;
      } else {
        updated = [...prev, { item, quantity }];
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(updated));
      calculateTotalPrice(updated);
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCartItemsState((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(updated));
      calculateTotalPrice(updated);
      return updated;
    });
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCartItemsState((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(updated));
      calculateTotalPrice(updated);
      return updated;
    });
  };

  const getTotalPrice = () => {
    return totalPrice;
  };

  const clearCart = () => {
    setCartItemsState([]);
    setTotalPrice(0);

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.ORDER_SUBMITTED);
  };

  // Prevent hydration mismatch by not rendering until client-side data is loaded
  if (!isHydrated) {
    return null;
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getTotalPrice,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
