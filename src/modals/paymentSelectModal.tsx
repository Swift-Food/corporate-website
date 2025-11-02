// modals/PaymentSelectionModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { walletApi } from '@/api/wallet';
import { StripeProvider } from '@/app/components/StripeProvider';
import { PaymentMethodSelector } from '@/components/paymentMethodSelector';
import apiClient from '@/api/client';

interface PaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentMethod: 'wallet' | 'stripe_direct', paymentMethodId?: string) => void;
  orderId: string;
  organizationId: string;
  managerId: string,
  totalAmount: number;
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

  useEffect(() => {
    if (isOpen) {
      loadPaymentStatus();
    }
  }, [isOpen, orderId]);

  const loadPaymentStatus = async () => {
    try {
      setIsLoading(true);
      // Call your endpoint to get payment status
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

  const handlePayFromWallet = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Just notify parent - they'll handle the approval with wallet payment
      onPaymentComplete('wallet');
      onClose();
    } catch (err: any) {
      console.log('error in handle pay from wallet', err);
      setError(err.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPaymentComplete = (paymentMethodId: string) => {
    onPaymentComplete('stripe_direct', paymentMethodId);
    onClose();
  };

  if (!isOpen) return null;

  return (

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Select Payment Method</h2>
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
                {/* Payment Method Selection */}
                <div className="space-y-4">
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
                    <p className="text-sm text-red-800">{error}</p>
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
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay £{totalAmount.toFixed(2)} from Wallet
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

  );
}