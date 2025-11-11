"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import MenuItemModal from "@/components/catalogue/MenuItemModal";

interface CartHoverPreviewProps {
  maxItems?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function CartHoverPreview({
  maxItems = 3,
  onMouseEnter,
  onMouseLeave,
}: CartHoverPreviewProps) {
  const { cartItems, removeFromCart, updateCartQuantity, getTotalPrice, addToCart } = useCart();
  const router = useRouter();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div
        className="fixed right-4 top-[72px] w-80 bg-white rounded-lg shadow-xl border border-base-300 p-4 z-50"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <p className="text-base-content/50 text-center py-4">
          Your cart is empty
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed right-4 top-[72px] w-96 bg-white rounded-lg shadow-xl border border-base-300 p-4 z-50 max-h-[calc(100vh-100px)] flex flex-col"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
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
                          setEditingIndex(index);
                          setIsModalOpen(true);
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

      {/* Edit Modal */}
      {editingIndex !== null && cartItems[editingIndex] && (
        <MenuItemModal
          item={cartItems[editingIndex].item}
          isOpen={isModalOpen}
          quantity={cartItems[editingIndex].quantity}
          cartIndex={editingIndex}
          existingSelectedAddons={cartItems[editingIndex].selectedAddons}
          onClose={() => {
            setIsModalOpen(false);
            setEditingIndex(null);
          }}
          onAddItem={(item, quantity, selectedAddons) => {
            // Remove the old item first, then add the updated one
            removeFromCart(editingIndex);
            addToCart(item, quantity, selectedAddons);
            setIsModalOpen(false);
            setEditingIndex(null);
          }}
          onUpdateQuantity={(itemId, cartIndex, newQuantity) => {
            updateCartQuantity(cartIndex, newQuantity);
            if (newQuantity === 0) {
              setIsModalOpen(false);
              setEditingIndex(null);
            }
          }}
          onRemoveItem={(itemId, cartIndex) => {
            removeFromCart(cartIndex);
            setIsModalOpen(false);
            setEditingIndex(null);
          }}
          isEditMode={true}
        />
      )}
    </>
  );
}
