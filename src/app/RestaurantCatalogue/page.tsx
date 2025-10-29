"use client";

import { Restaurant } from "@/types/restaurant";
import { useEffect, useState } from "react";

export default function RestaurantCatalogue() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/restaurant`
      );
      const data = await response.json();
      console.log("Fetched restaurants: ", data);
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-6 bg-white">
      <h3 className="text-xl md:text-2xl font-semibold mb-6 text-base-content">
        Select Restaurant
      </h3>
      {restaurantsLoading ? (
        <div className="text-center py-12 text-base-content/60">
          Loading restaurants...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-base-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-base-300"
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                <img
                  src={restaurant.images?.[0] || "/placeholder.jpg"}
                  alt={restaurant.restaurant_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-lg text-base-content mb-2 line-clamp-1">
                  {restaurant.restaurant_name}
                </h4>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-base">★</span>
                  <span className="text-sm text-base-content/70">
                    {restaurant.averageRating || "No rating"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
