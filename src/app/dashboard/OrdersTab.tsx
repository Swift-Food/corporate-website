// OrdersTab.tsx - Unified Orders Tab with sub-tabs
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { OrderSettings } from "./OrderSettings";
import { TodaysOrder } from "./TodaysOrder";
import { ApprovedOrdersTab } from "./ApprovedOrdersTab";
import { CateringOrdersTab } from "./CateringOrdersTab";

interface OrdersTabProps {
  // Orders (Today's Orders) props
  orderCutoffTime: string;
  deliveryTimeWindow: string;
  organizationId: string;
  todaysOrder: any;
  isLoading: boolean;
  onUpdateSettings: () => void;
  onApproveOrder: (
    paymentMethod: "wallet" | "stripe_direct",
    paymentMethodId?: string
  ) => void;
  onRejectSubOrder: (subOrderId?: string, employeeName?: string) => void;
  onBulkRejectSubOrders: (
    subOrderIds: string[],
    employeeNames: string[]
  ) => void;

  // Approved Orders props
  approvedOrders: any[];
  onRefreshApprovedOrders: () => void;

  // Catering Orders props
  managerId: string;
  cateringOrders: any[];
  cateringSummary: any;
  onRefreshCateringOrders: () => void;

  // Common error handling
  error: string;
}

export function OrdersTab({
  orderCutoffTime,
  deliveryTimeWindow,
  organizationId,
  todaysOrder,
  isLoading,
  onUpdateSettings,
  onApproveOrder,
  onRejectSubOrder,
  onBulkRejectSubOrders,
  approvedOrders,
  onRefreshApprovedOrders,
  managerId,
  cateringOrders,
  cateringSummary,
  onRefreshCateringOrders,
  error,
}: OrdersTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active sub-tab from URL, default to "orders"
  const activeSubTab = (searchParams.get("subtab") as
    | "orders"
    | "approved"
    | "catering"
    | null) || "orders";

  // Function to update the URL with the selected sub-tab
  const setActiveSubTab = (subtab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("subtab", subtab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="bg-white rounded-lg sm:rounded-xl border-slate-200 pt-8">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6">
            {(["orders", "approved", "catering"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                  activeSubTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab === "orders" && "Today's Orders"}
                {tab === "approved" && (
                  <>
                    <span>Approved Orders</span>
                    {approvedOrders.length > 0 && (
                      <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs">
                        {approvedOrders.length}
                      </span>
                    )}
                  </>
                )}
                {tab === "catering" && (
                  <>
                    <span>Catering Orders</span>
                    {cateringOrders.length > 0 && (
                      <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-purple-200 text-purple-800 rounded-full text-xs">
                        {cateringOrders.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sub-tab Content */}
        <div className="p-4 sm:p-6">
          {activeSubTab === "orders" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Order Settings
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Configure organization-wide order preferences
                  </p>
                </div>
                <button
                  onClick={onUpdateSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm w-full sm:w-auto"
                >
                  Refresh
                </button>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="text-slate-500 mt-4 text-sm sm:text-base">
                    Loading order settings...
                  </p>
                </div>
              ) : (
                <>
                  <OrderSettings
                    orderCutoffTime={orderCutoffTime}
                    deliveryTimeWindow={deliveryTimeWindow}
                    organizationId={organizationId}
                    onUpdate={onUpdateSettings}
                  />

                  {todaysOrder?.hasOrder ? (
                    <TodaysOrder
                      organizationId={organizationId}
                      managerId={managerId}
                      order={todaysOrder}
                      onApprove={onApproveOrder}
                      onReject={onRejectSubOrder}
                      onBulkReject={onBulkRejectSubOrders}
                    />
                  ) : (
                    !isLoading && (
                      <div className="mt-4 sm:mt-6 text-center py-8 sm:py-12 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
                        <svg
                          className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-3 sm:mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-slate-600 font-medium text-sm sm:text-base">
                          No orders placed today
                        </p>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1 px-4">
                          Orders will appear here once employees start placing
                          them
                        </p>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          )}

          {activeSubTab === "approved" && (
            <ApprovedOrdersTab
              orders={approvedOrders}
              isLoading={isLoading}
              error={error}
              onRefresh={onRefreshApprovedOrders}
            />
          )}

          {activeSubTab === "catering" && (
            <CateringOrdersTab
              managerId={managerId}
              organizationId={organizationId}
              isLoading={isLoading}
              orders={cateringOrders}
              summary={cateringSummary}
              onRefresh={onRefreshCateringOrders}
            />
          )}
        </div>
      </div>
    </div>
  );
}
