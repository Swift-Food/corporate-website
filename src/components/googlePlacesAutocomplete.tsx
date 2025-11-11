// components/GooglePlacesAutocomplete.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface GooglePlacesAutocompleteProps {
  onPlaceSelected: (place: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    zipcode: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}

export function GooglePlacesAutocomplete({
  onPlaceSelected,
  placeholder = 'Search for an address',
  defaultValue = '',
  value = '',
  onChange
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initAutocomplete();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      initAutocomplete();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const initAutocomplete = () => {
    if (!inputRef.current) return;

    // Create autocomplete instance
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
    
      componentRestrictions: { country: 'GB' }, // Limit to UK
      fields: ["address_components", "geometry", "formatted_address"],
    });

    // Bias results to London
    const londonBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(51.28, -0.51), // Southwest corner
      new google.maps.LatLng(51.69, 0.33)   // Northeast corner
    );
    autocomplete.setBounds(londonBounds);
    autocomplete.setOptions({ strictBounds: false }); // Allow results outside bounds but prefer London

    autocompleteRef.current = autocomplete;

    // Listen for place selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        console.error('No geometry found for selected place');
        return;
      }

      // Extract address components
      const addressComponents = place.address_components || [];
      let streetNumber = '';
      let route = '';
      let locality = '';
      let postalCode = '';
      let sublocality = '';
      let premise = '';

      addressComponents.forEach((component) => {
        const types = component.types;

        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          route = component.long_name;
        }
        if (types.includes('locality')) {
          locality = component.long_name;
        }
        if (types.includes('postal_town')) {
          locality = locality || component.long_name;
        }
        if (types.includes('postal_code')) {
          postalCode = component.long_name;
        }
        if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
          sublocality = component.long_name;
        }
        if (types.includes('premise')) {
          premise = component.long_name;
        }
      });

      // Construct address
      const addressLine1 = `${streetNumber} ${route}`.trim() || place.name || '';
      const addressLine2 = premise || sublocality || '';
      const city = locality || 'London';

      // Call callback with structured data
      onPlaceSelected({
        addressLine1,
        addressLine2,
        city,
        zipcode: postalCode,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      });
    });
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}  // Changed from defaultValue
        onChange={(e) => onChange?.(e.target.value)}  // Added onChange
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}