"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import MenuItemModal from "@/components/catalogue/MenuItemModal";
import CartItem from "./CartItem";
import CartTotal from "./CartTotal";

interface CartSidebarProps {
  onCheckout?: () => void;
  checkoutButtonText?: string;
  topOffset?: string;
  maxHeightOffset?: string;
  widthPercentage?: number;
}

export default function CartSidebar({
  onCheckout,
  checkoutButtonText = "Proceed to Checkout",
  topOffset = "top-40",
  maxHeightOffset = "12rem",
  widthPercentage = 30,
}: CartSidebarProps) {
  const { cartItems, removeFromCart, updateCartQuantity, getTotalPrice, addToCart } =
    useCart();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className={`hidden lg:block sticky ${topOffset} items-center justify-center`}
      style={{
        maxHeight: `calc(100vh - ${maxHeightOffset})`,
        width: `${widthPercentage}%`,
        minWidth: "280px",
      }}
    >
      <div className="bg-base-100 rounded-xl p-6 border border-base-300 flex flex-col max-h-full">
        <h3 className="text-xl font-bold text-base-content mb-6">Your Order</h3>

        {cartItems.length === 0 ? (
          <p className="text-base-content/50 text-center py-8">
            No items added yet
          </p>
        ) : (
          <>
            <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
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

            <CartTotal total={getTotalPrice()} />

            <button
              className="w-full bg-primary hover:opacity-90 text-white py-4 px-2 rounded-lg font-bold text-md transition-all flex-shrink-0"
              onClick={onCheckout || (() => alert("Checkout coming soon!"))}
            >
              {checkoutButtonText}
            </button>
          </>
        )}
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
    </div>
  );
}
