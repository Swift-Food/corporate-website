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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Approved Orders</h2>
            <p className="text-sm text-slate-500 mt-1">
              Track orders that are confirmed and in progress
            </p>
          </div>
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-500 mt-4">Loading approved orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-slate-600 font-medium">No approved orders</p>
          <p className="text-slate-500 text-sm mt-1">Orders will appear here once approved</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {orders.map((order) => (
            <div key={order.orderId} className="p-6">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Order #{order.orderId.slice(0, 4)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {formatDate(order.orderDate)} • {order.totalEmployees} employees
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    £{order.totalAmount.toFixed(2)}
                  </p>
                  {order.trackingUrl && (
                    <a 
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block"
                    >
                      Track Order →
                    </a>
                  )}
                </div>
              </div>

              {/* Delivery Timeline */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-4">
                  {order.estimatedDeliveryTime && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Estimated Delivery Time</p>
                      <p className="font-medium text-emerald-600">
                        {formatFullDateTime(order.estimatedDeliveryTime)}
                      </p>
                    </div>
                  )}
                  {order.actualDeliveryTime && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Delivered</p>
                      <p className="font-medium text-green-600">
                        {formatFullDateTime(order.actualDeliveryTime)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Restaurant Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Restaurants ({order.restaurants.length})
                  </h4>
                  <button
                    onClick={() => setExpandedOrderId(
                      expandedOrderId === order.orderId ? null : order.orderId
                    )}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {expandedOrderId === order.orderId ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {order.restaurants.map((restaurant) => (
                    <div key={restaurant.restaurantId} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-slate-900">{restaurant.restaurantName}</h5>
                          <p className="text-xs text-slate-500 mt-1">
                            {restaurant.itemCount} items • {restaurant.employeeCount} employees
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRestaurantStatusColor(restaurant.status)}`}>
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
                            <div key={idx} className="text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-700">
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="text-slate-900 font-medium">
                                  £{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              {item.addons.length > 0 && (
                                <p className="text-xs text-slate-500 ml-4">
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
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-slate-900">£{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-600">Delivery Fee:</span>
                  <span className="text-slate-900">£{order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-600">Total:</span>
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