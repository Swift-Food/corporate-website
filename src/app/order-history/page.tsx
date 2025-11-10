"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../interceptors/auth/authContext";
import { useRouter } from "next/navigation";
import { ordersApi } from "@/api/orders";
import { OrderHistoryResponse, OrderResponse } from "@/types/order";

export default function OrderHistoryPage() {
  const { corporateUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orderHistory, setOrderHistory] = useState<OrderHistoryResponse | null>(
    null
  );
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Dispatch event to open login modal instead of routing
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("open-login-modal", {
            detail: {
              message: "Please log in to view your order history.",
            },
          })
        );
      }
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (corporateUser?.id) {
      loadOrderHistory();
    }
  }, [corporateUser?.id, currentPage, itemsPerPage]);

  const loadOrderHistory = async () => {
    if (!corporateUser?.id) return;

    setLoadingOrders(true);
    setError("");
    try {
      const { data } = await ordersApi.getMyOrderHistory(
        corporateUser.id,
        currentPage,
        itemsPerPage
      );
      console.log("Data in order history: ", data);
      setOrderHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load order history");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading order history...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !corporateUser) {
    return null;
  }

  const renderOrderCard = (order: OrderResponse) => (
    <div
      key={order.id}
      className="card bg-base-100 rounded-xl mb-4 border border-base-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/order/${order.id}`)}
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-semibold text-lg">
              Order #{order.id.slice(0, 8)}
            </p>
            <p className="text-sm text-base-content/70">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="badge badge-primary badge-lg px-4 py-2 capitalize">
              {order.status}
            </div>
            <p className="text-lg font-bold mt-1">
              ${Number(order.totalAmount).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Restaurant Orders */}
        <div className="space-y-3">
          {order.restaurantOrders.map((restOrder, idx) => (
            <div key={idx} className="bg-base-200 rounded-lg p-3">
              <p className="font-semibold mb-2">{restOrder.restaurantName}</p>
              <div className="space-y-1">
                {restOrder.menuItems.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between text-sm">
                    <span className="text-base-content/80">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              {restOrder.specialInstructions && (
                <p className="text-xs text-base-content/60 mt-2 italic">
                  Note: {restOrder.specialInstructions}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* View Details Indicator */}
        <div className="flex items-center justify-end mt-3 text-primary text-sm font-semibold">
          <span>View Details</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => {
    if (!orderHistory?.pagination) return null;

    const { currentPage: page, totalPages } = orderHistory.pagination;
    const pages = [];

    // Show pagination controls only if there are multiple pages
    if (totalPages <= 1) return null;

    // Calculate page range to show
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content/70">Items per page:</span>
          <select
            className="select select-sm select-bordered"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="join">
          <button
            className="join-item btn btn-sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          {startPage > 1 && (
            <>
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
              {startPage > 2 && (
                <button className="join-item btn btn-sm btn-disabled">
                  ...
                </button>
              )}
            </>
          )}
          {pages.map((pageNum) => (
            <button
              key={pageNum}
              className={`join-item btn btn-sm ${
                pageNum === page ? "btn-active" : ""
              }`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <button className="join-item btn btn-sm btn-disabled">
                  ...
                </button>
              )}
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            className="join-item btn btn-sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>

        <div className="text-sm text-base-content/70">
          Showing {(page - 1) * itemsPerPage + 1} to{" "}
          {Math.min(page * itemsPerPage, orderHistory.pagination.totalItems)} of{" "}
          {orderHistory.pagination.totalItems} orders
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-2">
              Order History
            </h1>
            <p className="text-base-content/70">
              View all your past orders and their details
            </p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => router.push("/profile")}
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
            Back to Profile
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
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
        )}

        {/* Orders List */}
        <div className="mb-6">
          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : !orderHistory?.orders || orderHistory.orders.length === 0 ? (
            <div className="card bg-base-100 rounded-xl border border-base-200">
              <div className="card-body text-center py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-base-content/30 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-base-content/70 text-lg">
                  No order history found
                </p>
                <p className="text-base-content/50 text-sm mt-2">
                  You haven&apos;t placed any orders yet
                </p>
                <button
                  className="btn btn-primary mt-4"
                  onClick={() => router.push("/order")}
                >
                  Place Your First Order
                </button>
              </div>
            </div>
          ) : (
            <>
              {orderHistory.orders.map(renderOrderCard)}
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
