"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

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
          {cartItems.map(({ item, quantity, selectedAddons }, index) => {
            const price = parseFloat(item.price?.toString() || "0");
            const discountPrice = parseFloat(
              item.discountPrice?.toString() || "0"
            );
            const itemPrice =
              item.isDiscount && discountPrice > 0 ? discountPrice : price;

            // Calculate addon price
            const addonPrice = (selectedAddons || []).reduce((sum, addon) => {
              return sum + (addon.price || 0);
            }, 0);

            const subtotal = (itemPrice + addonPrice) * quantity;

            return (
              <div
                key={index}
                className={`flex gap-3 pb-4${
                  index !== cartItems.length - 1
                    ? " border-b border-base-300"
                    : ""
                }`}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-base-content mb-1">
                    {item.name}
                  </h4>
                  {selectedAddons && selectedAddons.length > 0 && (
                    <div className="text-xs text-base-content/60 mb-1">
                      {selectedAddons.map((addon, addonIndex) => (
                        <div key={addonIndex}>
                          + {addon.optionName}
                          {addon.price > 0 && ` (£${addon.price.toFixed(2)})`}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-lg font-bold text-primary mb-2">
                    £{subtotal.toFixed(2)}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(index, quantity - 1)}
                        className="w-6 h-6 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-base-content">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(index, quantity + 1)}
                        className="w-6 h-6 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          if (onEditItem) {
                            onEditItem(index);
                          }
                        }}
                        className="text-primary hover:opacity-80 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-error hover:opacity-80 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-base-300 pt-3 mb-4 flex-shrink-0">
          <div className="flex justify-between text-lg font-bold text-base-content">
            <span>Total:</span>
            <span>£{getTotalPrice().toFixed(2)}</span>
          </div>
        </div>

        <button
          className="w-full bg-primary hover:opacity-90 text-white py-3 px-4 rounded-lg font-bold text-sm transition-all flex-shrink-0"
          onClick={() => router.push("/checkout")}
        >
          View Cart & Checkout
        </button>
      </div>
    </>
  );
}
