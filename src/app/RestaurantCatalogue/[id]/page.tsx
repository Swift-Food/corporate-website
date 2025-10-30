"use client";

import { menuItemApi } from "@/api/menu-items";
import { CorporateMenuItem } from "@/types/menuItem";
import { Restaurant } from "@/types/restaurant";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RestaurantDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantId = params.id as string;

  const [menuItems, setMenuItems] = useState<CorporateMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    // Get restaurant data from URL params
    const restaurantData = searchParams.get("data");
    if (restaurantData) {
      try {
        setRestaurant(JSON.parse(decodeURIComponent(restaurantData)));
      } catch (error) {
        console.error("Error parsing restaurant data:", error);
      }
    }

    fetchMenuItems();
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const items = await menuItemApi.fetchItemsFromRestaurant(restaurantId);
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group menu items by groupTitle
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const group = item.groupTitle || "Other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {} as Record<string, CorporateMenuItem[]>);

  return (
    <div className="w-full min-h-screen bg-base-100">
      {/* Restaurant Header */}
      {restaurant && (
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <img
            src={restaurant.images?.[0] || "/placeholder.jpg"}
            alt={restaurant.restaurant_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="w-full px-4 md:px-8 py-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {restaurant.restaurant_name}
              </h1>
              {restaurant.restaurant_description && (
                <p className="text-white/90 text-sm md:text-base max-w-3xl">
                  {restaurant.restaurant_description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="text-white font-medium">
                    {restaurant.averageRating || "No rating"}
                  </span>
                </div>
                {restaurant.phoneNumber && (
                  <span className="text-white/80 text-sm">
                    {restaurant.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-4 md:px-8 py-6 md:py-8">
        {loading ? (
          <div className="text-center py-12 text-base-content/60">
            Loading menu items...
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12 text-base-content/60">
            No menu items available
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMenuItems).map(([groupTitle, items]) => (
              <div key={groupTitle}>
                <h2 className="text-2xl font-bold text-base-content mb-4">
                  {groupTitle}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-base-300 bg-base-200"
                    >
                      {item.image && (
                        <div className="relative w-full aspect-[4/3] overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {item.isDiscount && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                              SALE
                            </div>
                          )}
                          {item.popular && (
                            <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-semibold">
                              POPULAR
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-base-content mb-1 line-clamp-1">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.isDiscount && item.discountPrice ? (
                              <>
                                <span className="text-lg font-bold text-primary">
                                  £{item.discountPrice}
                                </span>
                                <span className="text-sm text-base-content/50 line-through">
                                  £{item.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-base-content">
                                £{item.price}
                              </span>
                            )}
                          </div>
                          {item.averageRating > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500 text-sm">★</span>
                              <span className="text-sm text-base-content/70">
                                {item.averageRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-base-300">
                            <p className="text-xs text-base-content/60">
                              Allergens: {item.allergens.join(", ")}
                            </p>
                          </div>
                        )}
                        {!item.isAvailable && (
                          <div className="mt-2">
                            <span className="text-xs text-red-500 font-semibold">
                              Currently Unavailable
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
