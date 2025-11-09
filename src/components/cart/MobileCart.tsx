"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import MenuItemModal from "@/components/catalogue/MenuItemModal";

interface MobileCartProps {
  onCheckout?: () => void;
  checkoutButtonText?: string;
}

export default function MobileCart({
  onCheckout,
  checkoutButtonText = "Proceed to Checkout",
}: MobileCartProps) {
  const { cartItems, removeFromCart, updateCartQuantity, getTotalPrice, addToCart } =
    useCart();
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Mobile Cart Button - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-3 z-20">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-lg font-bold text-base transition-all flex items-center justify-between px-4"
        >
          <span>View Cart ({cartItems.length})</span>
          <span>£{getTotalPrice().toFixed(2)}</span>
        </button>
      </div>

      {/* Mobile Cart Modal */}
      {showModal && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-base-100 w-full rounded-t-3xl max-h-[85vh] flex flex-col">
            <div className="bg-base-100 border-b border-base-300 p-4 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-bold text-base-content">
                Your Order
              </h3>
              <button onClick={() => setShowModal(false)} className="text-2xl">
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <p className="text-base-content/50 text-center py-8">
                  No items added yet
                </p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(({ item, quantity, selectedAddons }, index) => {
                    const price = parseFloat(item.price?.toString() || "0");
                    const discountPrice = parseFloat(
                      item.discountPrice?.toString() || "0"
                    );
                    const itemPrice =
                      item.isDiscount && discountPrice > 0
                        ? discountPrice
                        : price;

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
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
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
                                onClick={() =>
                                  updateCartQuantity(index, quantity - 1)
                                }
                                className="w-6 h-6 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
                              >
                                −
                              </button>
                              <span className="text-sm font-medium text-base-content">
                                {quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQuantity(index, quantity + 1)
                                }
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
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-base-300 bg-base-100 p-4 flex-shrink-0">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-lg font-bold text-base-content">
                    <span>Total:</span>
                    <span>£{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="w-full bg-primary hover:opacity-90 text-white py-4 px-2 rounded-lg font-bold text-lg transition-all"
                  onClick={() => {
                    setShowModal(false);
                    if (onCheckout) {
                      onCheckout();
                    } else {
                      alert("Checkout coming soon!");
                    }
                  }}
                >
                  {checkoutButtonText}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
