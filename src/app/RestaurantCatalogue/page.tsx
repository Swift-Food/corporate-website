"use client";

import { restaurantApi } from "@/api/restaurant";
import { Restaurant } from "@/types/restaurant";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import CartSidebar from "@/components/cart/CartSidebar";
import MobileCart from "@/components/cart/MobileCart";
import { organizationApi } from "@/api/organization";
import { useAuth } from "../../../interceptors/auth/authContext";
import { searchApi } from "@/api/search";
import SearchResults from "@/components/restaurant/SearchResults";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import FilterModal from "@/components/restaurant/FilterModal";
import { getDeliveryDisplayText } from "@/util/catalogue";
import { FilterProvider, useFilters } from "@/contexts/FilterContext";

function RestaurantCatalogueContent() {
  const router = useRouter();
  const { corporateUser, isAuthenticated } = useAuth();
  const { filters } = useFilters();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [when, setWhen] = useState("");
  const [time, setTime] = useState<string | null>("");
  const [cutoffTime, setCutoffTime] = useState<string>("11:00:00");
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchHovered, setSearchHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantSearchResults, setRestaurantSearchResults] = useState<
    Restaurant[]
  >([]);
  const [menuItemSearchResults, setMenuItemSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const closeButtonClickedRef = useRef(false);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  // Check for logout message
  useEffect(() => {
    const message = sessionStorage.getItem("logout_message");
    if (message) {
      setLogoutMessage(message);
      sessionStorage.removeItem("logout_message");

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setLogoutMessage(null);
      }, 5000);
    }
  }, []);

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

  // Re-run search when filters change
  useEffect(() => {
    console.log("Filters has changed: ", filters);
    // Always run handleSearch when filters change
    // It will clear results if both search and filters are empty
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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
      const fetchedCutoffTime = organizationData.orderCutoffTime ?? "11:00:00";
      setTime(fetchedOrgTime);
      setCutoffTime(fetchedCutoffTime);
      console.log("Fetched org time: ", fetchedOrgTime);
      console.log("Fetched cutoff time: ", fetchedCutoffTime);
    } catch (err) {
      console.error("Failed to fetch organization delivery time window: ", err);
      setTime(null);
      setCutoffTime("11:00:00");
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Check if there's no search query and no active filters
    const hasNoFilters =
      (!filters.dietaryRestrictions ||
        filters.dietaryRestrictions.length === 0) &&
      (!filters.allergens || filters.allergens.length === 0);

    if (!searchQuery.trim() && hasNoFilters) {
      setHasSearched(false);
      setRestaurantSearchResults([]);
      setMenuItemSearchResults([]);
      return;
    }

    console.log("Searching");

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search menu items first
      const response = await searchApi.searchMenuItems(searchQuery, {
        page: 1,
        limit: 50,
        dietaryFilters: filters.dietaryRestrictions,
        allergens: filters.allergens,
      });

      const menuItems = response.menuItems || [];
      setMenuItemSearchResults(menuItems);

      // Get unique restaurant IDs from menu items
      const restaurantIdsWithMatchingItems = new Set(
        menuItems.map((item: any) => item.restaurantId)
      );

      // Filter restaurants based on:
      // 1. Name match (if searching by name)
      // 2. Has matching menu items (especially important when filters are active)
      const restaurantMatches = restaurants.filter((restaurant) => {
        const nameMatches = restaurant.restaurant_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // If filters are active, only show restaurants with matching menu items
        const hasActiveFilters = !hasNoFilters;
        if (hasActiveFilters) {
          return restaurantIdsWithMatchingItems.has(restaurant.id);
        }

        // If no filters, show restaurants that match by name OR have matching menu items
        return nameMatches || restaurantIdsWithMatchingItems.has(restaurant.id);
      });

      setRestaurantSearchResults(restaurantMatches);
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
    setSearchFocused(false);
    setSearchHovered(false);
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
      {/* Logout Message Notification */}
      {logoutMessage && (
        <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-error/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 flex-shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm font-medium">{logoutMessage}</p>
            <button
              onClick={() => setLogoutMessage(null)}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
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
          </div>
        </div>
      )}

      <div className="flex gap-6 px-4 py-6 pb-24 lg:pb-6 mx-auto">
        <div className="flex-1">
          {/* Desktop Sticky Search/Filter Section */}
          <div className="hidden md:block md:sticky top-16 md:top-20 z-40 md:-mx-4 md:px-4 md:py-6 mb-[-1px] overflow-visible relative">
            {/* Desktop Layout */}
            <div className="flex items-center justify-center gap-4 relative w-full">
              {/* Date/Time Inputs */}
              <div className="flex items-center gap-3 bg-white rounded-full px-8 h-16 max-w-2xl flex-1 border border-base-200">
                <div className="flex-1 border-r border-gray-200 pr-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date
                  </label>
                  {/* <input
                    type="date"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none cursor-pointer px-2"
                  /> */}
                  <p className="text-sm text-gray-600">
                    {isAuthenticated ? getDeliveryDisplayText(cutoffTime, "short") : "Login To View"}
                  </p>
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
                  onMouseEnter={() => {
                    setSearchExpanded(true);
                    setSearchHovered(true);
                  }}
                  onMouseLeave={() => {
                    setSearchHovered(false);
                    if (!searchQuery && !searchFocused)
                      setSearchExpanded(false);
                  }}
                >
                  <div
                    className={`flex items-center bg-white rounded-full transition-all duration-300 ease-in-out overflow-hidden h-16 border border-base-200 ${
                      searchExpanded
                        ? "w-[400px] px-4 gap-3"
                        : "w-16 justify-center"
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
                          onFocus={() => setSearchFocused(true)}
                          onBlur={() => {
                            setSearchFocused(false);
                            // Close search if not hovering and no query
                            if (!searchHovered && !searchQuery) {
                              setSearchExpanded(false);
                            }
                          }}
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
                <div
                  onMouseEnter={() => setFilterExpanded(true)}
                  onMouseLeave={() => setFilterExpanded(false)}
                >
                  <button
                    onClick={() => {
                      // Don't open if close button was just clicked
                      if (closeButtonClickedRef.current) {
                        closeButtonClickedRef.current = false;
                        return;
                      }
                      if (!filterModalOpen) {
                        setFilterModalOpen(true);
                      }
                    }}
                    className={`rounded-full border border-base-200 transition-all duration-300 ease-in-out flex-shrink-0 flex items-center h-16 overflow-hidden ${
                      filterExpanded || filterModalOpen
                        ? "w-40 px-4 gap-2 justify-between"
                        : "w-16 justify-center"
                    } ${
                      filterModalOpen ? "bg-primary text-white" : "bg-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={`w-5 h-5  flex-shrink-0 ${
                        filterModalOpen ? "text-white" : "text-gray-700"
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                      />
                    </svg>
                    {(filterExpanded || filterModalOpen) && (
                      <>
                        <span
                          className={`text-sm font-medium whitespace-nowrap ${
                            filterModalOpen ? "text-white" : "text-gray-700"
                          }`}
                        >
                          Filters
                        </span>
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            closeButtonClickedRef.current = true;
                            setFilterModalOpen(false);
                          }}
                          className={`filter-close-btn rounded-full h-8 w-8 bg-white text-black flex justify-center items-center cursor-pointer ${
                            filterModalOpen ? "visible" : "invisible"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="6" y1="18" x2="18" y2="6" />
                          </svg>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Modal for Desktop */}
            <FilterModal
              isOpen={filterModalOpen}
              onClose={() => setFilterModalOpen(false)}
            />
          </div>
          {/* Mobile Layout - Date/Time (Not Sticky) */}
          <section className="md:hidden">
            <label className="mb-4 font-bold text-base-content">
              Delivery Details
            </label>
            <div className="mt-3 bg-white rounded-xl border-1 border-base-200">
              <div className="flex items-center gap-2 px-2">
                <div className="flex items-center gap-2 flex-1 px-4 py-1 border-r-1 border-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                  <span className="text-base text-base-content font-medium">
                    {isAuthenticated ? getDeliveryDisplayText(cutoffTime, "short") : "Login To View"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1 rounded-lg px-4 py-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-base text-gray-800 font-medium">
                    {time ? time : "Login To View"}
                  </span>
                </div>
              </div>
            </div>
          </section>
          {/* Mobile Search and Filter Row - STICKY */}
          <div className="md:hidden sticky top-16 z-40 -mx-4 px-4 py-3 mb-6">
            <div className="flex items-center gap-2 w-full">
              {/* Search Bar fills available width */}
              <div className="flex-1">
                <div className="flex items-center bg-white rounded-full h-12 px-3 w-full border-1 border-base-200">
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
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Search restaurants..."
                    className="flex-1 text-base text-gray-600 placeholder-gray-400 focus:outline-none bg-transparent ml-2"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
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
                </div>
              </div>
              {/* Filter Button - animated on mobile */}
              <button
                onClick={() => setFilterModalOpen(!filterModalOpen)}
                className={`rounded-full transition-all duration-300 ease-in-out flex-shrink-0 flex items-center justify-center h-12 overflow-hidden border-1 border-base-200 ${
                  filterModalOpen
                    ? "w-32 px-4 gap-2 bg-primary text-white"
                    : "w-12 bg-white"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-5 h-5 flex-shrink-0 ${
                    filterModalOpen ? "text-white" : "text-gray-700"
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                  />
                </svg>
                {filterModalOpen && (
                  <span className="text-sm font-medium whitespace-nowrap text-white">
                    Filters
                  </span>
                )}
              </button>
            </div>

            {/* Filter Modal for Mobile */}
            <FilterModal
              isOpen={filterModalOpen}
              onClose={() => setFilterModalOpen(false)}
            />
          </div>

          {/* Restaurant Grid / Search Results */}
          {hasSearched ? (
            <SearchResults
              restaurantResults={restaurantSearchResults}
              menuItemResults={menuItemSearchResults}
              isLoading={isSearching}
              searchQuery={searchQuery}
              onRestaurantClick={handleRestaurantClick}
              restaurants={restaurants}
            />
          ) : (
            <>
              {restaurantsLoading ? (
                <div className="text-center py-12 text-base-content/60">
                  Loading restaurants...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-1 md:px-12">
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

export default function RestaurantCatalogue() {
  return (
    <FilterProvider>
      <RestaurantCatalogueContent />
    </FilterProvider>
  );
}
