// app/(platform)/corporate/dashboard/CateringOrdersTab.tsx
'use client';

import { useState } from 'react';

interface CateringOrdersTabProps {
  isLoading: boolean;
  orders: any[];
  summary: any;
  onRefresh: () => void;
}

export function CateringOrdersTab({
  isLoading,
  orders,
  summary,
  onRefresh,
}: CateringOrdersTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const getStatusColor = (status: string) => {
    const colors = {
      'pending_review': 'bg-yellow-100 text-yellow-700',
      'admin_reviewed': 'bg-blue-100 text-blue-700',
      'payment_link_sent': 'bg-purple-100 text-purple-700',
      'paid': 'bg-green-100 text-green-700',
      'confirmed': 'bg-emerald-100 text-emerald-700',
      'completed': 'bg-slate-100 text-slate-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{summary.pendingReview}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{summary.upcoming}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">£{summary.totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Catering Orders</h2>
            <p className="text-sm text-slate-500 mt-1">Manage your organization's catering orders</p>
          </div>
          <div className="flex gap-3">
            <a
              href="https://swiftfood.uk/event-order"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Catering Order
            </a>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {['all', 'pending_review', 'paid', 'confirmed', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'All' : formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-500 mt-4">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-slate-600 font-medium">No catering orders found</p>
          <p className="text-slate-500 text-sm mt-1">Catering orders will appear here once placed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {order.eventType ? order.eventType.charAt(0).toUpperCase() + order.eventType.slice(1) : 'Event'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                      {order.isPaidWithWallet && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Paid with Wallet
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><strong>Customer:</strong> {order.customerName}</p>
                      <p>
                        <strong>Delivery Date & Time:</strong> {new Date(order.eventDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })} at {order.eventTime}
                      </p>
                      <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                      {order.corporateUser && (
                        <p><strong>Ordered by:</strong> {order.corporateUser.firstName} {order.corporateUser.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-slate-900">£{Number(order.customerFinalTotal || order.finalTotal || 0).toFixed(2)}</p>
                    {order.isPaidWithWallet && order.walletAmountUsed > 0 && (
                      <p className="text-sm text-green-600 mt-1">Paid: £{Number(order.walletAmountUsed).toFixed(2)}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Ordered {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        {(order.restaurants || order.orderItems)?.length || 0} Restaurant{(order.restaurants || order.orderItems)?.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(order.restaurants || order.orderItems)?.slice(0, 3).map((item: any, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                            {item.restaurantName}
                          </span>
                        ))}
                        {(order.restaurants || order.orderItems)?.length > 3 && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                            +{(order.restaurants || order.orderItems).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                      <svg 
                        className={`w-4 h-4 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrderId === order.id && (
                <div className="border-t border-slate-200 bg-slate-50 p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Order Items</h4>
                  
                  <div className="space-y-6">
                    {(order.restaurants || order.orderItems)?.map((restaurantOrder: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                          <h5 className="font-semibold text-slate-900">{restaurantOrder.restaurantName}</h5>
                          <span className="text-sm font-medium text-slate-700">
                            £{Number(restaurantOrder.customerTotal || restaurantOrder.totalPrice || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {restaurantOrder.menuItems?.map((menuItem: any, menuIdx: number) => (
                            <div key={menuIdx} className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-800">{menuItem.menuItemName || menuItem.name}</p>
                                <p className="text-sm text-slate-600 mt-1">
                                  Quantity: {menuItem.quantity} × £{Number(menuItem.customerUnitPrice || menuItem.unitPrice || 0).toFixed(2)}
                                </p>

                                {menuItem.selectedAddons && menuItem.selectedAddons.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {menuItem.selectedAddons.map((addon: any, addonIdx: number) => (
                                      <p key={addonIdx} className="text-xs text-slate-500 pl-4">
                                        + {addon.name}
                                        {addon.quantity > 1 && ` (×${addon.quantity})`}
                                        {(addon.customerUnitPrice || addon.price) > 0 && ` - £${Number(addon.customerUnitPrice || addon.price).toFixed(2)}`}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-slate-900">
                                  £{Number(menuItem.customerTotalPrice || menuItem.totalPrice || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="mt-6 bg-white rounded-lg p-4 border border-slate-200">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium text-slate-900">£{Number(order.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Delivery Fee</span>
                        <span className="font-medium text-slate-900">£{Number(order.deliveryFee || 0).toFixed(2)}</span>
                      </div>
                      {order.promoDiscount && Number(order.promoDiscount) > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Promo Discount</span>
                          <span className="font-medium">-£{Number(order.promoDiscount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200 flex justify-between">
                        <span className="font-semibold text-slate-900">Total</span>
                        <span className="font-bold text-lg text-slate-900">£{Number(order.customerFinalTotal || order.finalTotal || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {order.specialRequirements && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-yellow-800 mb-1">Special Requirements:</p>
                      <p className="text-sm text-yellow-700">{order.specialRequirements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}