"use client";

import { restaurantApi } from "@/api/restaurant";
import { Restaurant } from "@/types/restaurant";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RestaurantCatalogue() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [when, setWhen] = useState("");
  const [time, setTime] = useState("");
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    fetchRestaurants();

    // Detect if device is iOS or Android
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
    setIsMobileDevice(isMobile);
  }, []);

  const fetchRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const data = await restaurantApi.fetchRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    const restaurantData = encodeURIComponent(JSON.stringify(restaurant));
    router.push(`/RestaurantCatalogue/${restaurant.id}?data=${restaurantData}`);
  };

  return (
    <div className="w-full px-4 py-6 bg-base-100">
      <div className="mb-8">
        {/* Desktop Layout */}
        <div
          className={`${
            isMobileDevice ? "hidden" : "hidden md:flex"
          } items-center justify-center gap-4`}
        >
          <div className="flex items-center gap-3 invisible">
            <button className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
            </button>
            <button className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-full shadow-lg px-8 py-3 max-w-2xl flex-1">
            <div className="flex-1 border-r border-gray-200 pr-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                When
              </label>
              <input
                type="date"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none cursor-pointer px-2"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                What time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none cursor-pointer px-2"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
            </button>
            <button className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className={`${isMobileDevice ? "block" : "md:hidden"}`}>
          <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                When
              </label>
              <input
                type="date"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className={`w-full text-sm text-gray-600 border border-gray-200 rounded-lg py-2 focus:outline-none focus:border-gray-400 cursor-pointer ${
                  !isMobileDevice ? "px-2" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                What time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full text-sm text-gray-600 border border-gray-200 rounded-lg py-2 focus:outline-none focus:border-gray-400 cursor-pointer ${
                  !isMobileDevice ? "px-2" : ""
                }`}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Filters
                </span>
              </button>
              <button className="flex-1 py-2 px-4 bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <span className="text-sm font-medium text-white">Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
              onClick={() => handleRestaurantClick(restaurant)}
              className="rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 border-2 border-base-300 cursor-pointer"
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
