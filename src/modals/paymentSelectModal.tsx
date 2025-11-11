// modals/PaymentSelectionModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { walletApi } from '@/api/wallet';
import { StripeProvider } from '@/app/components/StripeProvider';
import { PaymentMethodSelector } from '@/components/paymentMethodSelector';
import apiClient from '@/api/client';
import { AddressSelectionModal } from './addressSelectionModal';

interface PaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentMethod: 'wallet' | 'stripe_direct', paymentMethodId?: string) => void;
  orderId: string;
  organizationId: string;
  managerId: string;
  totalAmount: number;
}

interface Address {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  flat?: string;
  city: string;
  zipcode: string;
  isDefault: boolean;
}

export function PaymentSelectionModal({
  isOpen,
  onClose,
  onPaymentComplete,
  orderId,
  organizationId,
  managerId,
  totalAmount,
}: PaymentSelectionModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'card'>('wallet');
  
  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadPaymentStatus();
      fetchAddresses();
    }
  }, [isOpen, orderId]);

  const loadPaymentStatus = async () => {
    try {
      setIsLoading(true);
      console.log('managerId', managerId);
      console.log('orderId', orderId);
      const response = await apiClient.get(`/corporate-orders/payment-status/${orderId}?managerId=${managerId}`);
      const data = await response.data;
      console.log('data', data);
      setPaymentStatus(data);

      // Auto-select wallet if they have enough balance
      if (data.canPayFromWallet) {
        setSelectedMethod('wallet');
      } else {
        setSelectedMethod('card');
      }
    } catch (err: any) {
      console.log('error in load payment status', err);
      setError(err.message || 'Failed to load payment status');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      console.log("org id", organizationId);
      const response = await apiClient.get(`/organizations/address/${organizationId}`);
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Response data type:", typeof response.data);
      console.log("Is array?:", Array.isArray(response.data));
      
      // Handle different response structures
      const addressData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];
      
      console.log("Parsed addresses:", addressData);
      setAddresses(addressData);
      
      // Auto-select default address
      const defaultAddress = addressData.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressData.length === 1) {
        setSelectedAddressId(addressData[0].id);
      }
      
      // Clear any previous errors if successful
      setError('');
    } catch (error: any) {
      console.error('Failed to fetch addresses:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Only set error if it's actually an error (not empty array)
      if (error.response?.status !== 200) {
        setError('Failed to load delivery addresses');
      }
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handlePayFromWallet = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Notify parent with address info
      await apiClient.post(`/corporate-orders/${orderId}/approve`, {
        paymentMethod: 'wallet',
        deliveryAddressId: selectedAddressId,
        deliveryInstructions: deliveryInstructions || undefined,
      });
      
      onPaymentComplete('wallet');
      onClose();
    } catch (err: any) {
      console.log('error in handle pay from wallet', err);
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPaymentComplete = async (paymentMethodId: string) => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    try {
      await apiClient.post(`/corporate-orders/${orderId}/approve`, {
        paymentMethod: 'stripe_direct',
        paymentMethodId,
        deliveryAddressId: selectedAddressId,
        deliveryInstructions: deliveryInstructions || undefined,
      });
      
      onPaymentComplete('stripe_direct', paymentMethodId);
      onClose();
    } catch (err: any) {
      console.error('Card payment approval failed:', err);
      setError(err.response?.data?.message || 'Payment failed');
    }
  };

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Approve Order & Pay</h2>
              <p className="text-sm text-slate-500 mt-1">
                Total to pay: £{totalAmount.toFixed(2)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {isLoading && !paymentStatus ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <p className="text-slate-500 mt-4">Loading payment options...</p>
              </div>
            ) : (
              <>
                {/* Delivery Address Section */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Delivery Address *
                  </label>
                  {loadingAddresses ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                    </div>
                  ) : selectedAddress ? (
                    <div className="bg-white rounded-lg p-4 border border-slate-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="font-semibold text-slate-900">{selectedAddress.name}</p>
                            {selectedAddress.isDefault && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 ml-7">
                            {selectedAddress.flat && `${selectedAddress.flat}, `}
                            {selectedAddress.addressLine1}
                          </p>
                          {selectedAddress.addressLine2 && (
                            <p className="text-sm text-slate-600 ml-7">{selectedAddress.addressLine2}</p>
                          )}
                          <p className="text-sm text-slate-600 ml-7">
                            {selectedAddress.city}, {selectedAddress.zipcode}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium ml-7"
                      >
                        Change Address
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="w-full px-4 py-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Select Delivery Address
                    </button>
                  )}

                  {/* Delivery Instructions */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g., Call reception ext 101, Leave at front desk"
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Payment Method *
                  </label>

                  {/* Wallet Option */}
                  <button
                    onClick={() => setSelectedMethod('wallet')}
                    disabled={!paymentStatus?.canPayFromWallet}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMethod === 'wallet'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${!paymentStatus?.canPayFromWallet ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Organization Wallet</p>
                          <p className="text-sm text-slate-500">
                            Available: £{paymentStatus?.walletBalance?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                      {selectedMethod === 'wallet' && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {!paymentStatus?.canPayFromWallet && (
                      <p className="text-xs text-red-600 mt-2">
                        Insufficient balance. Please add funds or pay with card.
                      </p>
                    )}
                  </button>

                  {/* Card Option */}
                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMethod === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Credit/Debit Card</p>
                          <p className="text-sm text-slate-500">Pay securely with Stripe</p>
                        </div>
                      </div>
                      {selectedMethod === 'card' && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Payment Form Based on Selection */}
                {selectedMethod === 'card' && (
                  <PaymentMethodSelector
                    orderId={orderId}
                    organizationId={organizationId}
                    managerId={managerId}
                    amount={totalAmount}
                    onPaymentComplete={handleCardPaymentComplete}
                  />
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {selectedMethod === 'wallet' && paymentStatus?.canPayFromWallet && !isLoading && (
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handlePayFromWallet}
                disabled={isLoading || !selectedAddressId}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Pay £{totalAmount.toFixed(2)} from Wallet
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        organizationId={organizationId}
        selectedAddressId={selectedAddressId}
        onSelectAddress={(addressId) => {
          setSelectedAddressId(addressId);
          setShowAddressModal(false);
        }}
      />
    </>
  );
}