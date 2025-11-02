// app/dashboard/ContactTab.tsx
'use client';

import { useState } from 'react';
import { contactApi, ContactReason } from '@/api/contact';

interface ContactTabProps {
  organizationId: string;
  managerId: string;
  organizationName?: string;
}

export function ContactTab({ organizationId, managerId, organizationName }: ContactTabProps) {
  const [reason, setReason] = useState<ContactReason>(ContactReason.GENERAL_INQUIRY);
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reasonOptions = [
    { value: ContactReason.REFUND, label: '💰 Refund Request', color: 'text-red-600' },
    { value: ContactReason.TECHNICAL_ISSUE, label: '🔧 Technical Issue', color: 'text-orange-600' },
    { value: ContactReason.BILLING_QUESTION, label: '💳 Billing Question', color: 'text-yellow-600' },
    { value: ContactReason.FEATURE_REQUEST, label: '✨ Feature Request', color: 'text-purple-600' },
    { value: ContactReason.GENERAL_INQUIRY, label: '📋 General Inquiry', color: 'text-blue-600' },
    { value: ContactReason.COMPLAINT, label: '⚠️ Complaint', color: 'text-red-600' },
    { value: ContactReason.OTHER, label: '💬 Other', color: 'text-slate-600' },
  ];

  const characterCount = message.length;
  const maxCharacters = 2000;
  const minCharacters = 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.length < minCharacters) {
      setError(`Message must be at least ${minCharacters} characters long`);
      return;
    }

    if (message.length > maxCharacters) {
      setError(`Message cannot exceed ${maxCharacters} characters`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await contactApi.submitContactForm({
        organizationId,
        managerId,
        reason,
        message,
        orderId: orderId.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      });

      setSuccess(true);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
  
      // Reset form
      setMessage('');
      setOrderId('');
      setContactEmail('');
      setReason(ContactReason.GENERAL_INQUIRY);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReasonOption = reasonOptions.find(opt => opt.value === reason);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Contact Support</h2>
              <p className="text-blue-100 mt-1">Get help from our support team</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Message Sent Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">
                  We've received your message and will get back to you within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Organization Info */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">Organization:</span>
              <span>{organizationName || organizationId}</span>
            </div>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              What can we help you with?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reasonOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setReason(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    reason === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${option.color}`}>
                      {option.label}
                    </span>
                    {reason === option.value && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Order ID (Optional) */}
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-slate-700 mb-2">
              Order ID (Optional)
            </label>
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g., abc123-def456"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              If your inquiry is about a specific order, please provide the order ID
            </p>
          </div>

          {/* Contact Email (Optional) */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 mb-2">
              Alternative Contact Email (Optional)
            </label>
            <input
              type="email"
              id="contactEmail"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              If you want us to reply to a different email address
            </p>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
              Your Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your issue or inquiry in detail..."
              rows={8}
              required
              minLength={minCharacters}
              maxLength={maxCharacters}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500">
                Minimum {minCharacters} characters
              </p>
              <p className={`text-xs ${
                characterCount > maxCharacters 
                  ? 'text-red-600 font-medium' 
                  : characterCount < minCharacters 
                  ? 'text-amber-600' 
                  : 'text-slate-500'
              }`}>
                {characterCount} / {maxCharacters}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-sm text-slate-500">
              * Required fields
            </div>
            <button
              type="submit"
              disabled={isSubmitting || characterCount < minCharacters || characterCount > maxCharacters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-1">Response Time</p>
              <p>We typically respond within 24-48 hours during business days (Monday - Friday).</p>
              <p className="mt-2">For urgent matters, please mark your inquiry as a complaint or technical issue.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}