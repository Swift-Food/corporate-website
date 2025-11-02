// components/dashboard/TodaysOrder.tsx
import apiClient from '@/api/client';
import { PaymentSelectionModal } from '@/modals/paymentSelectModal';
import { useState } from 'react';

interface TodaysOrderProps {
  order: any;
  organizationId: string;
  managerId: string;
  onApprove: (paymentMethod: 'wallet' | 'stripe_direct', paymentMethodId?: string) => void;
  onReject: (subOrderId?: string, employeeName?: string) => void;
  onBulkReject: (ids: string[], names: string[]) => void;
}

export function TodaysOrder({ order, onApprove, organizationId, managerId, onReject, onBulkReject }: TodaysOrderProps) {
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);
  const [selectedSubOrders, setSelectedSubOrders] = useState<Set<string>>(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSelectAll = () => {
    if (selectedSubOrders.size === order.employeeOrders?.length) {
      setSelectedSubOrders(new Set());
    } else {
      const allIds: Set<string> = new Set(
        order.employeeOrders
          ?.filter((emp: any) => emp.status !== 'REJECTED')
          .map((emp: any) => emp.subOrderId) || []
      );
      setSelectedSubOrders(allIds);
    }
  };

  const handleApproveClick = async () => {
    const response = await apiClient.post(`/corporate-orders/validate-approval/${order.orderId}`, {
      managerId: managerId
    });

    if (!response.data) {
      const error = await response.data.error;
      throw new Error(error.message || 'Cannot approve order at this time');
    }
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (
    paymentMethod: 'wallet' | 'stripe_direct',
    paymentMethodId?: string
  ) => {
    onApprove(paymentMethod, paymentMethodId);
  };

  const handleToggleSubOrder = (subOrderId: string) => {
    const newSelected = new Set(selectedSubOrders);
    if (newSelected.has(subOrderId)) {
      newSelected.delete(subOrderId);
    } else {
      newSelected.add(subOrderId);
    }
    setSelectedSubOrders(newSelected);
  };

  if (!order?.hasOrder) return null;

  return (
    <div className="mt-6 space-y-6">
      {/* Order Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Today's Order</h3>
            <div className="flex items-center space-x-3">
              {order.status === 'pending_approval' && (
                <>
                  <button
                    onClick={() => onReject()}
                    disabled={isValidating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center space-x-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Reject All</span>
                  </button>
                  <button
                    onClick={handleApproveClick}
                    disabled={isValidating}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isValidating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Validating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Approve & Pay</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Show validation error if any */}
          {validationError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Cannot approve order</p>
                  <p className="text-sm text-red-700 mt-1">{validationError}</p>
                </div>
                <button
                  onClick={() => setValidationError('')}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Total Employees</p>
            <p className="text-2xl font-bold text-slate-900">{order.totalEmployees}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-600 mb-1">Subtotal</p>
            <p className="text-2xl font-bold text-blue-700">£{order.subtotal.toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-xs text-amber-600 mb-1">Tax + Delivery</p>
            <p className="text-2xl font-bold text-amber-700">
              £{(order.taxAmount + order.deliveryFee).toFixed(2)}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-xs text-emerald-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-emerald-700">£{order.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {order.restaurants && order.restaurants.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Restaurants</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {order.restaurants.map((restaurant: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                  <div>
                    <p className="font-medium text-slate-900">{restaurant.name}</p>
                    <p className="text-xs text-slate-500">{restaurant.employeeCount} employees</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">£{restaurant.totalAmount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Employee Sub-Orders */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Employee Orders</h3>
              <p className="text-sm text-slate-500 mt-1">
                {order.employeeOrders?.length || 0} employees ordered today
              </p>
            </div>
            {order.status === 'pending_approval' && selectedSubOrders.size > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-600">
                  {selectedSubOrders.size} selected
                </span>
                <button
                  onClick={() => {
                    const selected = order.employeeOrders?.filter((emp: any) => 
                      selectedSubOrders.has(emp.subOrderId)
                    );
                    onBulkReject(
                      Array.from(selectedSubOrders),
                      selected.map((emp: any) => emp.employeeName)
                    );
                  }}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                >
                  Reject Selected
                </button>
              </div>
            )}
          </div>
          {order.status === 'pending_approval' && order.employeeOrders?.length > 0 && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSubOrders.size === order.employeeOrders.filter((emp: any) => emp.status !== 'REJECTED').length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">Select All</span>
            </label>
          )}
        </div>

        {order.employeeOrders && order.employeeOrders.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {order.employeeOrders.map((empOrder: any) => (
              <div key={empOrder.employeeId}>
                <div className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {order.status === 'pending_approval' && empOrder.status !== 'REJECTED' && (
                        <input
                          type="checkbox"
                          checked={selectedSubOrders.has(empOrder.subOrderId)}
                          onChange={() => handleToggleSubOrder(empOrder.subOrderId)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {empOrder.employeeName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{empOrder.employeeName}</p>
                        {empOrder.jobTitle && (
                          <p className="text-xs text-slate-500">{empOrder.jobTitle}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">£{empOrder.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">
                          {empOrder.restaurantCount} {empOrder.restaurantCount === 1 ? 'restaurant' : 'restaurants'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        empOrder.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        empOrder.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        empOrder.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {empOrder.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Restaurant Orders */}
                {expandedEmployeeId === empOrder.employeeId && empOrder.restaurantOrders && (
                  <div className="bg-slate-50 border-t border-slate-200">
                    <div className="p-4 space-y-3">
                      {empOrder.restaurantOrders.map((ro: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium text-slate-900">{ro.restaurantName}</p>
                              <p className="text-xs text-slate-500 mt-1">{ro.items?.length || 0} items</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">£{ro.totalAmount?.toFixed(2)}</p>
                          </div>
                          
                          {ro.items && ro.items.length > 0 && (
                            <div className="space-y-2">
                              {ro.items.map((item: any, itemIdx: number) => (
                                <div key={itemIdx} className="flex items-start justify-between text-sm">
                                  <div className="flex-1">
                                    <p className="text-slate-900">
                                      {item.quantity}x {item.name}
                                    </p>
                                    {item.customizations && item.customizations.length > 0 && (
                                      <p className="text-xs text-slate-500 ml-4">
                                        {item.customizations.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                  <p className="text-slate-600 ml-4">£{item.price?.toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {order.status === 'pending_approval' && empOrder.status !== 'REJECTED' && (
                        <button
                          onClick={() => onReject(empOrder.subOrderId, empOrder.employeeName)}
                          className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                        >
                          Reject This Employee's Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No employee orders yet</p>
          </div>
        )}
      </div>
      <PaymentSelectionModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        orderId={order.orderId}
        organizationId={organizationId}
        managerId={managerId}
        totalAmount={order.totalAmount}
      />
    </div>
  );
}