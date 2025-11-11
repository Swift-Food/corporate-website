// components/dashboard/OrderSettings.tsx
import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { AddressSelectionModal } from '@/modals/addressSelectionModal';

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
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchAddresses();
    }
  }, [organizationId]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await apiClient.get(`/organizations/address/${organizationId}`);
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

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

  const handleSaveCutoffTime = async (timeValue?: string) => {
    if (!organizationId) return;
    
    // Get the time to save (either passed parameter or tempCutoffTime)
    const timeToSave = timeValue || `${tempCutoffTime}:00`;
    
    // Validate time format (should be HH:MM or HH:MM:SS)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(timeToSave)) {
      setError('Invalid time format. Please select a valid time.');
      return;
    }
  
    // Ensure we have HH:MM:SS format
    const fullTime = timeToSave.includes(':00') || timeToSave.split(':').length === 3 
      ? timeToSave 
      : `${timeToSave}:00`;
  
    // Validate cutoff time is before 6 PM
    const [hours, minutes] = fullTime.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    if (timeInMinutes >= 18 * 60) {
      setError('Cutoff time must be before 6:00 PM (18:00)');
      return;
    }
  
    setIsSavingCutoff(true);
    setError('');
    try {
      await apiClient.put(`/organizations/${organizationId}`, {
        orderCutoffTime: fullTime,
      });
      setTempCutoffTime(fullTime);
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

  const handleSaveDeliveryWindow = async (timeValue?: string) => {
    if (!organizationId) return;
    
    const timeToSave = timeValue || `${tempDeliveryWindow}:00`;
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(timeToSave)) {
      setError('Invalid time format. Please select a valid time.');
      return;
    }
  
    // Ensure we have HH:MM:SS format
    const fullTime = timeToSave.includes(':00') || timeToSave.split(':').length === 3 
      ? timeToSave 
      : `${timeToSave}:00`;
  
    // Validate delivery time is between 12:30 PM and 8:00 PM
    const [hours, minutes] = fullTime.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    if (timeInMinutes < 12 * 60) { // 12:30 PM
      setError('Delivery time must be after 12:00 PM');
      return;
    }
    
    if (timeInMinutes > 20 * 60) { // 8:00 PM
      setError('Delivery time must be before 8:00 PM');
      return;
    }
  
    setIsSavingDeliveryWindow(true);
    setError('');
    try {
      await apiClient.put(`/organizations/${organizationId}`, {
        defaultDeliveryTimeWindow: fullTime,
      });
      setTempDeliveryWindow(fullTime);
      setIsEditingDeliveryWindow(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update delivery time');
    } finally {
      setIsSavingDeliveryWindow(false);
    }
  };

  const handleCancelDeliveryWindowEdit = () => {
    setIsEditingDeliveryWindow(false);
    setError(''); // Clear error
    if (deliveryTimeWindow) {
      const [hours, minutes] = deliveryTimeWindow.split(':');
      setTempDeliveryWindow(`${hours}:${minutes}`);
    }
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
        Daily cutoff time
      </div>
    </div>
    <button
      onClick={() => {
        setIsEditingCutoff(true);
        // Parse current time for dropdowns
        const [hours, minutes] = orderCutoffTime.split(':');
        setTempCutoffTime(`${hours}:${minutes}`);
      }}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center space-x-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span>Edit</span>
    </button>
  </div>
  ) : (
    <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Select Cutoff Time
        </label>
        
        {/* Time Picker UI */}
        <div className="flex items-center space-x-3">
          {/* Hour Selector */}
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Hour</label>
            <select
    value={tempCutoffTime.split(':')[0] || '11'}
    onChange={(e) => {
      const minutes = tempCutoffTime.split(':')[1] || '00';
      const newTime = `${e.target.value}:${minutes}`;
      setTempCutoffTime(newTime);
      
      // Real-time validation
      const hours = parseInt(e.target.value);
      const mins = parseInt(minutes);
      const timeInMinutes = hours * 60 + mins;
      
      if (timeInMinutes < 9 * 60) {
        setError('Cutoff time must be after 9:00 AM');
      } else if (timeInMinutes >= 18 * 60) {
        setError('Cutoff time must be before 6:00 PM');
      } else {
        setError('');
      }
    }}
    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold appearance-none bg-white cursor-pointer"
  >
            {Array.from({ length: 9 }, (_, i) => i + 10).map((hour) => {
              const hourStr = hour.toString().padStart(2, '0');
              return (
                <option key={hour} value={hourStr}>
                  {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                </option>
              );
            })}
          </select>
        </div>

        <span className="text-2xl font-bold text-slate-400 pt-6">:</span>

        {/* Minute Selector */}
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">Minute</label>
          <select
  value={tempCutoffTime.split(':')[1] || '00'}
  onChange={(e) => {
    const hours = tempCutoffTime.split(':')[0] || '11';
    const newTime = `${hours}:${e.target.value}`;
    setTempCutoffTime(newTime);
    
    // Real-time validation
    const hrs = parseInt(hours);
    const mins = parseInt(e.target.value);
    const timeInMinutes = hrs * 60 + mins;
    
    if (timeInMinutes < 9 * 60) {
      setError('Cutoff time must be after 9:00 AM');
    } else if (timeInMinutes >= 18 * 60) {
      setError('Cutoff time must be before 6:00 PM');
    } else {
      setError('');
    }
  }}
  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold appearance-none bg-white cursor-pointer"
>
            {['00', '15', '30', '45'].map((minute) => (
              <option key={minute} value={minute}>
                {minute}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-700 font-medium">{error}</span>
        </div>
      )}

    
      <p className="text-xs text-slate-500 mt-3 flex items-start space-x-2">
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Orders must be placed before this time to be processed for the same day</span>
      </p>
    </div>
    
    <div className="flex space-x-3">
      <button
        onClick={() => {
          const [hours, minutes] = tempCutoffTime.split(':');
          handleSaveCutoffTime(`${hours}:${minutes}:00`);
        }}
        // disabled={isSavingCutoff}
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
        // disabled={isSavingCutoff}
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
        <h3 className="text-lg font-semibold text-slate-900">Default Delivery Time</h3>
        <p className="text-sm text-slate-600 mt-1">
          Standard delivery time for orders
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
            Default delivery time
          </div>
        )}
      </div>
      <button
        onClick={() => {
          setIsEditingDeliveryWindow(true);
          // Parse current time for dropdowns
          if (deliveryTimeWindow) {
            const [hours, minutes] = deliveryTimeWindow.split(':');
            setTempDeliveryWindow(`${hours}:${minutes}`);
          } else {
            setTempDeliveryWindow('13:00'); // Default to 1 PM
          }
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
    <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Select Delivery Time
        </label>
        
        {/* Time Picker UI */}
        <div className="flex items-center space-x-3">
          {/* Hour Selector - 12:30 PM (12) to 8:00 PM (20) */}
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Hour</label>
            <select
              value={tempDeliveryWindow?.split(':')[0] || '13'}
              onChange={(e) => {
                const minutes = tempDeliveryWindow?.split(':')[1] || '00';
                setTempDeliveryWindow(`${e.target.value}:${minutes}`);
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold appearance-none bg-white cursor-pointer"
            >
              {Array.from({ length: 9 }, (_, i) => i + 12).map((hour) => {
                // Skip 12 AM hour, only show 12 PM onwards
                if (hour > 20) return null;
                const hourStr = hour.toString().padStart(2, '0');
                return (
                  <option key={hour} value={hourStr}>
                    {hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </option>
                );
              })}
            </select>
          </div>

          <span className="text-2xl font-bold text-slate-400 pt-6">:</span>

          {/* Minute Selector */}
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Minute</label>
            <select
              value={tempDeliveryWindow?.split(':')[1] || '00'}
              onChange={(e) => {
                const hours = tempDeliveryWindow?.split(':')[0] || '13';
                setTempDeliveryWindow(`${hours}:${e.target.value}`);
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold appearance-none bg-white cursor-pointer"
            >
              {['00', '15', '30', '45'].map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </div>

        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-700 font-medium">{error}</span>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-3 flex items-start space-x-2">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Orders will be delivered at this time. Must be between 12:00 PM and 8:00 PM</span>
        </p>
      </div>
      
      <div className="flex space-x-3">
          <button
            onClick={() => {
              const [hours, minutes] = tempDeliveryWindow.split(':');
              handleSaveDeliveryWindow(`${hours}:${minutes}:00`);
            }}
            // disabled={isSavingDeliveryWindow || !!error}
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
          // disabled={isSavingDeliveryWindow}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  )}
      </div>

      <div className="mb-6">

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 mt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Delivery Addresses</h3>
              <p className="text-sm text-slate-600 mt-1">
                Manage your organization's delivery locations
              </p>
            </div>
          </div>
        </div>

        {loadingAddresses ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent" />
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900">{address.name}</p>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {address.flat && `${address.flat}, `}
                        {address.addressLine1}
                      </p>
                      {address.addressLine2 && (
                        <p className="text-sm text-slate-600">{address.addressLine2}</p>
                      )}
                      <p className="text-sm text-slate-600">
                        {address.city}, {address.zipcode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => setShowAddAddressModal(true)}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Address
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-slate-900 font-semibold mb-1">No delivery addresses yet</p>
              <p className="text-sm text-slate-600 mb-4">
                Add your first delivery address to get started
              </p>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Address
              </button>
            </div>
          </div>
        )}
      </div>
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
      <AddressSelectionModal
        isOpen={showAddAddressModal}
        onClose={() => {
          setShowAddAddressModal(false);
          fetchAddresses(); // Refresh addresses after adding
        }}
        organizationId={organizationId}
        selectedAddressId={null}
        onSelectAddress={() => {
          setShowAddAddressModal(false);
          fetchAddresses();
        }}
      />
    </div>
  );
}