// components/dashboard/ApprovedOrdersTab.tsx

import { useState } from "react";

interface ApprovedOrder {
  orderId: string;
  orderDate: string;
  status: string;

  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  totalEmployees: number;
  trackingUrl?: string;
  driverId?: string;
  approvedBy: string;
  approvedAt: string;
  restaurants: {
    restaurantId: string;
    restaurantName: string;
    status: string;
    totalAmount: number;
    itemCount: number;
    employeeCount: number;
    items: {
      name: string;
      quantity: number;
      price: number;
      addons: string[];
    }[];
  }[];
}

interface ApprovedOrdersTabProps {
  orders: ApprovedOrder[];
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
}

export function ApprovedOrdersTab({ 
  orders, 
  isLoading, 
  error, 
  onRefresh 
}: ApprovedOrdersTabProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-blue-100 text-blue-700',
      sent_to_restaurant: 'bg-purple-100 text-purple-700',
      restaurant_accepted: 'bg-indigo-100 text-indigo-700',
      preparing: 'bg-amber-100 text-amber-700',
      out_for_delivery: 'bg-orange-100 text-orange-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getRestaurantStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      preparing: 'bg-amber-100 text-amber-700',
      delivered: 'bg-emerald-100 text-emerald-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFullDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short',   // Jan
      day: 'numeric',   // 15
      year: 'numeric',  // 2025
      hour: 'numeric',  // 1
      minute: '2-digit', // 00
      hour12: true      // PM
    });
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Approved Orders</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track orders that are confirmed and in progress
            </p>
          </div>
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm w-full sm:w-auto"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="m-4 sm:m-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-500 mt-4 text-sm sm:text-base">Loading approved orders...</p>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 sm:py-16 px-4">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-slate-600 font-medium text-sm sm:text-base">No approved orders</p>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Orders will appear here once approved</p>
        </div>
      ) : (
        /* Orders List */
        <div className="divide-y divide-slate-200">
          {orders.map((order) => (
            <div key={order.orderId} className="p-4 sm:p-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                      Order #{order.orderId.slice(0, 8)}
                    </h3>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {formatDate(order.orderDate)} • {order.totalEmployees} {order.totalEmployees === 1 ? 'employee' : 'employees'}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 sm:text-right">
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    £{order.totalAmount.toFixed(2)}
                  </p>
                  {order.trackingUrl && (
                    <a 
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                    >
                      Track Order →
                    </a>
                  )}
                </div>
              </div>

              {/* Delivery Timeline */}
              <div className="bg-slate-50 rounded-lg p-3 sm:p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {order.estimatedDeliveryTime && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Estimated Delivery</p>
                      <p className="text-sm font-medium text-emerald-600 break-words">
                        {formatFullDateTime(order.estimatedDeliveryTime)}
                      </p>
                    </div>
                  )}
                  {order.actualDeliveryTime && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Delivered</p>
                      <p className="text-sm font-medium text-green-600 break-words">
                        {formatFullDateTime(order.actualDeliveryTime)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Restaurant Summary */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Restaurants ({order.restaurants.length})
                  </h4>
                  <button
                    onClick={() => setExpandedOrderId(
                      expandedOrderId === order.orderId ? null : order.orderId
                    )}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium text-left sm:text-right"
                  >
                    {expandedOrderId === order.orderId ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {order.restaurants.map((restaurant) => (
                    <div key={restaurant.restaurantId} className="border border-slate-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-slate-900 text-sm sm:text-base truncate">
                            {restaurant.restaurantName}
                          </h5>
                          <p className="text-xs text-slate-500 mt-1">
                            {restaurant.itemCount} {restaurant.itemCount === 1 ? 'item' : 'items'} • {restaurant.employeeCount} {restaurant.employeeCount === 1 ? 'employee' : 'employees'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getRestaurantStatusColor(restaurant.status)}`}>
                          {restaurant.status}
                        </span>
                      </div>
                      
                      <p className="text-sm font-semibold text-slate-900 mt-2">
                        £{restaurant.totalAmount.toFixed(2)}
                      </p>

                      {/* Expanded Items */}
                      {expandedOrderId === order.orderId && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                          {restaurant.items.map((item, idx) => (
                            <div key={idx} className="text-xs sm:text-sm">
                              <div className="flex justify-between gap-2">
                                <span className="text-slate-700 flex-1 min-w-0">
                                  <span className="font-medium">{item.quantity}x</span> {item.name}
                                </span>
                                <span className="text-slate-900 font-medium whitespace-nowrap">
                                  £{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              {item.addons.length > 0 && (
                                <p className="text-xs text-slate-500 ml-4 mt-0.5 break-words">
                                  + {item.addons.join(', ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5 sm:space-y-1">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-slate-900 font-medium">£{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Delivery Fee:</span>
                  <span className="text-slate-900 font-medium">£{order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-semibold pt-1.5 sm:pt-1 border-t border-slate-200">
                  <span className="text-slate-900">Total:</span>
                  <span className="text-slate-900">£{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}