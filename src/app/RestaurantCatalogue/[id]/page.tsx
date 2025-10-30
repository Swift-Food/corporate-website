"use client";

import { menuItemApi } from "@/api/menu-items";
import { CorporateMenuItem } from "@/types/menuItem";
import { Restaurant } from "@/types/restaurant";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RestaurantDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantId = params.id as string;

  const [menuItems, setMenuItems] = useState<CorporateMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("");
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  // Get ordered and visible groups based on menuGroupSettings
  const orderedGroups = (() => {
    const groups = Object.keys(groupedMenuItems);
    const settings = restaurant?.menuGroupSettings;

    if (!settings) return groups;

    // Filter visible groups and sort by display order
    return groups
      .filter((group) => {
        const groupSetting = settings[group];
        return !groupSetting || groupSetting.isVisible !== false;
      })
      .sort((a, b) => {
        const orderA = settings[a]?.displayOrder ?? 999;
        const orderB = settings[b]?.displayOrder ?? 999;
        return orderA - orderB;
      });
  })();

  // Set initial active group
  useEffect(() => {
    if (orderedGroups.length > 0 && !activeGroup) {
      setActiveGroup(orderedGroups[0]);
    }
  }, [orderedGroups, activeGroup]);

  // Scroll to section handler
  const scrollToSection = (groupTitle: string) => {
    const element = groupRefs.current[groupTitle];
    if (element) {
      const offset = 100; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveGroup(groupTitle);
    }
  };

  // Intersection Observer to update active tab on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const groupTitle = entry.target.getAttribute("data-group");
            if (groupTitle) {
              setActiveGroup(groupTitle);
            }
          }
        });
      },
      {
        rootMargin: "-100px 0px -50% 0px",
        threshold: 0,
      }
    );

    Object.values(groupRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [orderedGroups]);

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

      {/* Group Tabs Navigation */}
      {!loading && orderedGroups.length > 0 && (
        <div className="border-b border-base-300 bg-base-100 sticky top-0 z-10">
          <div className="px-4 md:px-8">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {orderedGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => scrollToSection(group)}
                  className={`py-4 px-4 font-medium text-sm md:text-base whitespace-nowrap border-b-2 transition-colors ${
                    activeGroup === group
                      ? "border-primary text-primary"
                      : "border-transparent text-base-content/60 hover:text-base-content"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-base-content/60">
            Loading menu items...
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12 text-base-content/60">
            No menu items available
          </div>
        ) : (
          <div className="space-y-12">
            {orderedGroups.map((groupTitle) => (
              <div
                key={groupTitle}
                ref={(el) => (groupRefs.current[groupTitle] = el)}
                data-group={groupTitle}
                className="scroll-mt-24"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-6">
                  {groupTitle}
                </h2>

                {/* Menu Items List */}
                <div className="space-y-4">
                  {groupedMenuItems[groupTitle]?.map((item) => (
                <div
                  key={item.id}
                  className="bg-base-100 border border-base-300 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Item Image */}
                    {item.image && (
                      <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
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

                    {/* Item Details */}
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
                        {/* More info link */}
                        <button className="text-sm text-base-content/50 hover:text-base-content underline mb-3">
                          More info
                        </button>

                        {/* Icons for Individual Portions and Eco-friendly */}
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

                    {/* Price and Add Button */}
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
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-base-content flex items-center justify-center hover:bg-base-content hover:text-base-100 transition-colors"
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

                  {/* Allergens and availability info */}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
