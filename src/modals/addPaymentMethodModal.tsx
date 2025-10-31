// modals/AddPaymentMethodModal.tsx
'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { walletApi } from '@/api/wallet';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  managerId: string;
  organizationId: string;
}

export function AddPaymentMethodModal({
  isOpen,
  onClose,
  onSuccess,
  managerId,
  organizationId,
}: AddPaymentMethodModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not loaded. Please refresh the page.');
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Step 1: Get setup intent from backend
      console.log("orgid", organizationId)
      const { clientSecret } = await walletApi.createSetupIntent(organizationId);
      console.log("got client secret", clientSecret)
      // Step 2: Confirm card setup with Stripe
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // You can add billing details here if needed
            },
          },
        }
      );
      console.log("confirmed cardsetuo", error, JSON.stringify(setupIntent))


      if (stripeError) {
        setError(stripeError.message || 'Failed to add payment method');
        setIsSubmitting(false);
        return;
      }

      if (!setupIntent?.payment_method) {
        setError('Failed to retrieve payment method');
        setIsSubmitting(false);
        return;
      }

      // Step 3: Save payment method to backend
      await walletApi.savePaymentMethod(
        organizationId,
        setupIntent.payment_method as string,
        setAsDefault
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Add Payment Method</h2>
          <p className="text-sm text-slate-500 mt-1">
            Add a credit or debit card for payments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Card Information
            </label>
            <div className="border border-slate-300 rounded-lg p-3 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Your card information is securely processed by Stripe
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="setAsDefault"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="setAsDefault" className="text-sm text-slate-700">
              Set as default payment method
            </label>
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
              disabled={isSubmitting || !stripe}
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
                  Adding...
                </span>
              ) : (
                'Add Card'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}