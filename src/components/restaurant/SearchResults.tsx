import { Restaurant } from "@/types/restaurant";
import RestaurantCard from "./RestaurantCard";
import { useState } from "react";
import MenuItemModal from "@/components/catalogue/MenuItemModal";
import { CorporateMenuItem, MenuItemStyle, Addon } from "@/types/menuItem";
import { useCart, SelectedAddon } from "@/context/CartContext";
import { menuItemApi } from "@/api/menu-items";
import { transformMenuItems } from "@/util/menuItems";

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
  addons?: Addon[];
  allergens?: string[];
  dietaryFilters?: string[];
  isDiscount?: boolean;
  discountPrice?: string;
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
  const { addToCart } = useCart();
  const [selectedItem, setSelectedItem] = useState<CorporateMenuItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullMenuItems, setFullMenuItems] = useState<
    Map<string, CorporateMenuItem[]>
  >(new Map());

  console.log(restaurants);
  if (isLoading) {
    return (
      <div className="text-center py-12 text-base-content/60">Searching...</div>
    );
  }

  const transformToMenuItem = (item: MenuItem): CorporateMenuItem => {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price || "0"),
      discountPrice: item.discountPrice ? parseFloat(item.discountPrice) : null,
      isDiscount: item.isDiscount || false,
      image: item.image,
      restaurantId: item.restaurantId,
      addons: item.addons || [],
      allergens: item.allergens || [],
      dietaryFilters:
        item.dietaryFilters as CorporateMenuItem["dietaryFilters"],
      groupTitle: "",
      itemDisplayOrder: 0,
      prepTime: 0,
      averageRating: 0,
      popular: false,
      isAvailable: true,
      status: "ACTIVE",
      style: MenuItemStyle.CARD,
      cateringQuantityUnit: 0,
      feedsPerUnit: 0,
      maxPortionsPerSession: null,
      limitedIngredientsContained: null,
      limitedIngredientsRemaining: null,
      createdAt: "",
      updatedAt: "",
      restaurant: item.restaurant,
    };
  };

  const handleItemClick = async (item: MenuItem) => {
    try {
      // Check if we already have the full menu items for this restaurant
      let restaurantMenuItems = fullMenuItems.get(item.restaurantId);

      if (!restaurantMenuItems) {
        // Fetch all menu items from the restaurant
        const apiItems = await menuItemApi.fetchItemsFromRestaurant(
          item.restaurantId
        );
        restaurantMenuItems = transformMenuItems(apiItems);

        // Cache the fetched items
        setFullMenuItems((prev) =>
          new Map(prev).set(item.restaurantId, restaurantMenuItems!)
        );
      }

      // Find the specific item from the full menu items
      const fullItem = restaurantMenuItems.find(
        (menuItem) => menuItem.id === item.id
      );

      if (fullItem) {
        setSelectedItem(fullItem);
        setIsModalOpen(true);
      } else {
        // Fallback to the transformed item if not found
        const corporateItem = transformToMenuItem(item);
        setSelectedItem(corporateItem);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching menu item details:", error);
      // Fallback to the basic transformed item
      const corporateItem = transformToMenuItem(item);
      setSelectedItem(corporateItem);
      setIsModalOpen(true);
    }
  };

  const handleAddItem = (
    item: CorporateMenuItem,
    quantity: number,
    selectedAddons: SelectedAddon[]
  ) => {
    addToCart(item, quantity, selectedAddons);
    setIsModalOpen(false);
    setSelectedItem(null);
  };

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
        <p className="text-lg mb-2">
          No results found for &quot;{searchQuery}&quot;
        </p>
        <p className="text-sm">Try searching with different keywords</p>
      </div>
    );
  }

  const getRestaurantNameFromId = (id: string) => {
    for (const restaurant of restaurants) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-1">
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
                          onClick={() => handleItemClick(item)}
                          className="bg-white rounded-lg border border-base-300 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
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

      {/* Menu Item Modal */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          onAddItem={handleAddItem}
        />
      )}
    </div>
  );
}
