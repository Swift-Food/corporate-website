"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import MenuItemModal from "@/components/catalogue/MenuItemModal";
import CartItem from "./CartItem";
import CartTotal from "./CartTotal";

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
                  {cartItems.map(({ item, quantity, selectedAddons }, index) => (
                    <CartItem
                      key={index}
                      item={item}
                      quantity={quantity}
                      selectedAddons={selectedAddons}
                      index={index}
                      onUpdateQuantity={updateCartQuantity}
                      onEdit={(idx) => {
                        setEditingIndex(idx);
                        setIsModalOpen(true);
                      }}
                      onRemove={removeFromCart}
                      showBorder={index !== cartItems.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-base-300 bg-base-100 p-4 flex-shrink-0">
                <CartTotal total={getTotalPrice()} />

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
