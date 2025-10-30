"use client";

import { useCart } from "@/context/CartContext";

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
  const { cartItems, removeFromCart, updateCartQuantity, getTotalPrice } =
    useCart();

  return (
    <div
      className={`hidden lg:block border sticky ${topOffset} items-center justify-center`}
      style={{
        maxHeight: `calc(100vh - ${maxHeightOffset})`,
        width: `${widthPercentage}%`,
        minWidth: '280px'
      }}
    >
      <div className="bg-base-100 rounded-xl p-6 border border-base-300 flex flex-col h-full">
        <h3 className="text-xl font-bold text-base-content mb-6">Your Order</h3>

        {cartItems.length === 0 ? (
          <p className="text-base-content/50 text-center py-8">
            No items added yet
          </p>
        ) : (
          <>
            <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
              {cartItems.map(({ item, quantity, selectedAddons }, index) => {
                const price = parseFloat(item.price?.toString() || "0");
                const discountPrice = parseFloat(
                  item.discountPrice?.toString() || "0"
                );
                const itemPrice =
                  item.isDiscount && discountPrice > 0 ? discountPrice : price;

                // Calculate addon price
                const addonPrice = (selectedAddons || []).reduce(
                  (sum, addon) => {
                    return sum + (addon.price || 0);
                  },
                  0
                );

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
                              {addon.price > 0 &&
                                ` (£${addon.price.toFixed(2)})`}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xl font-bold text-primary mb-2">
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
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-error hover:opacity-80 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 border-t border-base-300 pt-4 mb-6 flex-shrink-0">
              <div className="flex justify-between text-lg font-bold text-base-content">
                <span>Total:</span>
                <span>£{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <button
              className="w-full bg-primary hover:opacity-90 text-white py-4 px-2 rounded-lg font-bold text-md transition-all flex-shrink-0"
              onClick={onCheckout || (() => alert("Checkout coming soon!"))}
            >
              {checkoutButtonText}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
