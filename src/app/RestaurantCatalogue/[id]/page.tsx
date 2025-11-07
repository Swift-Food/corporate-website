"use client";

import { menuItemApi } from "@/api/menu-items";
import { CorporateMenuItem } from "@/types/menuItem";
import { Restaurant } from "@/types/restaurant";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CartSidebar from "@/components/cart/CartSidebar";
import MobileCart from "@/components/cart/MobileCart";
import MenuItemCard from "@/components/catalogue/MenuItemCard";
import { transformMenuItems } from "@/util/menuItems";

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [menuItems, setMenuItems] = useState<CorporateMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("");
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Get restaurant data from sessionStorage
    const storedData = sessionStorage.getItem(`restaurant_${restaurantId}`);
    if (storedData) {
      try {
        setRestaurant(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing restaurant data:", error);
      }
    }

    const fetchItems = async () => {
      setLoading(true);
      try {
        const apiItems = await menuItemApi.fetchItemsFromRestaurant(
          restaurantId
        );
        const items = transformMenuItems(apiItems);
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [restaurantId]);

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

  // Auto-scroll the active tab into view
  useEffect(() => {
    if (
      activeGroup &&
      tabRefs.current[activeGroup] &&
      tabContainerRef.current
    ) {
      const activeTab = tabRefs.current[activeGroup];
      const container = tabContainerRef.current;

      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;
      const containerWidth = container.offsetWidth;
      const containerScrollLeft = container.scrollLeft;

      // Calculate the ideal scroll position to center the tab
      const idealScrollPosition = tabLeft - containerWidth / 2 + tabWidth / 2;

      container.scrollTo({
        left: idealScrollPosition,
        behavior: "smooth",
      });
    }
  }, [activeGroup]);

  // Scroll to section handler
  const scrollToSection = (groupTitle: string) => {
    const element = groupRefs.current[groupTitle];
    if (element) {
      const offset = 150; // Offset for navbar + tabs
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
        rootMargin: "-150px 0px -50% 0px",
        threshold: 0,
      }
    );

    Object.values(groupRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [orderedGroups]);

  const handleCheckout = () => {
    router.push("/checkout");
  };

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
        <div className="border-b border-base-300 bg-base-100 sticky top-16 md:top-20 z-40 shadow-sm">
          <div className="px-4 md:px-8">
            <div
              ref={tabContainerRef}
              className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {orderedGroups.map((group) => (
                <button
                  key={group}
                  ref={(el) => {
                    tabRefs.current[group] = el;
                  }}
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

      {/* Main Content Container */}
      <div className="flex gap-6 px-4 md:px-8 py-6 md:py-8 pb-24 lg:pb-8 max-w-7xl mx-auto">
        {/* Menu Items */}
        <div className="flex-1">
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
              {orderedGroups.map((groupTitle, index) => (
                <MenuItemCard
                  key={groupTitle}
                  groupTitle={groupTitle}
                  index={index}
                  ref={(el) => {
                    groupRefs.current[groupTitle] = el;
                  }}
                  groupedMenuItems={groupedMenuItems}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar - Desktop */}
        <CartSidebar
          topOffset="top-40"
          maxHeightOffset="12rem"
          widthPercentage={35}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Mobile Cart */}
      <MobileCart onCheckout={handleCheckout} />
    </div>
  );
}
