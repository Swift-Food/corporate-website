import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { CorporateMenuItem } from "@/types/menuItem";
import { useCart, SelectedAddon } from "@/context/CartContext";
import MenuItemModal from "./MenuItemModal";

interface MenuItemCardProps {
  groupTitle: string;
  groupedMenuItems: Record<string, CorporateMenuItem[]>;
  index: number;
}

const MenuItemCard = React.forwardRef<HTMLDivElement, MenuItemCardProps>(
  ({ groupTitle, groupedMenuItems, index }, ref) => {
    const { cartItems, addToCart, updateCartQuantity } = useCart();

    // Modal state
    const [modalItem, setModalItem] = useState<CorporateMenuItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Create a map of item quantities from cart (only for items without addons)
    const itemQuantities = useMemo(() => {
      const map: Record<string, { quantity: number; cartIndex: number }> = {};
      cartItems.forEach((cartItem, idx) => {
        // Only map items without addons to avoid conflicts
        if (!cartItem.selectedAddons || cartItem.selectedAddons.length === 0) {
          map[cartItem.item.id] = {
            quantity: cartItem.quantity,
            cartIndex: idx,
          };
        }
      });
      return map;
    }, [cartItems]);

    // Store quantity inputs for each item
    const [quantityInputs, setQuantityInputs] = useState<
      Record<string, string>
    >({});

    // Initialize quantity inputs when cart changes
    useEffect(() => {
      const newInputs: Record<string, string> = {};
      cartItems.forEach((cartItem) => {
        newInputs[cartItem.item.id] = cartItem.quantity.toString();
      });
      setQuantityInputs(newInputs);
    }, [cartItems]);

    const handleAdd = (item: CorporateMenuItem) => {
      if (hasAddons(item)) {
        // Open modal for items with addons
        setModalItem(item);
        setIsModalOpen(true);
      } else {
        // Directly add items without addons
        addToCart(item, 1);
      }
    };

    const handleAddItemWithModal = (
      item: CorporateMenuItem,
      quantity: number,
      selectedAddons: SelectedAddon[]
    ) => {
      addToCart(item, quantity, selectedAddons);
    };

    const handleUpdateQuantity = (
      itemId: string,
      cartIndex: number,
      newQuantity: number
    ) => {
      updateCartQuantity(cartIndex, newQuantity);
    };

    const hasAddons = (item: CorporateMenuItem) => {
      return item.addons && item.addons.length > 0;
    };

    return (
      <div ref={ref} data-group={groupTitle} className="scroll-mt-36">
        <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-6">
          {groupTitle}
        </h2>

        <div className="space-y-4">
          {groupedMenuItems[groupTitle]?.map((item) => (
            <div
              key={item.id}
              className="bg-base-100 border border-base-300 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                {item.image && (
                  <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    {item.isDiscount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        SALE
                      </div>
                    )}
                    {item.popular && (
                      <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
                        POPULAR
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-base-content mb-2">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <button className="text-sm text-base-content/50 hover:text-base-content underline mb-3">
                      More info
                    </button>

                    <div className="flex items-center gap-4 text-xs text-base-content/60">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>Individual Portions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        <span>Eco-friendly packaging</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                  <div className="text-right">
                    {item.isDiscount && item.discountPrice ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-base-content">
                          £{item.discountPrice}
                        </div>
                        <div className="text-sm text-base-content/50 line-through">
                          £{item.price}
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-base-content">
                        £{item.price}
                      </div>
                    )}
                  </div>

                  {/* Quantity controls or add button */}
                  {(() => {
                    const itemInCart = itemQuantities[item.id];
                    const quantity = itemInCart?.quantity || 0;
                    const cartIndex = itemInCart?.cartIndex ?? -1;
                    const quantityInput = quantityInputs[item.id] || "0";

                    // If item is in cart (quantity > 0) and no addons, show quantity controls
                    if (!hasAddons(item) && quantity > 0) {
                      return (
                        <div className="bg-base-200 p-2 rounded-lg border border-[#F0ECE3] flex items-center justify-between min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newQty = Math.max(0, quantity - 1);
                                handleUpdateQuantity(
                                  item.id,
                                  cartIndex,
                                  newQty
                                );
                              }}
                              className="w-7 h-7 md:w-8 md:h-8 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-sm"
                            >
                              −
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={quantityInput}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                const val = e.target.value;
                                if (val === "" || /^\d+$/.test(val)) {
                                  setQuantityInputs((prev) => ({
                                    ...prev,
                                    [item.id]: val,
                                  }));
                                  if (val !== "" && !isNaN(parseInt(val))) {
                                    const newQty = Math.max(0, parseInt(val));
                                    handleUpdateQuantity(
                                      item.id,
                                      cartIndex,
                                      newQty
                                    );
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                if (
                                  e.target.value === "" ||
                                  parseInt(e.target.value) < 1
                                ) {
                                  handleUpdateQuantity(item.id, cartIndex, 0);
                                  setQuantityInputs((prev) => ({
                                    ...prev,
                                    [item.id]: "0",
                                  }));
                                }
                              }}
                              className="w-12 text-center font-medium text-xs md:text-sm text-base-content bg-base-100 border border-base-300 rounded px-1 py-1"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newQty = quantity + 1;
                                handleUpdateQuantity(
                                  item.id,
                                  cartIndex,
                                  newQty
                                );
                              }}
                              className="w-7 h-7 md:w-8 md:h-8 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Otherwise, show + button (for initial add or if item has addons)
                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(item);
                        }}
                        className="bg-base-200 w-7 h-7 md:w-8 md:h-8 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-sm"
                        disabled={!item.isAvailable}
                      >
                        +
                      </button>
                    );
                  })()}
                </div>
              </div>

              {(item.allergens?.length > 0 || !item.isAvailable) && (
                <div className="px-4 pb-4 space-y-2">
                  {item.allergens && item.allergens.length > 0 && (
                    <p className="text-xs text-base-content/60">
                      Allergens: {item.allergens.join(", ")}
                    </p>
                  )}
                  {!item.isAvailable && (
                    <span className="text-xs text-red-500 font-semibold">
                      Currently Unavailable
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal for items with addons */}
        {modalItem && (
          <MenuItemModal
            item={modalItem}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setModalItem(null);
            }}
            onAddItem={handleAddItemWithModal}
          />
        )}
      </div>
    );
  }
);

MenuItemCard.displayName = "MenuItemCard";

export default MenuItemCard;
