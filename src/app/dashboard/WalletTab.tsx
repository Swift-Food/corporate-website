// app/manager/dashboard/WalletTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { walletApi, WalletStatus } from '@/api/wallet';
import { InitializeWalletModal } from '@/modals/initializeWalletModal';
import { AddPaymentMethodModal } from '@/modals/addPaymentMethodModal';
import { AddFundsModal } from '@/modals/addFundsModal';
import { StripeProvider } from '../components/StripeProvider';
import { WithdrawFundsModal } from '@/modals/withDrawFundsModal';

interface WalletTabProps {
  organizationId: string;
  managerId: string;
}

export function WalletTab({ organizationId, managerId }: WalletTabProps) {
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInitModal, setShowInitModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    loadWalletStatus();
  }, [organizationId]);

  const loadWalletStatus = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await walletApi.getStatus(organizationId);
      setWalletStatus(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wallet status');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-GB');
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Remove this payment method?')) return;

    try {
      await walletApi.removePaymentMethod(managerId, paymentMethodId);
      loadWalletStatus();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove payment method');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        <p className="text-slate-500 mt-4">Loading wallet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={loadWalletStatus}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!walletStatus) return null;

  const { onboardingProgress, isFullyOnboarded } = walletStatus;

  return (
    <StripeProvider>
      <div className="space-y-6">
        {/* Onboarding Progress */}
        {!isFullyOnboarded && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Complete Wallet Setup
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {onboardingProgress.nextStep || 'Almost done!'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {onboardingProgress.percentage}%
                </div>
                <div className="text-xs text-slate-500">
                  {onboardingProgress.completedSteps} of {onboardingProgress.totalSteps} steps
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-blue-200 rounded-full h-2 mb-6">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${onboardingProgress.percentage}%` }}
              />
            </div>

            {/* Onboarding Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OnboardingStep
                title="Contact Information"
                completed={onboardingProgress.steps.contactInfoAdded}
                description="Add billing email and phone"
                onClick={() => setShowInitModal(true)}
              />
              <OnboardingStep
                title="Initialize Wallet"
                completed={onboardingProgress.steps.walletInitialized}
                description="Create Stripe account"
                onClick={() => setShowInitModal(true)}
                disabled={!onboardingProgress.steps.contactInfoAdded}
              />
              <OnboardingStep
                title="Add Payment Method"
                completed={onboardingProgress.steps.paymentMethodAdded}
                description="Add a credit card"
                onClick={() => setShowAddPaymentModal(true)}
                disabled={!onboardingProgress.steps.walletInitialized}
              />
              <OnboardingStep
                title="Add Funds"
                completed={onboardingProgress.steps.fundsAdded}
                description="Top up your wallet"
                onClick={() => setShowAddFundsModal(true)}
                disabled={!onboardingProgress.steps.paymentMethodAdded}
              />
            </div>
          </div>
        )}

        {/* Wallet Balance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Current Balance</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                £{formatNumber(Number(walletStatus.walletBalance.toFixed(2)))}
              </p>
              <p className="text-xs text-slate-400 mt-1">{walletStatus.currency}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowAddFundsModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!walletStatus.hasPaymentMethod}
                title={!walletStatus.hasPaymentMethod ? 'Add a payment method first' : ''}
              >
                Add Funds
              </button>
              
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={walletStatus.walletBalance <= 0}
                title={walletStatus.walletBalance <= 0 ? 'No funds available' : 'Withdraw funds'}
              >
                Withdraw
              </button>
              
              <button
                onClick={loadWalletStatus}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
            <button
              onClick={() => setShowInitModal(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm text-slate-900">{walletStatus.contactEmail || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Phone</p>
              <p className="text-sm text-slate-900">{walletStatus.contactPhone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Billing Address</p>
              <p className="text-sm text-slate-900">{walletStatus.billingAddress || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        {walletStatus.isWalletInitialized && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Payment Methods</h3>
              <button
                onClick={() => setShowAddPaymentModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Add Card
              </button>
            </div>
            
            {walletStatus.paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p>No payment methods added</p>
                <button
                  onClick={() => setShowAddPaymentModal(true)}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add your first card
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {walletStatus.paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      pm.isExpired ? 'border-red-200 bg-red-50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-slate-900 rounded flex items-center justify-center text-white text-xs font-bold">
                        {pm.brand?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">•••• {pm.last4}</p>
                        <p className="text-xs text-slate-500">
                          Expires {pm.expMonth}/{pm.expYear}
                          {pm.isExpired && (
                            <span className="ml-2 text-red-600 font-medium">Expired</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {walletStatus.defaultPaymentMethodId === pm.id && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          Default
                        </span>
                      )}
                      <button
                        onClick={() => handleRemovePaymentMethod(pm.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showInitModal && (
          <InitializeWalletModal
            isOpen={showInitModal}
            onClose={() => setShowInitModal(false)}
            onSuccess={loadWalletStatus}
            orgId={organizationId}
            managerId={managerId}
            initialData={{
              contactEmail: walletStatus.contactEmail || '',
              contactPhone: walletStatus.contactPhone || '',
              billingAddress: walletStatus.billingAddress || '',
            }}
            isInitialized={walletStatus.isWalletInitialized}
          />
        )}

        {showWithdrawModal && (
          <WithdrawFundsModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            onSuccess={loadWalletStatus}
            organizationId={organizationId}
            managerId={managerId}
            currentBalance={walletStatus.walletBalance}
          />
        )}

        {showAddPaymentModal && (
          <AddPaymentMethodModal
            isOpen={showAddPaymentModal}
            onClose={() => setShowAddPaymentModal(false)}
            onSuccess={loadWalletStatus}
            managerId={managerId}
            organizationId={organizationId}
          />
        )}

        {showAddFundsModal && (
          <AddFundsModal
            isOpen={showAddFundsModal}
            onClose={() => setShowAddFundsModal(false)}
            onSuccess={loadWalletStatus}
            managerId={managerId}
            orgId={organizationId}
            currentBalance={walletStatus.walletBalance}
          />
        )}
      </div>
    </StripeProvider>
  );
}

// Helper component for onboarding steps
function OnboardingStep({
  title,
  completed,
  description,
  onClick,
  disabled = false,
}: {
  title: string;
  completed: boolean;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || completed}
      className={`text-left p-4 rounded-lg border transition-all ${
        completed
          ? 'bg-green-50 border-green-200'
          : disabled
          ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            completed ? 'bg-green-500' : disabled ? 'bg-slate-300' : 'bg-blue-500'
          }`}
        >
          {completed ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-white text-xs font-bold">
              {disabled ? '?' : '!'}
            </span>
          )}
        </div>
        <div>
          <p className="font-medium text-slate-900 text-sm">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
    </button>
  );
}