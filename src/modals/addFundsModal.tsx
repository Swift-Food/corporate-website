// modals/AddFundsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { walletApi, PaymentMethodInfo } from '@/api/wallet';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  managerId: string;
  orgId: string;
  currentBalance: number;
}

export function AddFundsModal({
  isOpen,
  onClose,
  onSuccess,
  managerId,
  orgId,
  currentBalance,
}: AddFundsModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const methods = await walletApi.getPaymentMethods(orgId);
      setPaymentMethods(methods);
      
      // Auto-select first non-expired method
      const validMethod = methods.find((m) => !m.isExpired);
      if (validMethod) {
        setSelectedPaymentMethodId(validMethod.id);
      }
    } catch (err: any) {
      setError('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < 10) {
      setError('Minimum top-up amount is $10');
      return;
    }

    if (numAmount > 50000) {
      setError('Maximum top-up amount is $50,000');
      return;
    }

    if (!selectedPaymentMethodId) {
      setError('Please select a payment method');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await walletApi.addFunds(orgId, managerId, numAmount, selectedPaymentMethodId);
      onSuccess();
      onClose();
      setAmount('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add funds');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [50, 100, 250, 500, 1000, 2500];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Add Funds to Wallet</h2>
          <p className="text-sm text-slate-500 mt-1">
            Current Balance: <span className="font-semibold">${currentBalance.toFixed(2)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount to Add
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="0.00"
                step="0.01"
                min="10"
                max="50000"
                required
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Minimum: $10 • Maximum: $50,000
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    amount === quickAmount.toString()
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                      : 'border-slate-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Method
            </label>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  No payment methods available. Please add a card first.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      pm.isExpired
                        ? 'border-red-200 bg-red-50 opacity-50 cursor-not-allowed'
                        : selectedPaymentMethodId === pm.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-300 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.id}
                      checked={selectedPaymentMethodId === pm.id}
                      onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                      disabled={pm.isExpired}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-12 h-8 bg-slate-900 rounded flex items-center justify-center text-white text-xs font-bold">
                        {pm.brand?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">•••• {pm.last4}</p>
                        <p className="text-xs text-slate-500">
                          Expires {pm.expMonth}/{pm.expYear}
                          {pm.isExpired && (
                            <span className="ml-2 text-red-600 font-medium">Expired</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {amount && parseFloat(amount) >= 10 && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Current Balance</span>
                <span className="font-medium">${currentBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Adding</span>
                <span className="font-medium text-green-600">+${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="font-semibold text-slate-900">New Balance</span>
                <span className="font-bold text-slate-900">
                  ${(currentBalance + parseFloat(amount)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || paymentMethods.length === 0 || !selectedPaymentMethodId}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Add $${amount || '0'} to Wallet`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}