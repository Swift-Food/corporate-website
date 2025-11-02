// modals/WithdrawFundsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { walletApi, WithdrawalPreview } from '@/api/wallet';

interface WithdrawFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  managerId: string;
  currentBalance: number;
}

export function WithdrawFundsModal({
  isOpen,
  onClose,
  onSuccess,
  organizationId,
  managerId,
  currentBalance,
}: WithdrawFundsModalProps) {
  const [amount, setAmount] = useState('');
  const [preview, setPreview] = useState<WithdrawalPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (amount && parseFloat(amount) >= 10) {
      loadPreview();
    } else {
      setPreview(null);
    }
  }, [amount]);

  const loadPreview = async () => {
    try {
      const previewData = await walletApi.getWithdrawalPreview(
        organizationId,
        parseFloat(amount)
      );
      setPreview(previewData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to calculate fees');
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      await walletApi.withdrawFunds(
        organizationId,
        managerId,
        parseFloat(amount)
      );
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPreview(null);
    setShowConfirmation(false);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Withdraw Funds</h2>
            <p className="text-sm text-slate-500 mt-1">
              Available Balance: £{currentBalance.toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!showConfirmation ? (
            <>
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Instant Withdrawal</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Funds will return to your payment method in 1-2 business days
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    £
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="10"
                    max={currentBalance}
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-slate-500">Minimum: £10.00</p>
                  <button
                    onClick={() => setAmount(currentBalance.toString())}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              {/* Fee Preview */}
              {preview && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-slate-900 text-sm">Withdrawal Breakdown</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Withdrawal Amount:</span>
                      <span className="font-medium text-slate-900">
                        £{preview.requestedAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm group relative">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600">
                          Convenience Fee ({preview.feePercentage}%):
                        </span>
                        <svg 
                          className="w-4 h-4 text-slate-400 cursor-help" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-56">
                          <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg">
                            <p className="font-medium mb-1">Fee Structure:</p>
                            <ul className="space-y-1">
                              <li>• 2.5% of withdrawal amount</li>
                              <li>• Minimum fee: £1.00</li>
                              <li>• Maximum fee: £50.00</li>
                            </ul>
                            <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900"></div>
                          </div>
                        </div>
                      </div>
                      <span className="font-medium text-red-600">
                        -£{preview.convenienceFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-blue-300 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">You'll Receive:</span>
                        <span className="font-bold text-green-600 text-xl">
                          £{preview.netAmountToReceive.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                      <span className="text-slate-600">New Balance:</span>
                      <span className="font-medium text-slate-900">
                        £{preview.newBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </>
          ) : (
            /* Confirmation View */
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Confirm Withdrawal
                </h3>
                <p className="text-sm text-slate-600">
                  Please review the details below before proceeding
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                {preview && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Withdrawal Amount:</span>
                      <span className="font-medium">£{preview.requestedAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Convenience Fee:</span>
                      <span className="font-medium text-red-600">
                        -£{preview.convenienceFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-slate-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">You'll Receive:</span>
                        <span className="font-bold text-green-600 text-xl">
                          £{preview.netAmountToReceive.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 text-center">
                  ⏱️ Funds will be refunded to your payment method within 5-10 business days
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (showConfirmation) {
                setShowConfirmation(false);
              } else {
                onClose();
                resetForm();
              }
            }}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            disabled={isLoading}
          >
            {showConfirmation ? 'Back' : 'Cancel'}
          </button>

          <button
            onClick={() => {
              if (showConfirmation) {
                handleSubmit();
              } else {
                setShowConfirmation(true);
              }
            }}
            disabled={!preview || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : showConfirmation ? (
              'Confirm Withdrawal'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}