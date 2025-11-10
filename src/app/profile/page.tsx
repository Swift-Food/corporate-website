"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../interceptors/auth/authContext";
import { useRouter } from "next/navigation";
import { organizationApi } from "@/api/organization";
import { ordersApi } from "@/api/orders";
import { OrganizationResponseDto } from "@/types/organization";
import { OrderResponse } from "@/types/order";
import { OrderCard } from "@/components/order/OrderCard";

export default function ProfilePage() {
  const { user, corporateUser, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [organization, setOrganization] =
    useState<OrganizationResponseDto | null>(null);
  const [todayOrder, setTodayOrder] = useState<OrderResponse | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Dispatch event to open login modal instead of routing
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("open-login-modal", {
            detail: {
              message: "Please log in to view your profile.",
            },
          })
        );
      }
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (corporateUser?.organizationId) {
      loadOrganization();
    }
  }, [corporateUser?.organizationId]);

  useEffect(() => {
    if (corporateUser?.id) {
      loadActiveOrders();
    }
  }, [corporateUser?.id]);

  const loadOrganization = async () => {
    if (!corporateUser?.organizationId) return;

    setLoadingOrg(true);
    setError("");
    try {
      const data = await organizationApi.fetchOrganizationById(
        corporateUser.organizationId
      );
      setOrganization(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load organization");
    } finally {
      setLoadingOrg(false);
    }
  };

  const loadActiveOrders = async () => {
    if (!corporateUser?.id) return;

    setLoadingOrders(true);
    try {
      const data = await ordersApi.getMyOrder(corporateUser.id);
      setTodayOrder(data);
    } catch (err: any) {
      console.error("Failed to load today's order:", err);
      // Don't set error for orders as it's not critical
    } finally {
      setLoadingOrders(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !corporateUser || !user) {
    return null;
  }

  const fullName =
    `${corporateUser.firstName || ""} ${corporateUser.lastName || ""}`.trim() ||
    "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-2">
              Profile
            </h1>
            <p className="text-base-content/70">
              Manage your account information and view your orders
            </p>
          </div>
          <button
            className="btn btn-outline btn-error"
            onClick={() => setShowLogoutConfirm(true)}
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
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

        {/* User Information Card */}
        <div className="card bg-base-100 rounded-xl mb-6 px-4 py-4 border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-base-content/70 mb-1">Full Name</p>
                <p className="text-lg font-semibold">{fullName}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70 mb-1">Email</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70 mb-1">
                  Organization
                </p>
                {loadingOrg ? (
                  <div className="loading loading-spinner loading-sm"></div>
                ) : (
                  <p className="text-lg font-semibold">
                    {organization?.name || "N/A"}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-base-content/70 mb-1">Role</p>
                <p className="text-lg font-semibold capitalize">
                  {corporateUser.corporateRole}
                </p>
              </div>
              {corporateUser.department && (
                <div>
                  <p className="text-sm text-base-content/70 mb-1">
                    Department
                  </p>
                  <p className="text-lg font-semibold">
                    {corporateUser.department}
                  </p>
                </div>
              )}
              {corporateUser.designation && (
                <div>
                  <p className="text-sm text-base-content/70 mb-1">
                    Designation
                  </p>
                  <p className="text-lg font-semibold">
                    {corporateUser.designation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders Navigation Card */}
        <div className="card bg-base-100 rounded-xl mb-6 px-4 py-4 border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Orders</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="btn flex-1 shadow-none border-none"
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Order History
              </button>
            </div>
          </div>
        </div>

        {/* Today's Order Section */}
        <div className="card bg-base-100 rounded-xl mb-6 px-4 py-4 border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Today&apos;s Order</h2>
            {loadingOrders ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-lg text-primary"></div>
              </div>
            ) : !todayOrder ? (
              <div className="text-center py-8">
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
                  No order for today
                </p>
                <p className="text-base-content/50 text-sm mt-2">
                  You haven&apos;t placed an order today yet
                </p>
              </div>
            ) : (
              <OrderCard
                order={todayOrder as any}
                onClick={(orderId) => router.push(`/order/${orderId}`)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal modal-open">
          <div className="modal-box p-8">
            <h3 className="font-bold text-lg mb-4">Confirm Logout</h3>
            <p className="py-4">Are you sure you want to logout?</p>
            <div className="modal-action">
              <button
                className="btn shadow-none"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn bg-primary px-4 py-2 rounded-xl ml-4"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
