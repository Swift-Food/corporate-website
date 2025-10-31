// components/dashboard/OrderSettings.tsx
import { useState } from 'react';
import apiClient from '@/api/client';

interface OrderSettingsProps {
  orderCutoffTime: string;
  deliveryTimeWindow: string;
  organizationId: string;
  onUpdate: () => void;
}

export function OrderSettings({ 
  orderCutoffTime, 
  deliveryTimeWindow, 
  organizationId, 
  onUpdate 
}: OrderSettingsProps) {
  const [isEditingCutoff, setIsEditingCutoff] = useState(false);
  const [tempCutoffTime, setTempCutoffTime] = useState(orderCutoffTime);
  const [isSavingCutoff, setIsSavingCutoff] = useState(false);
  const [isEditingDeliveryWindow, setIsEditingDeliveryWindow] = useState(false);
  const [tempDeliveryWindow, setTempDeliveryWindow] = useState(deliveryTimeWindow);
  const [isSavingDeliveryWindow, setIsSavingDeliveryWindow] = useState(false);
  const [error, setError] = useState('');

  const formatTimeDisplay = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const handleSaveCutoffTime = async () => {
    if (!organizationId) return;
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(tempCutoffTime)) {
      setError('Invalid time format. Please use HH:MM:SS format (e.g., 11:00:00)');
      return;
    }

    setIsSavingCutoff(true);
    setError('');
    try {
      await apiClient.put(`/organizations/${organizationId}`, {
        orderCutoffTime: tempCutoffTime,
      });
      setIsEditingCutoff(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update cutoff time');
    } finally {
      setIsSavingCutoff(false);
    }
  };

  const handleCancelEdit = () => {
    setTempCutoffTime(orderCutoffTime);
    setIsEditingCutoff(false);
    setError('');
  };

  const handleSaveDeliveryWindow = async () => {
    if (!tempDeliveryWindow.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
      alert('Please enter a valid time in HH:MM:SS format');
      return;
    }
  
    setIsSavingDeliveryWindow(true);
    try {
      await apiClient.put(`/organizations/${organizationId}`, {
        defaultDeliveryTimeWindow: tempDeliveryWindow,
      });
      setIsEditingDeliveryWindow(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating delivery window:', error);
      alert('Error updating delivery window');
    } finally {
      setIsSavingDeliveryWindow(false);
    }
  };

  const handleCancelDeliveryWindowEdit = () => {
    setTempDeliveryWindow(deliveryTimeWindow);
    setIsEditingDeliveryWindow(false);
  };

  return (
    <div className="p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start space-x-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Order Cutoff Time Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Daily Order Cutoff Time</h3>
              <p className="text-sm text-slate-600 mt-1">
                Orders placed after this time will be processed the next business day
              </p>
            </div>
          </div>
        </div>

        {!isEditingCutoff ? (
          <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-blue-600">
                {formatTimeDisplay(orderCutoffTime)}
              </div>
              <div className="text-sm text-slate-500">
                ({orderCutoffTime})
              </div>
            </div>
            <button
              onClick={() => setIsEditingCutoff(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cutoff Time (24-hour format: HH:MM:SS)
              </label>
              <input
                type="text"
                value={tempCutoffTime}
                onChange={(e) => setTempCutoffTime(e.target.value)}
                placeholder="11:00:00"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-2">
                Examples: 09:00:00, 11:30:00, 14:00:00
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSaveCutoffTime}
                disabled={isSavingCutoff}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingCutoff ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSavingCutoff}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Time Window Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 mt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Default Delivery Time Window</h3>
              <p className="text-sm text-slate-600 mt-1">
                Standard delivery window duration for orders
              </p>
            </div>
          </div>
        </div>

        {!isEditingDeliveryWindow ? (
          <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-emerald-600">
                {deliveryTimeWindow ? formatTimeDisplay(deliveryTimeWindow) : 'Not Set'}
              </div>
              {deliveryTimeWindow && (
                <div className="text-sm text-slate-500">
                  ({deliveryTimeWindow})
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setTempDeliveryWindow(deliveryTimeWindow);
                setIsEditingDeliveryWindow(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Delivery Window (24-hour format: HH:MM:SS)
              </label>
              <input
                type="text"
                value={tempDeliveryWindow}
                onChange={(e) => setTempDeliveryWindow(e.target.value)}
                placeholder="02:00:00"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-2">
                Examples: 01:00:00 (1 hour), 02:00:00 (2 hours), 04:00:00 (4 hours)
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSaveDeliveryWindow}
                disabled={isSavingDeliveryWindow}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingDeliveryWindow ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancelDeliveryWindowEdit}
                disabled={isSavingDeliveryWindow}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Information</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>The cutoff time applies to all orders across the organization</li>
              <li>Orders placed before the cutoff time will be processed on the same day</li>
              <li>Orders placed after the cutoff time will be queued for the next business day</li>
              <li>Time must be in 24-hour format (HH:MM:SS)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}