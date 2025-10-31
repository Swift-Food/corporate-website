// modals/InitializeWalletModal.tsx
'use client';

import { useState } from 'react';
import { walletApi } from '@/api/wallet';

interface InitializeWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orgId: string;
  managerId: string;
  initialData?: {
    contactEmail: string;
    contactPhone: string;
    billingAddress: string;
  };
  isInitialized: boolean;
}

export function InitializeWalletModal({
  isOpen,
  onClose,
  onSuccess,
  orgId,
  managerId,
  initialData,
  isInitialized,
}: InitializeWalletModalProps) {
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || '');
  const [billingAddress, setBillingAddress] = useState(initialData?.billingAddress || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (isInitialized) {
        // Update existing contact info
        await walletApi.updateContactInfo(orgId, {
          contactEmail,
          contactPhone,
          billingAddress,
        });
      } else {
        // Initialize wallet
        await walletApi.initialize({
          contactEmail,
          contactPhone,
          billingAddress,
          orgId,
          managerId: managerId
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save contact information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {isInitialized ? 'Update Contact Information' : 'Initialize Wallet'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isInitialized
              ? 'Update your billing and contact details'
              : 'Enter your billing and contact information to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Billing Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="billing@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Billing Address
            </label>
            <textarea
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main St, City, State 12345"
            />
          </div>

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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isInitialized ? 'Update' : 'Initialize Wallet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}