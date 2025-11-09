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

    // Tooltip state for dietary filters
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

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

        <div className="grid grid-cols-1 2xl:grid-cols-2 3xl:grid-cols-3 gap-4 md:gap-6">
          {groupedMenuItems[groupTitle]?.map((item) => {
            const itemInCart = itemQuantities[item.id];
            const quantity = itemInCart?.quantity || 0;
            const cartIndex = itemInCart?.cartIndex ?? -1;
            const quantityInput = quantityInputs[item.id] || "0";

            const handleAddOrModal = () => {
              // Check if mobile (width < 768px which is md breakpoint)
              const isMobile = window.innerWidth < 768;

              if (isMobile || hasAddons(item)) {
                // On mobile or if item has addons, open modal
                setModalItem(item);
                setIsModalOpen(true);
              } else {
                // On md and larger with no addons, directly add to cart
                addToCart(item, 1);
              }
            };

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 transition-shadow overflow-hidden cursor-pointer h-[140px] md:h-[200px]"
                onClick={() => {
                  setActiveTooltip(null);
                  setModalItem(item);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex flex-row h-full">
                  {/* Left Side - Content */}
                  <div className="flex-1 px-4 py-2 sm:p-6">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-md md:text-xl text-gray-900 flex-1 line-clamp-1">
                            {item.name}
                          </h3>
                        </div>

                        {/* Description - 2 lines */}
                        {item.description && (
                          <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {/* Dietary Filters - Hidden on mobile */}
                        {item.dietaryFilters &&
                          item.dietaryFilters.length > 0 && (
                            <div className="hidden md:flex flex-wrap gap-1 mb-2 items-center">
                              {item.dietaryFilters.slice(0, 5).map((filter) => {
                                const iconMap: Record<string, string> = {
                                  vegetarian: "Vegetarian.png",
                                  halal: "Halal.png",
                                  no_gluten: "No Gluten.png",
                                  no_nut: "No Nuts.png",
                                  no_dairy: "No Dairy.png",
                                  pescatarian: "Pescatarian.png",
                                  vegan: "Vegan.png",
                                };
                                const labelMap: Record<string, string> = {
                                  vegetarian: "Vegetarian",
                                  halal: "Halal",
                                  no_gluten: "No Gluten",
                                  no_nut: "No Nuts",
                                  no_dairy: "No Dairy",
                                  pescatarian: "Pescatarian",
                                  vegan: "Vegan",
                                  nonvegetarian: "Non-Vegetarian",
                                };
                                const iconFile = iconMap[filter.toLowerCase()];
                                const label = labelMap[filter.toLowerCase()] || filter;
                                const tooltipKey = `${item.id}-${filter}`;
                                const isTooltipActive = activeTooltip === tooltipKey;

                                if (!iconFile) return null;

                                return (
                                  <div
                                    key={filter}
                                    className="relative w-6 h-6 group cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTooltip(
                                        isTooltipActive ? null : tooltipKey
                                      );
                                    }}
                                  >
                                    <Image
                                      src={`/icons/Mini_Allergens_Icons/Icon only/${iconFile}`}
                                      alt={label}
                                      fill
                                      className="object-contain"
                                    />
                                    {/* Tooltip */}
                                    <div
                                      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap transition-opacity z-10 ${
                                        isTooltipActive
                                          ? "opacity-100"
                                          : "opacity-0 group-hover:opacity-100 pointer-events-none"
                                      }`}
                                    >
                                      {label}
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>
                                );
                              })}
                              {item.dietaryFilters.length > 5 && (
                                <span className="text-xs text-gray-500">
                                  +{item.dietaryFilters.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                      </div>

                      {/* Price and Add to Order / Quantity */}
                      <div className="flex items-end justify-between gap-4">
                        <div className="flex-1">
                          {item.isDiscount && item.discountPrice && item.discountPrice !== item.price ? (
                            <div className="flex flex-row items-center justify-start gap-3">
                              <p className="text-gray-500 text-[11px] md:text-sm line-through">
                                £{item.price.toFixed(2)}
                              </p>
                              <p className="text-primary font-bold text-sm md:text-2xl">
                                £{item.discountPrice.toFixed(2)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-primary font-bold text-md md:text-lg">
                              £{item.price.toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Add to order button / quantity controls */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0"
                        >
                          {quantity > 0 ? (
                            <>
                              {/* On md and smaller: show simple add button that opens modal */}
                              <button
                                onClick={() => {
                                  setModalItem(item);
                                  setIsModalOpen(true);
                                }}
                                className="lg:hidden w-8 h-8 bg-primary hover:opacity-90 text-white rounded-full font-medium transition-all flex items-center justify-center"
                                aria-label="Add to Order"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>

                              {/* On lg and larger: show quantity controls */}
                              <div className="hidden lg:flex bg-[#F5F1E8] p-2 rounded-lg border border-[#F0ECE3] items-center gap-2 max-w-[180px]">
                                <button
                                  onClick={() => {
                                    const newQty = Math.max(0, quantity - 1);
                                    handleUpdateQuantity(
                                      item.id,
                                      cartIndex,
                                      newQty
                                    );
                                  }}
                                  className="w-7 h-7 md:w-8 md:h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center text-sm flex-shrink-0"
                                >
                                  −
                                </button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={quantityInput}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d+$/.test(val)) {
                                      setQuantityInputs((prev) => ({
                                        ...prev,
                                        [item.id]: val,
                                      }));
                                      if (val !== "" && !isNaN(parseInt(val))) {
                                        const newQty = Math.max(
                                          0,
                                          parseInt(val)
                                        );
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
                                  className="w-12 text-center font-medium text-xs md:text-sm text-gray-900 bg-white border border-gray-300 rounded px-1 py-1 flex-shrink-0"
                                />

                                <button
                                  onClick={() => {
                                    const newQty = quantity + 1;
                                    handleUpdateQuantity(
                                      item.id,
                                      cartIndex,
                                      newQty
                                    );
                                  }}
                                  className="w-7 h-7 md:w-8 md:h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center text-sm flex-shrink-0"
                                >
                                  +
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={handleAddOrModal}
                              className="w-8 h-8 md:w-10 md:h-10 bg-primary hover:opacity-90 text-white rounded-full font-medium transition-all flex items-center justify-center"
                              aria-label="Add to Order"
                              disabled={!item.isAvailable}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 md:h-5 md:w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Image */}
                  {item.image && (
                    <div className="w-[140px] md:w-[200px] h-full bg-gray-200 flex-shrink-0 relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {item.isDiscount &&
                        item.discountPrice &&
                        item.discountPrice !== item.price && (
                          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
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
                </div>
              </div>
            );
          })}
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
