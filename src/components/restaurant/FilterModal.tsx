import { useState } from "react";

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
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    []
  );
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-base-content">Filters</h2>
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
              className="w-6 h-6"
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-base-content mb-3">
            Dietary Restrictions
          </h3>
          <div className="flex flex-wrap gap-2">
            {dietaryRestrictions.map((item) => (
              <button
                key={item}
                onClick={() => toggleRestriction(item)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-base-content mb-3">
            Preferences
          </h3>
          <div className="flex flex-wrap gap-2">
            {preferences.map((item) => (
              <button
                key={item}
                onClick={() => togglePreference(item)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-full text-lg transition-colors"
        >
          APPLY
        </button>
      </div>
    </div>
  );
}
