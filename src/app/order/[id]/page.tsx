"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../../interceptors/auth/authContext";
import { useRouter, useParams } from "next/navigation";
import { ordersApi } from "@/api/orders";
import { OrderResponse } from "@/types/order";

export default function OrderDetailsPage() {
  const { corporateUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Dispatch event to open login modal instead of routing
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("open-login-modal", {
            detail: {
              message: "Please log in to view order details.",
            },
          })
        );
      }
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (orderId && corporateUser?.id) {
      loadOrderDetails();
    }
  }, [orderId, corporateUser?.id]);

  const loadOrderDetails = async () => {
    if (!orderId) return;

    setLoadingOrder(true);
    setError("");
    try {
      const data = await ordersApi.getOrderById(orderId);
      console.log("Order data: ", data);
      setOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoadingOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    const statusColors: { [key: string]: string } = {
      pending: "badge-warning",
      pending_approval: "badge-warning",
      approved: "badge-info",
      preparing: "badge-info",
      ready: "badge-success",
      delivered: "badge-success",
      completed: "badge-success",
      rejected: "badge-error",
      cancelled: "badge-error",
    };
    return statusColors[lowerStatus] || "badge-primary";
  };

  if (isLoading || loadingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !corporateUser) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={() => router.push("/order-history")}
          >
            Back to Order History
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-2">
              Order Details
            </h1>
            <p className="text-base-content/70">
              Order #{order.id.slice(0, 8)}
            </p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => router.push("/order-history")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to History
          </button>
        </div>

        {/* Order Summary Card */}
        <div className="card bg-base-100 rounded-xl mb-6 border border-base-200">
          <div className="card-body p-6">
            <h2 className="card-title text-2xl mb-4">Order Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-base-content/70 mb-1">Order Date</p>
                <p className="text-lg font-semibold">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-base-content/70 mb-1">Status</p>
                <div
                  className={`badge ${getStatusColor(
                    order.status || ""
                  )} badge-lg px-4 py-3 capitalize text-base`}
                >
                  {order.status ? order.status.replace(/_/g, " ") : "Unknown"}
                </div>
              </div>
              {order.estimatedDeliveryTime && (
                <div>
                  <p className="text-sm text-base-content/70 mb-1">
                    Estimated Delivery
                  </p>
                  <p className="text-lg font-semibold">
                    {new Date(order.estimatedDeliveryTime).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              )}
              {order.paymentMethod && (
                <div>
                  <p className="text-sm text-base-content/70 mb-1">
                    Payment Method
                  </p>
                  <p className="text-lg font-semibold capitalize">
                    {order.paymentMethod.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="divider my-4"></div>
            <div className="space-y-2">
              <div className="flex justify-between text-base">
                <span className="text-base-content/70">Subtotal</span>
                <span className="font-semibold">
                  ${Number(order.subtotal).toFixed(2)}
                </span>
              </div>
              {/* <div className="flex justify-between text-base">
                <span className="text-base-content/70">Tax</span>
                <span className="font-semibold">
                  ${Number(order.taxAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-base-content/70">Delivery Fee</span>
                <span className="font-semibold">
                  ${Number(order.deliveryFee).toFixed(2)}
                </span>
              </div> */}
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-base text-success">
                  <span>Discount</span>
                  <span className="font-semibold">
                    -${Number(order.discount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="divider my-2"></div>
              <div className="flex justify-between text-xl">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mt-4 flex items-center gap-2">
              <div
                className={`badge ${
                  order.isPaid ? "badge-success" : "badge-warning"
                } badge-lg`}
              >
                {order.isPaid ? "Paid" : "Pending Payment"}
              </div>
              {order.paymentCompleted && (
                <div className="badge badge-info badge-lg">
                  Payment Completed
                </div>
              )}
            </div>

            {/* Rejection Reason */}
            {order.rejectionReason && (
              <div className="mt-4 alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-semibold">Order Rejected</p>
                  <p className="text-sm">{order.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Delivery Instructions */}
            {order.deliveryInstructions && (
              <div className="mt-4 p-3 bg-base-300 rounded-lg">
                <p className="text-sm font-semibold text-base-content/70 mb-1">
                  Delivery Instructions:
                </p>
                <p className="text-base text-base-content">
                  {order.deliveryInstructions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Restaurant Orders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-base-content">Order Items</h2>
          {order.restaurantOrders.map((restOrder, idx) => (
            <div
              key={idx}
              className="card bg-base-100 rounded-xl border border-base-200"
            >
              <div className="card-body p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-base-content">
                      {restOrder.restaurantName}
                    </h3>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-3">
                  {restOrder.menuItems.map((item, itemIdx) => (
                    <div key={itemIdx} className="bg-base-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">
                            {item.quantity}x {item.name}
                          </p>
                          <p className="text-sm text-base-content/70">
                            ${Number(item.unitPrice).toFixed(2)} each
                          </p>

                          {/* Selected Addons */}
                          {item.selectedAddons &&
                            item.selectedAddons.length > 0 && (
                              <div className="mt-2 ml-4 space-y-1">
                                {item.selectedAddons.map((addon, addonIdx) => (
                                  <p
                                    key={addonIdx}
                                    className="text-sm text-base-content/60"
                                  >
                                    + {addon.name}{" "}
                                    {addon.quantity > 1 && `x${addon.quantity}`}
                                    {addon.groupTitle &&
                                      ` (${addon.groupTitle})`}
                                  </p>
                                ))}
                              </div>
                            )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            ${item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                {restOrder.specialInstructions && (
                  <div className="mt-4 p-3 bg-base-300 rounded-lg">
                    <p className="text-sm font-semibold text-base-content/70 mb-1">
                      Special Instructions:
                    </p>
                    <p className="text-base text-base-content italic">
                      {restOrder.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
