"use client";

import { restaurantApi } from "@/api/restaurant";
import { Restaurant } from "@/types/restaurant";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CartSidebar from "@/components/cart/CartSidebar";
import MobileCart from "@/components/cart/MobileCart";
import { organizationApi } from "@/api/organization";
import { useAuth } from "../../../interceptors/auth/authContext";
import { searchApi } from "@/api/search";
import SearchResults from "@/components/restaurant/SearchResults";
import RestaurantCard from "@/components/restaurant/RestaurantCard";

export default function RestaurantCatalogue() {
  const router = useRouter();
  const { corporateUser } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [when, setWhen] = useState("");
  const [time, setTime] = useState<string | null>("");
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantSearchResults, setRestaurantSearchResults] = useState<
    Restaurant[]
  >([]);
  const [menuItemSearchResults, setMenuItemSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchRestaurants();

    // Detect if device is iOS or Android
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
    setIsMobileDevice(isMobile);

    // Load saved date/time from localStorage
    const savedDate = localStorage.getItem("delivery_date");
    if (savedDate) setWhen(savedDate);
  }, []);

  useEffect(() => {
    fetchOrganizationDeliveryTime();
  });

  // Save date and time to localStorage whenever they change
  useEffect(() => {
    if (when) {
      localStorage.setItem("delivery_date", when);
    }
  }, [when]);

  useEffect(() => {
    if (time) {
      localStorage.setItem("delivery_time", time);
    }
  }, [time]);

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

  const fetchOrganizationDeliveryTime = async () => {
    const organizationData = await organizationApi.fetchOrganizationById(
      corporateUser?.organizationId ?? ""
    );

    try {
      const fetchedOrgTime = organizationData.defaultDeliveryTimeWindow ?? null;
      setTime(fetchedOrgTime);
      console.log("Fetched org time: ", fetchedOrgTime);
    } catch (err) {
      console.error("Failed to fetch organization delivery time window: ", err);
      setTime(null);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchQuery.trim()) {
      setHasSearched(false);
      setRestaurantSearchResults([]);
      setMenuItemSearchResults([]);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search restaurants
      const restaurantMatches = restaurants.filter((restaurant) =>
        restaurant.restaurant_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setRestaurantSearchResults(restaurantMatches);

      // Search menu items
      const response = await searchApi.searchMenuItems(searchQuery, {
        page: 1,
        limit: 50,
      });

      setMenuItemSearchResults(response.menuItems || []);
    } catch (error) {
      console.error("Error searching:", error);
      setRestaurantSearchResults([]);
      setMenuItemSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setHasSearched(false);
    setRestaurantSearchResults([]);
    setMenuItemSearchResults([]);
    setSearchExpanded(false);
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    // Store restaurant data in sessionStorage to avoid URL length limits
    sessionStorage.setItem(
      `restaurant_${restaurant.id}`,
      JSON.stringify(restaurant)
    );
    router.push(`/RestaurantCatalogue/${restaurant.id}`);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="w-full bg-base-100">
      <div className="flex gap-6 px-4 py-6 pb-24 lg:pb-6 mx-auto">
        <div className="flex-1 relative">
          {/* Sticky Search/Filter Section */}
          <div className="md:sticky top-16 md:top-20 z-40 -mx-4 px-4 py-6 mb-[-1px]">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-center gap-4">
              {/* Date/Time Inputs */}
              <div className="flex items-center gap-3 bg-white rounded-full shadow-lg px-8 h-12 max-w-2xl flex-1">
                <div className="flex-1 border-r border-gray-200 pr-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date
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
                    Time
                  </label>
                  <p className="text-sm text-gray-600 placeholder-gray-400">
                    {time ? time : "Login To View"}
                  </p>
                </div>
              </div>

              {/* Right Side Buttons Container */}
              <div className="flex items-center gap-3">
                {/* Search Button/Bar */}
                <div
                  className="group flex items-center"
                  onMouseEnter={() => setSearchExpanded(true)}
                  onMouseLeave={() => {
                    if (!searchQuery) setSearchExpanded(false);
                  }}
                >
                  <div
                    className={`flex items-center bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out overflow-hidden h-12 ${
                      searchExpanded ? "w-[400px] px-4 gap-3" : "w-12 justify-center"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-400 flex-shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                    {searchExpanded && (
                      <>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSearch();
                            }
                          }}
                          placeholder="Search restaurants..."
                          className="flex-1 text-sm text-gray-600 placeholder-gray-400 focus:outline-none"
                        />
                        {searchQuery && (
                          <button
                            onClick={clearSearch}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Filter Button */}
                <button className="w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow flex-shrink-0 flex items-center justify-center">
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
                </button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden block">
              <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Search restaurants or menu items..."
                    className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg py-2 px-2 focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Date
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
                    Time
                  </label>
                  <p className="text-sm text-gray-600 placeholder-gray-400 border border-gray-200 rounded-lg py-2 px-2">
                    {time ? time : "Login To View"}
                  </p>
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
                  <button
                    onClick={() => handleSearch()}
                    className="flex-1 py-2 px-4 bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
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
                    <span className="text-sm font-medium text-white">
                      Search
                    </span>
                  </button>
                  {hasSearched && (
                    <button
                      onClick={clearSearch}
                      className="flex-shrink-0 py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Clear
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Grid / Search Results */}
          {hasSearched ? (
            <SearchResults
              restaurantResults={restaurantSearchResults}
              menuItemResults={menuItemSearchResults}
              isLoading={isSearching}
              searchQuery={searchQuery}
              onRestaurantClick={handleRestaurantClick}
            />
          ) : (
            <>
              <h3 className="text-xl md:text-2xl font-semibold mb-6 text-base-content">
                Select Restaurant
              </h3>
              {restaurantsLoading ? (
                <div className="text-center py-12 text-base-content/60">
                  Loading restaurants...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onClick={handleRestaurantClick}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart Sidebar */}
        {/* <CartSidebar
          topOffset="top-36"
          maxHeightOffset="11rem"
          widthPercentage={25}
          onCheckout={handleCheckout}
        /> */}
      </div>

      {/* Mobile Cart */}
      {/* <MobileCart onCheckout={handleCheckout} /> */}
    </div>
  );
}
