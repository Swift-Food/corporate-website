// components/modals/AddressSelectionModal.tsx
import { useState, useEffect } from 'react';
import apiClient from '@/api/client';
import { GooglePlacesAutocomplete } from '@/components/googlePlacesAutocomplete';

interface Address {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  flat?: string;
  city: string;
  zipcode: string;
  isDefault: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
}

export function AddressSelectionModal({
  isOpen,
  onClose,
  organizationId,
  selectedAddressId,
  onSelectAddress,
}: AddressSelectionModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    flat: '',
    city: '',
    zipcode: '',
    latitude: 51.5074,
    longitude: -0.1278,
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen, organizationId]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/organizations/address/${organizationId}`);
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelected = (place: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    zipcode: string;
    latitude: number;
    longitude: number;
  }) => {
    setFormData({
      ...formData,
      addressLine1: place.addressLine1,
      addressLine2: place.addressLine2 || '',
      city: place.city,
      zipcode: place.zipcode,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  };

  const handleAddAddress = async () => {
    if (!formData.name || !formData.addressLine1 || !formData.city || !formData.zipcode) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.post(`/organizations/${organizationId}/addresses`, {
        name: formData.name,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || undefined,
        flat: formData.flat || undefined,
        city: formData.city,
        zipcode: formData.zipcode,
        location: {
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        isDefault: formData.isDefault,
      });

      setAddresses([...addresses, response.data]);
      setShowAddForm(false);
      setUseManualEntry(false);
      setFormData({
        name: '',
        addressLine1: '',
        addressLine2: '',
        flat: '',
        city: '',
        zipcode: '',
        latitude: 51.5074,
        longitude: -0.1278,
        isDefault: false,
      });
    } catch (error) {
      console.error('Failed to add address:', error);
      alert('Failed to add address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (addressId: string) => {
    onSelectAddress(addressId);
    onClose();
  };

  const resetForm = () => {
    setShowAddForm(false);
    setUseManualEntry(false);
    setFormData({
      name: '',
      addressLine1: '',
      addressLine2: '',
      flat: '',
      city: '',
      zipcode: '',
      latitude: 51.5074,
      longitude: -0.1278,
      isDefault: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Select Delivery Address</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <>
              {!showAddForm ? (
                <>
                  <div className="space-y-3 mb-4">
                    {addresses.length > 0 ? (
                      addresses.map((address) => (
                        <button
                          key={address.id}
                          onClick={() => handleSelect(address.id)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedAddressId === address.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-slate-900">{address.name}</p>
                                {address.isDefault && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
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
                            {selectedAddressId === address.id && (
                              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-slate-500 mb-4">No addresses saved yet</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Address
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Main Office, Warehouse"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Google Places Autocomplete */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Search Address
                      </label>
                      <button
                        onClick={() => setUseManualEntry(!useManualEntry)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {useManualEntry ? 'Use Search' : 'Enter Manually'}
                      </button>
                    </div>
                    
                    {!useManualEntry ? (
                      <>
                        <GooglePlacesAutocomplete
                          onPlaceSelected={handlePlaceSelected}
                          placeholder="Start typing an address in London..."
                          value={searchValue}
                          onChange={setSearchValue}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Search limited to London area for best results
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 mb-3">
                        Fill in address details manually below
                      </p>
                    )}
                  </div>

                  {/* Manual Entry Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Flat/Unit
                      </label>
                      <input
                        type="text"
                        value={formData.flat}
                        onChange={(e) => setFormData({ ...formData, flat: e.target.value })}
                        placeholder="e.g., Suite 100"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Postcode *
                      </label>
                      <input
                        type="text"
                        value={formData.zipcode}
                        onChange={(e) => setFormData({ ...formData, zipcode: e.target.value.toUpperCase() })}
                        placeholder="e.g., SW1A 1AA"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="Street address"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      // disabled={!useManualEntry && formData.addressLine1 !== ''}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      placeholder="Building, floor, etc."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., London"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      // disabled={!useManualEntry && formData.city !== ''}
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Set as default address</span>
                  </label>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddAddress}
                      disabled={saving || !formData.name || !formData.addressLine1 || !formData.city || !formData.zipcode}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}