"use client";

import { useCart } from "@/context/CartContext";
import { ordersApi } from "@/api/orders";
import { restaurantApi } from "@/api/restaurant";
import {
  CreateEmployeeOrderDto,
  RestaurantOrder,
  OrderResponse,
} from "@/types/order";
import { MenuItemStyle, MenuItemStatus } from "@/types/menuItem";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../interceptors/auth/authContext";
import LoginModal from "../components/LoginModal";
import { getNextWorkingDayISO, getDeliveryInfo, getDeliveryDisplayText } from "@/util/catalogue";
import { FilterProvider, useFilters } from "@/contexts/FilterContext";
import { organizationApi } from "@/api/organization";

function CheckoutPageNoFilterContext() {
  const router = useRouter();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { corporateUser, isAuthenticated, validateProfile } = useAuth();
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
  const [existingOrder, setExistingOrder] = useState<OrderResponse | null>(
    null
  );
  const [isWithinBudget, setIsWithinBudget] = useState(true);
  const [orderAction, setOrderAction] = useState<"replace" | "add" | null>("replace");
  const [isCheckingOrder, setIsCheckingOrder] = useState(true);
  const [cutoffTime, setCutoffTime] = useState<string>("11:00:00");

  // Load delivery date and time from localStorage
  useEffect(() => {
    const savedDate = localStorage.getItem("delivery_date");
    const savedTime = localStorage.getItem("delivery_time");

    if (savedDate) setDeliveryDate(savedDate);
    if (savedTime) setDeliveryTime(savedTime);
  }, []);

  // Fetch cutoff time from organization
  useEffect(() => {
    const fetchCutoffTime = async () => {
      if (!corporateUser?.organizationId) return;

      try {
        const organizationData = await organizationApi.fetchOrganizationById(
          corporateUser.organizationId
        );
        const fetchedCutoffTime = organizationData.orderCutoffTime ?? "11:00:00";
        setCutoffTime(fetchedCutoffTime);
      } catch (err) {
        console.error("Failed to fetch organization cutoff time: ", err);
        setCutoffTime("11:00:00");
      }
    };

    fetchCutoffTime();
  }, [corporateUser?.organizationId]);

  // Fetch existing active order
  useEffect(() => {
    const fetchExistingOrder = async () => {
      if (!employeeId || !isAuthenticated) {
        setIsCheckingOrder(false);
        return;
      }

      try {
        const order = await ordersApi.getMyOrder(employeeId);
        setExistingOrder(order);

        // Check budget if order exists
        if (order && corporateUser) {
          const newCartTotal = getTotalPrice();
          const existingOrderTotal = parseFloat(order.totalAmount.toString());
          const combinedTotal = newCartTotal + existingOrderTotal;
          const dailyBudgetRemaining = corporateUser.dailyBudgetRemaining;
          const withinBudget = combinedTotal <= dailyBudgetRemaining;

          setIsWithinBudget(withinBudget);
          // Default to "add" if within budget, otherwise "replace"
          setOrderAction(withinBudget ? "add" : "replace");
        }
      } catch (error) {
        console.error("Error fetching existing order:", error);
        // Not a critical error - user might not have an existing order
      } finally {
        setIsCheckingOrder(false);
      }
    };

    fetchExistingOrder();
  }, [employeeId, isAuthenticated, corporateUser, getTotalPrice]);

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
    // Get delivery info based on cutoff time
    const deliveryInfo = getDeliveryInfo(cutoffTime);

    if (deliveryTime) {
      // Use the delivery date from deliveryInfo (which respects cutoff time)
      const deliveryDateISO = deliveryInfo.deliveryDate.toISOString().split("T")[0];
      const dateTimeString = `${deliveryDateISO}T${deliveryTime}`;
      const date = new Date(dateTimeString);

      // Check if date is valid
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    // Fallback: use delivery date from deliveryInfo at noon
    const fallbackDate = new Date(deliveryInfo.deliveryDate);
    fallbackDate.setHours(12, 0, 0, 0);
    return fallbackDate.toISOString();
  };


  // Helper function to get items based on selected action
  const getItemsForOrder = () => {
    let itemsToOrder = [...cartItems];

    if (orderAction === "add" && existingOrder && existingOrder.subOrders) {
      existingOrder.subOrders.forEach((subOrder) => {
        subOrder.restaurants?.forEach((restaurant) => {
          restaurant.menuItems.forEach((menuItem) => {
            itemsToOrder.push({
              item: {
                id: menuItem.menuItemId,
                name: menuItem.menuItemName,
                price: menuItem.customerUnitPrice,
                restaurantId: restaurant.restaurantId,
                cateringQuantityUnit: menuItem.cateringQuantityUnit || 0,
                feedsPerUnit: menuItem.feedsPerUnit || 0,
                isDiscount: menuItem.isDiscounted,
                allergens: [],
                style: MenuItemStyle.CARD,
                itemDisplayOrder: 0,
                prepTime: 0,
                averageRating: 0,
                popular: false,
                isAvailable: true,
                status: "ACTIVE" as MenuItemStatus,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              quantity: menuItem.quantity,
              selectedAddons: menuItem.selectedAddons?.map((addon) => ({
                addonName: addon.groupTitle || "",
                optionName: addon.name,
                price: addon.customerUnitPrice,
                quantity: addon.quantity,
              })),
            });
          });
        });
      });
    }

    return itemsToOrder;
  };

  // Helper function to calculate total price based on selected action
  const getSelectedTotal = () => {
    const itemsToCalculate = getItemsForOrder();

    return itemsToCalculate.reduce((total, cartItem) => {
      const price = parseFloat(cartItem.item.price?.toString() || "0");
      const discountPrice = parseFloat(
        cartItem.item.discountPrice?.toString() || "0"
      );
      const itemPrice =
        cartItem.item.isDiscount && discountPrice > 0 ? discountPrice : price;

      const addonPrice = (cartItem.selectedAddons || []).reduce(
        (sum, addon) => sum + (addon.price || 0),
        0
      );

      return total + (itemPrice + addonPrice) * cartItem.quantity;
    }, 0);
  };

  // Helper function to group items by restaurant for display
  const getGroupedItems = (items: typeof cartItems) => {
    return items.reduce((acc, cartItem) => {
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
    }, {} as Record<string, { restaurantId: string; restaurantName: string; items: typeof items }>);
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // Check if past cutoff time
    const deliveryInfo = getDeliveryInfo(cutoffTime);
    if (!deliveryInfo.canOrder) {
      setError(`Orders are currently closed. The cut-off time for today (${deliveryInfo.formattedCutoffTime}) has passed. Please come back tomorrow to place your order.`);
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
      // Validate profile before creating order
      const isValid = await validateProfile();
      if (!isValid) {
        // User will be logged out by validateProfile
        return;
      }
      // Get items based on selected action
      const itemsToOrder = getItemsForOrder();

      // Group items by restaurant
      const groupedItems = getGroupedItems(itemsToOrder);

      const restaurantOrders: RestaurantOrder[] = Object.values(
        groupedItems
      ).map((group) => ({
        restaurantId: group.restaurantId,
        restaurantName: group.restaurantName,
        menuItems: group.items.map((cartItem) => ({
          menuItemId: cartItem.item.id,
          quantity: cartItem.quantity,
          selectedAddons: cartItem.selectedAddons?.map((addon) => ({
            name: addon.optionName,
            quantity: addon.quantity || 1,
            groupTitle: addon.addonName,
          })),
        })),
        specialInstructions: specialInstructions || undefined,
      }));

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

      // Reset order action state
      setOrderAction(null);
      setExistingOrder(null);

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

  if (loadingRestaurants || isCheckingOrder) {
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
            {/* Selection UI if existing order exists */}
            {existingOrder && (
              <div className="bg-base-100 rounded-xl p-6 border border-base-300">
                <h2 className="text-2xl font-bold text-base-content mb-4">
                  Choose Your Order Option
                </h2>

                {!isWithinBudget && (
                  <div className="bg-error/10 border border-error rounded-lg p-4 mb-6">
                    <p className="text-error font-semibold mb-2">
                      Budget Limit Reached
                    </p>
                    <p className="text-error/80 text-sm">
                      Adding to your existing order would exceed your daily
                      budget limit. You can only replace your existing order.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Replace Option */}
                  <div
                    onClick={() => setOrderAction("replace")}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      orderAction === "replace"
                        ? "border-primary bg-primary/5"
                        : "border-base-300 hover:border-base-400"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={orderAction === "replace"}
                        onChange={() => setOrderAction("replace")}
                        className="radio radio-primary mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-base-content mb-1">
                          Replace Existing Order
                        </h3>
                        <p className="text-sm text-base-content/60 mb-3">
                          Your existing order will be replaced with the new
                          items in your cart.
                        </p>
                        <p className="text-base font-semibold text-primary">
                          Total: £
                          {
                            // Calculate total for new cart items only
                            cartItems
                              .reduce((total, cartItem) => {
                                const price = parseFloat(
                                  cartItem.item.price?.toString() || "0"
                                );
                                const discountPrice = parseFloat(
                                  cartItem.item.discountPrice?.toString() || "0"
                                );
                                const itemPrice =
                                  cartItem.item.isDiscount && discountPrice > 0
                                    ? discountPrice
                                    : price;
                                const addonPrice = (
                                  cartItem.selectedAddons || []
                                ).reduce(
                                  (sum, addon) => sum + (addon.price || 0),
                                  0
                                );
                                return (
                                  total +
                                  (itemPrice + addonPrice) * cartItem.quantity
                                );
                              }, 0)
                              .toFixed(2)
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add Option - Only show if within budget */}
                  {isWithinBudget && (
                    <div
                      onClick={() => setOrderAction("add")}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        orderAction === "add"
                          ? "border-primary bg-primary/5"
                          : "border-base-300 hover:border-base-400"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          checked={orderAction === "add"}
                          onChange={() => setOrderAction("add")}
                          className="radio radio-primary mt-1"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-base-content mb-1">
                            Add to Existing Order
                          </h3>
                          <p className="text-sm text-base-content/60 mb-3">
                            Combine your existing order with the new items in
                            your cart.
                          </p>
                          <p className="text-base font-semibold text-primary">
                            Total: £
                            {
                              // Calculate combined total when add is selected
                              (() => {
                                const newCartTotal = cartItems.reduce(
                                  (total, cartItem) => {
                                    const price = parseFloat(
                                      cartItem.item.price?.toString() || "0"
                                    );
                                    const discountPrice = parseFloat(
                                      cartItem.item.discountPrice?.toString() ||
                                        "0"
                                    );
                                    const itemPrice =
                                      cartItem.item.isDiscount &&
                                      discountPrice > 0
                                        ? discountPrice
                                        : price;
                                    const addonPrice = (
                                      cartItem.selectedAddons || []
                                    ).reduce(
                                      (sum, addon) => sum + (addon.price || 0),
                                      0
                                    );
                                    return (
                                      total +
                                      (itemPrice + addonPrice) *
                                        cartItem.quantity
                                    );
                                  },
                                  0
                                );

                                const existingTotal = parseFloat(
                                  existingOrder.totalAmount.toString()
                                );
                                return (newCartTotal + existingTotal).toFixed(
                                  2
                                );
                              })()
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cart Items by Restaurant */}
            <div className="bg-base-100 rounded-xl p-6 border border-base-300">
              <h2 className="text-2xl font-bold text-base-content mb-4">
                {existingOrder && orderAction
                  ? orderAction === "replace"
                    ? "New Order (Replacing Existing)"
                    : "Combined Order (Existing + New)"
                  : "Your Order"}
              </h2>

              <div className="space-y-6">
                {Object.values(getGroupedItems(getItemsForOrder())).map(
                  (group) => (
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

                            const subtotal =
                              (itemPrice + addonPrice) * quantity;

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
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-base-100 rounded-xl p-6 border border-base-300 sticky top-8">
              <h2 className="text-2xl font-bold text-base-content mb-6">
                Order Summary
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

                {/* {(filters.dietaryRestrictions.length > 0 ||
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
                )} */}
              </div>

              {/* Delivery Date and Time */}
              {(() => {
                const deliveryInfo = getDeliveryInfo(cutoffTime);
                return (
                  <div className={`mb-6 p-4 rounded-lg ${deliveryInfo.canOrder ? 'bg-base-200' : 'bg-error/10 border border-error'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${deliveryInfo.canOrder ? 'text-base-content/60' : 'text-error'}`}>
                      {deliveryInfo.canOrder ? 'Delivery Time' : 'Order Status'}
                    </h3>
                    {deliveryInfo.canOrder ? (
                      <>
                        <p className="text-base font-medium text-base-content">
                          {getDeliveryDisplayText(cutoffTime, "long")}
                        </p>
                        {deliveryTime && (
                          <p className="text-base font-medium text-base-content">
                            {deliveryTime}
                          </p>
                        )}
                        <p className="text-xs text-base-content/60 mt-2">
                          Order by {deliveryInfo.formattedCutoffTime} on {deliveryInfo.cutoffDateTime.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-medium text-error mb-2">
                          {getDeliveryDisplayText(cutoffTime, "short")}
                        </p>
                        <p className="text-sm text-error/80">
                          Orders are currently closed. Please come back tomorrow to place your order.
                        </p>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Budget Information */}
              {/* {existingOrder && (
                <div className="mb-6 p-4 bg-info/10 border border-info rounded-lg">
                  <h3 className="text-sm font-semibold text-info mb-2">
                    Budget Information
                  </h3>
                  <div className="space-y-1 text-xs text-base-content/80">
                    <div className="flex justify-between">
                      <span>Current Selection:</span>
                      <span className="font-semibold">
                        {orderAction === "replace" ? "Replace Order" : "Add to Order"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Existing Order:</span>
                      <span className="font-semibold">
                        £{parseFloat(existingOrder.totalAmount.toString()).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Cart:</span>
                      <span className="font-semibold">£{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-info/20 pt-1 mt-1">
                      <span>Daily Budget Remaining:</span>
                      <span className="font-semibold">
                        £{corporateUser?.dailyBudgetRemaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )} */}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-base-content">
                  <span>Subtotal</span>
                  <span>£{getSelectedTotal().toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between text-base-content">
                  <span>Delivery Fee</span>
                  <span>£0.00</span>
                </div> */}
                <div className="border-t border-base-300 pt-3 flex justify-between text-xl font-bold text-base-content">
                  <span>Total</span>
                  <span>£{getSelectedTotal().toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || !getDeliveryInfo(cutoffTime).canOrder}
                className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!getDeliveryInfo(cutoffTime).canOrder
                  ? "Orders Closed"
                  : isSubmitting
                  ? "Placing Order..."
                  : existingOrder && orderAction
                  ? orderAction === "replace"
                    ? "Replace & Place Order"
                    : "Add & Place Order"
                  : "Place Order"}
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
