"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { CorporateMenuItem, Addon, AddonGroup } from "@/types/menuItem";
import { SelectedAddon } from "@/context/CartContext";

interface MenuItemModalProps {
  item: CorporateMenuItem;
  isOpen: boolean;
  onClose: () => void;
  quantity?: number;
  onAddItem: (
    item: CorporateMenuItem,
    quantity: number,
    selectedAddons: SelectedAddon[]
  ) => void;
  onUpdateQuantity?: (
    itemId: string,
    cartIndex: number,
    quantity: number
  ) => void;
  isEditMode?: boolean;
  onRemoveItem?: (itemId: string, cartIndex: number) => void;
  cartIndex?: number;
  existingSelectedAddons?: SelectedAddon[];
}

export default function MenuItemModal({
  item,
  isOpen,
  onClose,
  quantity = 0,
  onAddItem,
  onUpdateQuantity,
  isEditMode = false,
  onRemoveItem,
  cartIndex = -1,
  existingSelectedAddons = [],
}: MenuItemModalProps) {
  // Reset quantity when modal opens/closes using isOpen as a key driver
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemQuantityInput, setItemQuantityInput] = useState("1");
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [hasModifiedQuantity, setHasModifiedQuantity] = useState(false);
  const [initialModalQuantity, setInitialModalQuantity] = useState(0);
  const [isAllergenExpanded, setIsAllergenExpanded] = useState(false);

  const price = parseFloat(item.price?.toString() || "0");
  const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
  const displayPrice =
    item.isDiscount && discountPrice > 0 ? discountPrice : price;

  // Format allergen names for better display
  const formatAllergen = (allergen: string) => {
    return allergen
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Derive addon groups from item.addons using useMemo
  const addonGroups = useMemo(() => {
    if (!item.addons || item.addons.length === 0) {
      return [];
    }

    const grouped: Record<string, AddonGroup> = {};

    item.addons.forEach((addon) => {
      const groupTitle = addon.groupTitle || "Options";

      if (!grouped[groupTitle]) {
        grouped[groupTitle] = {
          groupTitle,
          addons: [],
          isRequired: addon.isRequired,
          selectionType: addon.selectionType,
        };
      }

      grouped[groupTitle].addons.push(addon);
    });

    return Object.values(grouped);
  }, [item.addons]);

  // Derive initial selected options from addon groups
  const initialSelectedOptions = useMemo(() => {
    const initialSelections: Record<string, Record<string, boolean>> = {};
    addonGroups.forEach((group) => {
      initialSelections[group.groupTitle] = {};
      group.addons.forEach((addon) => {
        initialSelections[group.groupTitle][addon.name] = false;
      });
    });

    // If in edit mode, pre-populate with existing selections
    if (
      isEditMode &&
      existingSelectedAddons &&
      existingSelectedAddons.length > 0
    ) {
      existingSelectedAddons.forEach((selectedAddon) => {
        const groupTitle = selectedAddon.addonName; // addonName is the group title
        const addonName = selectedAddon.optionName; // optionName is the actual addon name

        if (
          initialSelections[groupTitle] &&
          initialSelections[groupTitle][addonName] !== undefined
        ) {
          initialSelections[groupTitle][addonName] = true;
        }
      });
    }

    return initialSelections;
  }, [addonGroups, isEditMode, existingSelectedAddons]);

  // Reset state when item changes (which typically happens when modal opens with new item)
  const prevItemIdRef = useRef<string | null>(null);
  useEffect(() => {
    // Reset when item changes or when opening
    const itemChanged = prevItemIdRef.current !== item.id;
    if (itemChanged || (isOpen && prevItemIdRef.current === null)) {
      prevItemIdRef.current = item.id || null;
      // Schedule state updates to next tick to avoid synchronous setState warning
      Promise.resolve().then(() => {
        // Initialize quantity from prop or default to 1
        const initialQty = quantity > 0 ? quantity : 1;
        setItemQuantity(initialQty);
        setItemQuantityInput(initialQty.toString());
        setInitialModalQuantity(initialQty);
        setHasModifiedQuantity(false);
        setSelectedOptions(initialSelectedOptions);
        setActiveTooltip(null);
      });
    }

    // Clear ref when modal closes
    if (!isOpen) {
      prevItemIdRef.current = null;
      setActiveTooltip(null);
      setIsAllergenExpanded(false);
    }
  }, [item.id, isOpen, quantity, initialSelectedOptions]);

  // Calculate total price using useMemo
  const totalPrice = useMemo(() => {
    const basePrice = displayPrice * itemQuantity;

    // Calculate addon costs (raw prices, no multipliers)
    let addonCost = 0;
    addonGroups.forEach((group) => {
      group.addons.forEach((addon) => {
        if (selectedOptions[group.groupTitle]?.[addon.name]) {
          const addonPrice = parseFloat(addon.price?.toString() || "0");
          addonCost += addonPrice * itemQuantity;
        }
      });
    });

    return basePrice + addonCost;
  }, [displayPrice, itemQuantity, selectedOptions, addonGroups]);

  const toggleAddonOption = (addonName: string, group: AddonGroup) => {
    console.log("Pressed");
    const groupTitle = group.groupTitle;

    setSelectedOptions((prev) => {
      const newSelections = JSON.parse(JSON.stringify(prev));

      if (!newSelections[groupTitle]) {
        newSelections[groupTitle] = {};
      }

      const currentValue = prev[groupTitle]?.[addonName] || false;

      // Check if this is single selection
      if (group.selectionType === "single") {
        // Deselect all others in this group
        Object.keys(newSelections[groupTitle]).forEach((opt) => {
          newSelections[groupTitle][opt] = false;
        });
        newSelections[groupTitle][addonName] = true;
      } else {
        // Multiple selection with min/max constraints
        console.log(newSelections[groupTitle][addonName]);
        newSelections[groupTitle][addonName] =
          !newSelections[groupTitle][addonName];
        console.log(newSelections[groupTitle][addonName]);
      }

      return newSelections;
    });
  };

  const validateRequiredAddons = () => {
    return addonGroups.every((group) => {
      if (!group.isRequired) return true;

      // const selectedCount = Object.values(
      //   selectedOptions[group.groupTitle] || {}
      // ).filter(Boolean).length;

      // Check minimum requirement
      // if (group.min && selectedCount < group.min) {
      //   return false;
      // }

      // For required groups without explicit min, at least one must be selected
      // if (!group.min && selectedCount === 0) {
      //   return false;
      // }

      return true;
    });
  };

  const handleAddToCart = () => {
    if (!item) return;

    // Validate required addons
    if (!validateRequiredAddons()) {
      alert("Please select all required options before adding to cart.");
      return;
    }

    // Collect selected addons
    const selectedAddons: SelectedAddon[] = [];
    addonGroups.forEach((group) => {
      group.addons.forEach((addon) => {
        if (selectedOptions[group.groupTitle]?.[addon.name]) {
          const addonPrice = parseFloat(addon.price?.toString() || "0");
          selectedAddons.push({
            addonName: group.groupTitle,
            optionName: addon.name,
            price: addonPrice,
            quantity: itemQuantity,
          });
        }
      });
    });

    onAddItem(item, itemQuantity, selectedAddons);
    onClose();
  };

  if (!isOpen) return null;

  const getSelectionText = (group: AddonGroup) => {
    // const selectedCount = Object.values(
    //   selectedOptions[group.groupTitle] || {}
    // ).filter(Boolean).length;

    if (group.selectionType === "single") {
      return "Select one";
    }
    // if (group.min && group.max) {
    //   return `Select ${group.min}-${group.max} (${selectedCount} selected)`;
    // }
    // if (group.min) {
    //   return `Select at least ${group.min} (${selectedCount} selected)`;
    // }
    // if (group.max) {
    //   return `Select up to ${group.max} (${selectedCount} selected)`;
    // }
    return "Select any";
  };

  if (!isOpen) return null;

  // Only render on client side
  if (typeof window === "undefined") return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal Content */}
      <div
        className="relative bg-base-100 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-3 right-3 float-right w-8 h-8 flex items-center justify-center rounded-full bg-base-300 hover:bg-base-content hover:text-base-100 transition-colors z-30"
          style={{
            position: "sticky",
            top: "0.75rem",
            right: "0.75rem",
            marginLeft: "auto",
          }}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Body */}
        <div className="p-6">
          {item.image && (
            <div
              className="w-full h-full flex-shrink-0 mb-3"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          )}
          <h2 className="font-bold text-xl md:text-2xl text-base-content mb-4 pr-8">
            {item.name}
          </h2>

          <div className="space-y-4">
            {item.description && (
              <div>
                <p className="text-base-content/70 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Dietary Filters */}
            {item.dietaryFilters && item.dietaryFilters.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-base-content mb-2">
                  Dietary Information
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.dietaryFilters.map((filter) => {
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
                    const tooltipKey = `modal-${filter}`;
                    const isTooltipActive = activeTooltip === tooltipKey;

                    if (!iconFile) return null;

                    return (
                      <div
                        key={filter}
                        className="relative w-8 h-8 group cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(isTooltipActive ? null : tooltipKey);
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
                </div>
              </div>
            )}

            {item.allergens && item.allergens.length > 0 && (
              <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsAllergenExpanded(!isAllergenExpanded);
                  }}
                  className="w-full text-left hover:opacity-80 transition-opacity"
                >
                  <h3 className="font-semibold text-sm text-base-content flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className="text-warning text-base">⚠️</span>
                      Allergens
                    </span>
                    <span className="text-xs text-base-content/60 font-normal">
                      {isAllergenExpanded ? "▲ Hide" : "▼ Show"}
                    </span>
                  </h3>
                </button>
                {isAllergenExpanded && (
                  <>
                    <div className="flex flex-wrap gap-2 my-3">
                      {item.allergens.map((allergen: string, index: number) => (
                        <span
                          key={index}
                          className="bg-warning text-warning-content px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                        >
                          {formatAllergen(allergen)}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-base-content/60 italic leading-relaxed">
                      This is approximate. For full allergen information, please
                      contact the restaurant.
                    </p>
                  </>
                )}
              </div>
            )}
            {(!item.allergens || item.allergens.length === 0) && (
              <div className="bg-base-200 border border-base-300 rounded-lg p-3">
                <p className="text-xs text-base-content/60 italic">
                  ⚠️ Allergen information not available. Please contact the
                  restaurant directly.
                </p>
              </div>
            )}

            {/* Pricing */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-1">
                {item.isDiscount && discountPrice > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      £{discountPrice.toFixed(2)}
                    </span>
                    <span className="text-xl text-base-content/50 line-through">
                      £{price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    £{displayPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="bg-base-200 p-4 rounded-lg mt-3">
                <h3 className="font-semibold text-sm text-base-content mb-3">
                  Quantity
                </h3>
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      const newQty = Math.max(1, itemQuantity - 1);
                      setItemQuantity(newQty);
                      setItemQuantityInput(newQty.toString());
                      if (
                        quantity > 0 &&
                        (!item.addons || item.addons.length === 0)
                      ) {
                        setHasModifiedQuantity(newQty !== initialModalQuantity);
                      }
                    }}
                    className="w-10 h-10 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-lg font-medium flex-shrink-0"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={itemQuantityInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+$/.test(val)) {
                        setItemQuantityInput(val);
                        if (val !== "" && !isNaN(parseInt(val))) {
                          const newQty = Math.max(1, parseInt(val));
                          setItemQuantity(newQty);
                          if (
                            quantity > 0 &&
                            (!item.addons || item.addons.length === 0)
                          ) {
                            setHasModifiedQuantity(
                              newQty !== initialModalQuantity
                            );
                          }
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (
                        e.target.value === "" ||
                        parseInt(e.target.value) < 1
                      ) {
                        setItemQuantity(1);
                        setItemQuantityInput("1");
                        if (
                          quantity > 0 &&
                          (!item.addons || item.addons.length === 0)
                        ) {
                          setHasModifiedQuantity(1 !== initialModalQuantity);
                        }
                      }
                    }}
                    className="w-20 text-center font-bold text-lg text-base-content bg-base-100 border border-base-300 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => {
                      const newQty = itemQuantity + 1;
                      setItemQuantity(newQty);
                      setItemQuantityInput(newQty.toString());
                      if (
                        quantity > 0 &&
                        (!item.addons || item.addons.length === 0)
                      ) {
                        setHasModifiedQuantity(newQty !== initialModalQuantity);
                      }
                    }}
                    className="w-10 h-10 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-lg font-medium flex-shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Addons section */}
            {addonGroups.length > 0 && (
              <div className="pt-4">
                <h3 className="font-semibold text-base text-base-content mb-3">
                  Customize Your Order
                </h3>
                {addonGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-4">
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-base-content">
                          {group.groupTitle}
                          {group.isRequired && (
                            <span className="text-error ml-1">*</span>
                          )}
                        </h4>
                        <span className="text-xs text-base-content/60 italic">
                          {getSelectionText(group)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {group.addons.map((addon, addonIndex) => (
                        <button
                          key={addonIndex}
                          onClick={() => toggleAddonOption(addon.name, group)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                            selectedOptions[group.groupTitle]?.[addon.name]
                              ? "border-primary bg-primary/5"
                              : "border-base-300 bg-base-100 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedOptions[group.groupTitle]?.[addon.name]
                                  ? "border-primary bg-primary"
                                  : "border-base-300"
                              }`}
                            >
                              {selectedOptions[group.groupTitle]?.[
                                addon.name
                              ] && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-sm text-base-content block">
                                {addon.name}
                              </span>
                            </div>
                          </div>
                          {addon.price > 0 &&
                            parseFloat(addon.price.toString()) > 0 && (
                              <span className="text-sm font-medium text-primary">
                                +£
                                {parseFloat(addon.price.toString()).toFixed(2)}
                              </span>
                            )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Price */}
            <div className="pt-2 border-t border-base-300">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-base-content/70">
                  Total {itemQuantity > 1 ? `(${itemQuantity} items)` : ""}:
                </span>
                <span className="text-lg font-bold text-primary">
                  £{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditMode ? (
              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all text-base"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    if (onRemoveItem && cartIndex >= 0) {
                      onRemoveItem(item.id, cartIndex);
                      onClose();
                    }
                  }}
                  className="w-full bg-error hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all text-base"
                >
                  Remove from Cart
                </button>
              </div>
            ) : quantity > 0 && (!item.addons || item.addons.length === 0) ? (
              <div className="space-y-2">
                {hasModifiedQuantity && (
                  <button
                    onClick={() => {
                      if (onUpdateQuantity && cartIndex >= 0) {
                        onUpdateQuantity(item.id, cartIndex, itemQuantity);
                        onClose();
                      }
                    }}
                    className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all text-base"
                  >
                    Update Quantity
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onUpdateQuantity && cartIndex >= 0) {
                      onUpdateQuantity(item.id, cartIndex, 0);
                      onClose();
                    }
                  }}
                  className="w-full bg-error hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all text-base"
                >
                  Remove from Cart
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all text-base"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
