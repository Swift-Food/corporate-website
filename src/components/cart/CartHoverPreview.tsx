"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import CartItem from "./CartItem";
import CartTotal from "./CartTotal";

interface CartHoverPreviewProps {
  maxItems?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onEditItem?: (index: number) => void;
  onClose?: () => void;
}

export default function CartHoverPreview({
  maxItems = 3,
  onMouseEnter,
  onMouseLeave,
  onEditItem,
  onClose,
}: CartHoverPreviewProps) {
  const { cartItems, removeFromCart, updateCartQuantity, getTotalPrice } = useCart();
  const router = useRouter();

  if (cartItems.length === 0) {
    return (
      <>
        {/* Backdrop for mobile */}
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
        <div
          className="fixed left-1/2 -translate-x-1/2 top-[72px] w-[90%] md:w-80 md:left-auto md:right-4 md:translate-x-0 bg-white rounded-lg shadow-xl border border-base-300 p-4 z-50"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 md:hidden text-base-content/50 hover:text-base-content"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-base-content/50 text-center py-4">
            Your cart is empty
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 -translate-x-1/2 top-[72px] w-[90%] md:w-96 md:left-auto md:right-4 md:translate-x-0 bg-white rounded-lg shadow-xl border border-base-300 p-4 z-50 max-h-[calc(100vh-100px)] flex flex-col"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 md:hidden text-base-content/50 hover:text-base-content z-10"
          aria-label="Close cart"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-base-content mb-4">Your Cart</h3>

        <div className="space-y-4 mb-4 flex-1 overflow-y-auto">
          {cartItems.map(({ item, quantity, selectedAddons }, index) => (
            <CartItem
              key={index}
              item={item}
              quantity={quantity}
              selectedAddons={selectedAddons}
              index={index}
              onUpdateQuantity={updateCartQuantity}
              onEdit={(idx) => {
                if (onEditItem) {
                  onEditItem(idx);
                }
              }}
              onRemove={removeFromCart}
              showBorder={index !== cartItems.length - 1}
              compact={true}
            />
          ))}
        </div>

        <CartTotal total={getTotalPrice()} compact={true} />

        <button
          className="w-full bg-primary hover:opacity-90 text-white py-3 px-4 rounded-lg font-bold text-sm transition-all flex-shrink-0"
          onClick={() => {
            if (onClose) onClose();
            router.push("/checkout");
          }}
        >
          View Cart & Checkout
        </button>
      </div>
    </>
  );
}
