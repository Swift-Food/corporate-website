import { useState, useRef, useEffect } from "react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  dietaryRestrictions: string[];
  preferences: string[];
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
}: FilterModalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    []
  );
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const dietaryRestrictions = [
    "No specific preferences",
    "Celery",
    "Cereals containing gluten",
    "Crustaceans",
    "Eggs",
    "Fish",
    "Lupin",
    "Mustard",
    "Nuts",
    "Peanuts",
    "Sesame seeds",
    "Milk",
    "Soya",
    "Sulphur dioxide",
    "Molluscs",
    "Other (please specify)",
  ];

  const preferences = ["Halal", "Kosher", "Vegan", "Vegetarian"];

  const toggleRestriction = (item: string) => {
    if (item === "No specific preferences") {
      setSelectedRestrictions([]);
    } else {
      setSelectedRestrictions((prev) =>
        prev.includes(item)
          ? prev.filter((i) => i !== item)
          : [...prev, item]
      );
    }
  };

  const togglePreference = (item: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleApply = () => {
    onApply({
      dietaryRestrictions: selectedRestrictions,
      preferences: selectedPreferences,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl max-h-[80vh] overflow-y-auto p-6 z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-base-content">Filters</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Dietary Restrictions */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-base-content mb-2">
          Dietary Restrictions
        </h3>
        <p className="text-sm text-gray-500 mb-2">No specific preferences</p>
        <div className="flex flex-wrap gap-2">
          {dietaryRestrictions.map((item) => (
            <button
              key={item}
              onClick={() => toggleRestriction(item)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedRestrictions.includes(item)
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-base-content mb-2">
          Preferences
        </h3>
        <div className="flex flex-wrap gap-2">
          {preferences.map((item) => (
            <button
              key={item}
              onClick={() => togglePreference(item)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedPreferences.includes(item)
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-full text-base transition-colors"
      >
        APPLY
      </button>
    </div>
  );
}
