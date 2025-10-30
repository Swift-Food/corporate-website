"use client";

import { useState, useEffect } from "react";
import { CorporateMenuItem, Addon } from "@/types/menuItem";
import { SelectedAddon } from "@/context/CartContext";

interface MenuItemModalProps {
  item: CorporateMenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: CorporateMenuItem, quantity: number, selectedAddons: SelectedAddon[]) => void;
}

interface AddonGroup {
  groupTitle: string;
  addons: Addon[];
  isRequired: boolean;
  selectionType: "single" | "multiple";
  min?: number;
  max?: number;
}

export default function MenuItemModal({
  item,
  isOpen,
  onClose,
  onAddItem,
}: MenuItemModalProps) {
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemQuantityInput, setItemQuantityInput] = useState("1");
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const price = parseFloat(item.price?.toString() || "0");
  const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
  const displayPrice =
    item.isDiscount && discountPrice > 0 ? discountPrice : price;

  // Reset state when modal opens and group addons
  useEffect(() => {
    if (isOpen) {
      setItemQuantity(1);
      setItemQuantityInput("1");

      // Group addons by groupTitle
      if (item.addons && item.addons.length > 0) {
        const grouped: Record<string, AddonGroup> = {};

        item.addons.forEach((addon) => {
          const groupTitle = addon.groupTitle || "Options";

          if (!grouped[groupTitle]) {
            grouped[groupTitle] = {
              groupTitle,
              addons: [],
              isRequired: addon.isRequired || false,
              selectionType: addon.selectionType || "multiple",
              min: addon.min,
              max: addon.max,
            };
          }

          grouped[groupTitle].addons.push(addon);
        });

        setAddonGroups(Object.values(grouped));

        // Initialize selected options
        const initialSelections: Record<string, Record<string, boolean>> = {};
        Object.values(grouped).forEach((group) => {
          initialSelections[group.groupTitle] = {};
          group.addons.forEach((addon) => {
            initialSelections[group.groupTitle][addon.name] = false;
          });
        });
        setSelectedOptions(initialSelections);
      } else {
        setAddonGroups([]);
        setSelectedOptions({});
      }
    }
  }, [isOpen, item]);

  // Calculate total price when quantity or selected addons change
  useEffect(() => {
    if (!item) return;

    let basePrice = displayPrice * itemQuantity;

    // Calculate addon costs (raw prices, no multipliers)
    let addonCost = 0;
    addonGroups.forEach((group) => {
      group.addons.forEach((addon) => {
        if (selectedOptions[group.groupTitle]?.[addon.name]) {
          addonCost += (addon.price || 0) * itemQuantity;
        }
      });
    });

    setTotalPrice(basePrice + addonCost);
  }, [item, itemQuantity, selectedOptions, displayPrice, addonGroups]);

  const toggleOption = (groupTitle: string, addonName: string, group: AddonGroup) => {
    setSelectedOptions((prev) => {
      const newSelections = { ...prev };

      if (!newSelections[groupTitle]) {
        newSelections[groupTitle] = {};
      }

      const currentValue = prev[groupTitle]?.[addonName] || false;
      const selectedCount = Object.values(prev[groupTitle] || {}).filter(Boolean).length;

      // Check if this is single selection
      if (group.selectionType === "single") {
        // Deselect all others in this group
        Object.keys(newSelections[groupTitle]).forEach((opt) => {
          newSelections[groupTitle][opt] = false;
        });
        newSelections[groupTitle][addonName] = true;
      } else {
        // Multiple selection with min/max constraints
        if (currentValue) {
          // Deselecting - check if we'll still have minimum
          const newCount = selectedCount - 1;
          if (group.min && newCount < group.min) {
            // Don't allow deselection if it would go below minimum
            return prev;
          }
          newSelections[groupTitle][addonName] = false;
        } else {
          // Selecting - check if we're at maximum
          if (group.max && selectedCount >= group.max) {
            // Don't allow selection if at maximum
            return prev;
          }
          newSelections[groupTitle][addonName] = true;
        }
      }

      return newSelections;
    });
  };

  const validateRequiredAddons = () => {
    return addonGroups.every((group) => {
      if (!group.isRequired) return true;

      const selectedCount = Object.values(
        selectedOptions[group.groupTitle] || {}
      ).filter(Boolean).length;

      // Check minimum requirement
      if (group.min && selectedCount < group.min) {
        return false;
      }

      // For required groups without explicit min, at least one must be selected
      if (!group.min && selectedCount === 0) {
        return false;
      }

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
          selectedAddons.push({
            addonName: group.groupTitle,
            optionName: addon.name,
            price: addon.price || 0,
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
    const selectedCount = Object.values(
      selectedOptions[group.groupTitle] || {}
    ).filter(Boolean).length;

    if (group.selectionType === "single") {
      return "Select one";
    }
    if (group.min && group.max) {
      return `Select ${group.min}-${group.max} (${selectedCount} selected)`;
    }
    if (group.min) {
      return `Select at least ${group.min} (${selectedCount} selected)`;
    }
    if (group.max) {
      return `Select up to ${group.max} (${selectedCount} selected)`;
    }
    return "Select any";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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

            {item.allergens && item.allergens.length > 0 ? (
              <div>
                <h3 className="font-semibold text-sm text-base-content mb-2">
                  Allergens
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.allergens.map((allergen: string, index: number) => (
                    <span
                      key={index}
                      className="bg-warning/20 text-warning-content px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-base-content/50 italic bg-base-200 p-3 rounded">
                  ⚠️ This is approximate. For full allergen info, contact the
                  restaurant or our team.
                </p>
              </div>
            ) : (
              <div className="bg-base-200 p-3 rounded">
                <p className="text-xs text-base-content/60 italic">
                  ⚠️ Disclaimer: Allergen info not available. Please contact the
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
                      }
                    }}
                    className="w-20 text-center font-bold text-lg text-base-content bg-base-100 border border-base-300 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => {
                      const newQty = itemQuantity + 1;
                      setItemQuantity(newQty);
                      setItemQuantityInput(newQty.toString());
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
                          onClick={() => toggleOption(group.groupTitle, addon.name, group)}
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
                              {selectedOptions[group.groupTitle]?.[addon.name] && (
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
                          {addon.price > 0 && (
                            <span className="text-sm font-medium text-primary">
                              +£{addon.price.toFixed(2)}
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

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all text-base"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
