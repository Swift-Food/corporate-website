"use client";

import { useCart } from "@/context/CartContext";
import { ordersApi } from "@/api/orders";
import { restaurantApi } from "@/api/restaurant";
import {
  CreateEmployeeOrderDto,
  RestaurantOrder,
  MenuItem,
} from "@/types/order";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../interceptors/auth/authContext";
import LoginModal from "../components/LoginModal";
import { getNextWorkingDayISO } from "@/util/catalogue";
import { FilterProvider, useFilters } from "@/contexts/FilterContext";

function CheckoutPageNoFilterContext() {
  const router = useRouter();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { corporateUser, isAuthenticated } = useAuth();
  const { filters } = useFilters();
  const employeeId = corporateUser?.id; //user?.id || corporateUser?.id;

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [restaurantNames, setRestaurantNames] = useState<
    Record<string, string>
  >({});
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load delivery date and time from localStorage
  useEffect(() => {
    const savedDate = localStorage.getItem("delivery_date");
    const savedTime = localStorage.getItem("delivery_time");

    if (savedDate) setDeliveryDate(savedDate);
    if (savedTime) setDeliveryTime(savedTime);
  }, []);

  // Fetch restaurant data from API
  useEffect(() => {
    const fetchRestaurantNames = async () => {
      if (cartItems.length === 0) {
        setLoadingRestaurants(false);
        return;
      }

      try {
        setLoadingRestaurants(true);
        const restaurants = await restaurantApi.fetchRestaurants();

        // Create a map of restaurant ID to name
        const restaurantMap: Record<string, string> = {};
        restaurants.forEach((restaurant) => {
          restaurantMap[restaurant.id] = restaurant.restaurant_name;
        });

        setRestaurantNames(restaurantMap);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurantNames();
  }, [cartItems.length]);

  // Helper function to create ISO date string from date and time
  const getRequestedDeliveryTime = (): string => {
    if (deliveryDate && deliveryTime) {
      // Combine date and time into ISO format
      // const dateTimeString = `${deliveryDate}T${deliveryTime}`;
      // Use getNextWorkingDayISO for ISO date string
      const dateTimeString = `${getNextWorkingDayISO()}T${deliveryTime}`;
      const date = new Date(dateTimeString);

      // Check if date is valid
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    // Fallback to 1 hour from now if no date/time selected
    return new Date(Date.now() + 60 * 60 * 1000).toISOString();
  };

  // Group cart items by restaurant
  const groupedByRestaurant = cartItems.reduce((acc, cartItem) => {
    const restaurantId = cartItem.item.restaurantId;
    if (!acc[restaurantId]) {
      acc[restaurantId] = {
        restaurantId,
        restaurantName: restaurantNames[restaurantId] || "Unknown Restaurant",
        items: [],
      };
    }
    acc[restaurantId].items.push(cartItem);
    return acc;
  }, {} as Record<string, { restaurantId: string; restaurantName: string; items: typeof cartItems }>);

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store current page for redirect after login
      localStorage.setItem("redirect_after_login", "/checkout");
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Transform cart items into the backend DTO format
      const restaurantOrders: RestaurantOrder[] = Object.values(
        groupedByRestaurant
      ).map((group) => {
        const menuItems: MenuItem[] = group.items.map((cartItem) => {
          const price = parseFloat(cartItem.item.price?.toString() || "0");
          const discountPrice = parseFloat(
            cartItem.item.discountPrice?.toString() || "0"
          );
          const unitPrice =
            cartItem.item.isDiscount && discountPrice > 0
              ? discountPrice
              : price;

          // Calculate addon price
          const addonPrice = (cartItem.selectedAddons || []).reduce(
            (sum, addon) => sum + (addon.price || 0),
            0
          );

          const totalItemPrice = (unitPrice + addonPrice) * cartItem.quantity;

          return {
            menuItemId: cartItem.item.id,
            name: cartItem.item.name,
            quantity: cartItem.quantity,
            unitPrice,
            totalPrice: totalItemPrice,
            restaurantPrice: unitPrice,
            cateringQuantityUnit: cartItem.item.cateringQuantityUnit,
            feedsPerUnit: cartItem.item.feedsPerUnit,
            selectedAddons: cartItem.selectedAddons?.map((addon) => ({
              name: addon.optionName,
              price: addon.price,
              quantity: addon.quantity || 1,
              groupTitle: addon.addonName,
            })),
          };
        });

        return {
          restaurantId: group.restaurantId,
          restaurantName: group.restaurantName,
          menuItems,
          specialInstructions: specialInstructions || undefined,
        };
      });

      const orderData: CreateEmployeeOrderDto = {
        restaurantOrders,
        deliveryAddressId: "default-address-id", // TODO: Get from user context
        requestedDeliveryTime: getRequestedDeliveryTime(),
        specialInstructions: specialInstructions || undefined,
        dietaryRestrictions: [
          ...filters.dietaryRestrictions,
          ...filters.allergens,
        ].filter(Boolean),
      };
      if (!employeeId) {
        throw new Error();
      }
      const response = await ordersApi.createOrder(employeeId, orderData);

      console.log("Order created successfully:", response);

      // Clear cart and mark order as submitted
      clearCart();
      localStorage.setItem("corporate_order_submitted", "true");

      // Redirect to order details page
      router.push(`/order/${response.id}`);
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to submit order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-base-content mb-4">
            Your cart is empty
          </h1>
          <p className="text-base-content/60 mb-6">
            Add some items before checking out
          </p>
          <button
            onClick={() => router.push("/RestaurantCatalogue")}
            className="bg-primary hover:opacity-90 text-white py-3 px-6 rounded-lg font-bold"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  if (loadingRestaurants) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/60 mt-4">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-base-content mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Order Details Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Special Instructions */}
            <div className="bg-base-100 rounded-xl p-6 border border-base-300">
              <h2 className="text-2xl font-bold text-base-content mb-4">
                Order Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="specialInstructions"
                    className="block text-sm font-medium text-base-content mb-2"
                  >
                    Special Instructions
                  </label>
                  <textarea
                    id="specialInstructions"
                    rows={4}
                    className="w-full px-4 py-3 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-base-100 text-base-content"
                    placeholder="Any special requests for your order? (e.g., no onions, extra sauce)"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </div>

                {(filters.dietaryRestrictions.length > 0 ||
                  filters.allergens.length > 0) && (
                  <div>
                    <label className="block text-sm font-medium text-base-content mb-2">
                      Active Dietary Filters
                    </label>
                    <div className="p-4 bg-base-200 rounded-lg">
                      {filters.dietaryRestrictions.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-base-content/60 mb-1">
                            Dietary Restrictions:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {filters.dietaryRestrictions.map(
                              (filter, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                >
                                  {filter}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                      {filters.allergens.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-base-content/60 mb-1">
                            Allergens to Avoid:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {filters.allergens.map((allergen, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-error/10 text-error rounded-full text-sm"
                              >
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-base-content/60 mt-2">
                      These filters were set in the restaurant catalogue and
                      will be applied to your order.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items by Restaurant */}
            <div className="bg-base-100 rounded-xl p-6 border border-base-300">
              <h2 className="text-2xl font-bold text-base-content mb-4">
                Your Order
              </h2>

              <div className="space-y-6">
                {Object.values(groupedByRestaurant).map((group) => (
                  <div
                    key={group.restaurantId}
                    className="border-b border-base-300 pb-6 last:border-b-0 last:pb-0"
                  >
                    <h3 className="text-xl font-bold text-base-content mb-4">
                      {group.restaurantName}
                    </h3>

                    <div className="space-y-4">
                      {group.items.map(
                        ({ item, quantity, selectedAddons }, index) => {
                          const price = parseFloat(
                            item.price?.toString() || "0"
                          );
                          const discountPrice = parseFloat(
                            item.discountPrice?.toString() || "0"
                          );
                          const itemPrice =
                            item.isDiscount && discountPrice > 0
                              ? discountPrice
                              : price;

                          const addonPrice = (selectedAddons || []).reduce(
                            (sum, addon) => sum + (addon.price || 0),
                            0
                          );

                          const subtotal = (itemPrice + addonPrice) * quantity;

                          return (
                            <div
                              key={`${group.restaurantId}-${index}`}
                              className="flex gap-4 p-4 bg-base-200 rounded-lg"
                            >
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold text-base text-base-content">
                                      {item.name}
                                    </h4>
                                    {selectedAddons &&
                                      selectedAddons.length > 0 && (
                                        <div className="text-sm text-base-content/60 mt-1">
                                          {selectedAddons.map(
                                            (addon, addonIndex) => (
                                              <div key={addonIndex}>
                                                + {addon.optionName}
                                                {addon.price > 0 &&
                                                  ` (£${addon.price.toFixed(
                                                    2
                                                  )})`}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-primary">
                                      £{subtotal.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-base-content/60">
                                      Qty: {quantity}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-base-100 rounded-xl p-6 border border-base-300 sticky top-8">
              <h2 className="text-2xl font-bold text-base-content mb-6">
                Order Summary
              </h2>

              {/* Delivery Date and Time */}
              {deliveryDate && deliveryTime && (
                <div className="mb-6 p-4 bg-base-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-base-content/60 mb-2">
                    Delivery Time
                  </h3>
                  <p className="text-base font-medium text-base-content">
                    {new Date(
                      `${deliveryDate}T${deliveryTime}`
                    ).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-base font-medium text-base-content">
                    {new Date(
                      `${deliveryDate}T${deliveryTime}`
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-base-content">
                  <span>Subtotal</span>
                  <span>£{getTotalPrice().toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between text-base-content">
                  <span>Delivery Fee</span>
                  <span>£0.00</span>
                </div> */}
                <div className="border-t border-base-300 pt-3 flex justify-between text-xl font-bold text-base-content">
                  <span>Total</span>
                  <span>£{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </button>

              <button
                onClick={() => router.back()}
                className="w-full mt-3 bg-base-200 hover:bg-base-300 text-base-content py-3 rounded-lg font-medium transition-all"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <FilterProvider>
      <CheckoutPageNoFilterContext />
    </FilterProvider>
  );
}
