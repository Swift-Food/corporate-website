import { Restaurant } from "@/types/restaurant";
import RestaurantCard from "./RestaurantCard";
import { useState } from "react";
import { restaurantApi } from "@/api/restaurant";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  image?: string;
  restaurantId: string;
  restaurant?: {
    id: string;
    restaurant_name: string;
  };
}

interface SearchResultsProps {
  restaurantResults: Restaurant[];
  menuItemResults: MenuItem[];
  isLoading: boolean;
  searchQuery: string;
  restaurants: Restaurant[];
  onRestaurantClick: (restaurant: Restaurant) => void;
}

export default function SearchResults({
  restaurantResults,
  menuItemResults,
  isLoading,
  searchQuery,
  onRestaurantClick,
  restaurants,
}: SearchResultsProps) {
  console.log(restaurants);
  if (isLoading) {
    return (
      <div className="text-center py-12 text-base-content/60">Searching...</div>
    );
  }

  const hasMenuItemResults = menuItemResults.length > 0;

  // Group menu items by restaurant
  const menuItemsByRestaurant: Record<string, MenuItem[]> = {};
  menuItemResults.forEach((item) => {
    const restaurantId = item.restaurantId;
    if (!menuItemsByRestaurant[restaurantId]) {
      menuItemsByRestaurant[restaurantId] = [];
    }
    menuItemsByRestaurant[restaurantId].push(item);
  });

  // Get unique restaurant IDs from menu items
  const restaurantIdsWithItems = new Set(
    menuItemResults.map((item) => item.restaurantId)
  );

  // Combine explicitly matched restaurants with restaurants that have matching menu items
  const allMatchingRestaurants = restaurants.filter(
    (restaurant) =>
      restaurantResults.some((r) => r.id === restaurant.id) ||
      restaurantIdsWithItems.has(restaurant.id)
  );

  const hasRestaurantResults = allMatchingRestaurants.length > 0;

  if (!hasRestaurantResults && !hasMenuItemResults) {
    return (
      <div className="text-center py-12 text-base-content/60">
        <p className="text-lg mb-2">No results found for "{searchQuery}"</p>
        <p className="text-sm">Try searching with different keywords</p>
      </div>
    );
  }

  const getRestaurantNameFromId = (id: string) => {
    for (const [_, restaurant] of restaurants.entries()) {
      if (restaurant.id === id) {
        return restaurant.restaurant_name;
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Restaurant Results */}
      {hasRestaurantResults && (
        <div>
          <h3 className="text-xl md:text-2xl font-semibold mb-4 text-base-content">
            Restaurants ({allMatchingRestaurants.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {allMatchingRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={onRestaurantClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Menu Item Results */}
      {hasMenuItemResults && (
        <div>
          <h3 className="text-xl md:text-2xl font-semibold mb-4 text-base-content">
            Menu Items ({menuItemResults.length})
          </h3>
          <div className="space-y-6">
            {Object.entries(menuItemsByRestaurant).map(
              ([restaurantId, items]) => {
                const restaurantName =
                  getRestaurantNameFromId(items[0].restaurantId) ||
                  "Unknown Restaurant";

                return (
                  <div key={restaurantId} className="space-y-3">
                    <h4 className="text-lg font-semibold text-primary border-b border-base-300 pb-2">
                      {restaurantName}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg border border-base-300 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          {item.image && (
                            <div className="relative w-full aspect-[16/9] overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h5 className="font-semibold text-base text-base-content mb-1">
                              {item.name}
                            </h5>
                            {item.description && (
                              <p className="text-sm text-base-content/60 mb-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <p className="text-lg font-bold text-primary">
                              £{parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}
