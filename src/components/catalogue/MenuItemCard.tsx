import React from "react";
import Image from "next/image";
import { CorporateMenuItem } from "@/types/menuItem";
import { useCart } from "@/context/CartContext";

interface MenuItemCardProps {
  groupTitle: string;
  groupedMenuItems: Record<string, CorporateMenuItem[]>;
  onAdd?: (item: CorporateMenuItem) => void;
}

const MenuItemCard = React.forwardRef<HTMLDivElement, MenuItemCardProps>(
  ({ groupTitle, groupedMenuItems, onAdd }, ref) => {
    const cart = useCart();

    const handleAdd = (item: CorporateMenuItem) => {
      if (onAdd) return onAdd(item);
      cart.addToCart(item);
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(item);
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-base-content flex items-center justify-center hover:bg-base-content hover:text-base-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!item.isAvailable}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
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
      </div>
    );
  }
);

MenuItemCard.displayName = "MenuItemCard";

export default MenuItemCard;
