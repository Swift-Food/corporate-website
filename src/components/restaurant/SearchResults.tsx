import { Restaurant } from "@/types/restaurant";
import RestaurantCard from "./RestaurantCard";

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
  onRestaurantClick: (restaurant: Restaurant) => void;
}

export default function SearchResults({
  restaurantResults,
  menuItemResults,
  isLoading,
  searchQuery,
  onRestaurantClick,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-base-content/60">
        Searching...
      </div>
    );
  }

  const hasRestaurantResults = restaurantResults.length > 0;
  const hasMenuItemResults = menuItemResults.length > 0;

  if (!hasRestaurantResults && !hasMenuItemResults) {
    return (
      <div className="text-center py-12 text-base-content/60">
        <p className="text-lg mb-2">No results found for "{searchQuery}"</p>
        <p className="text-sm">Try searching with different keywords</p>
      </div>
    );
  }

  // Group menu items by restaurant
  const menuItemsByRestaurant: Record<string, MenuItem[]> = {};
  menuItemResults.forEach((item) => {
    const restaurantId = item.restaurantId;
    if (!menuItemsByRestaurant[restaurantId]) {
      menuItemsByRestaurant[restaurantId] = [];
    }
    menuItemsByRestaurant[restaurantId].push(item);
  });

  return (
    <div className="space-y-8">
      {/* Restaurant Results */}
      {hasRestaurantResults && (
        <div>
          <h3 className="text-xl md:text-2xl font-semibold mb-4 text-base-content">
            Restaurants ({restaurantResults.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {restaurantResults.map((restaurant) => (
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
                  items[0]?.restaurant?.restaurant_name || "Unknown Restaurant";

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
