import { useState, useRef, useEffect } from "react";
import { DietaryFilter } from "../../types/menuItem";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  dietaryRestrictions: DietaryFilter[];
  allergens: string[];
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
}: FilterModalProps) {
  const mobileModalRef = useRef<HTMLDivElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] =
    useState<DietaryFilter[]>([]);

  // Prevent body scroll on mobile when modal is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close dropdown when clicking outside (desktop only - mobile uses backdrop onClick)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle for desktop (mobile uses backdrop onClick)
      if (window.innerWidth >= 768) {
        if (
          desktopDropdownRef.current &&
          !desktopDropdownRef.current.contains(event.target as Node)
        ) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const allergies = [
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

  // Dietary filters based on enum
  const dietaryFilterOptions: DietaryFilter[] = [
    DietaryFilter.HALAL,
    DietaryFilter.VEGETARIAN,
    DietaryFilter.NONVEGETARIAN,
    DietaryFilter.PESCATERIAN,
    DietaryFilter.NO_GLUTEN,
    DietaryFilter.NO_NUT,
    DietaryFilter.NO_DAIRY,
  ];

  const DIETARY_LABELS: Record<DietaryFilter, string> = {
    [DietaryFilter.HALAL]: "Halal",
    [DietaryFilter.VEGETARIAN]: "Vegetarian",
    [DietaryFilter.NONVEGETARIAN]: "Non-vegetarian",
    [DietaryFilter.PESCATERIAN]: "Pescatarian",
    [DietaryFilter.NO_GLUTEN]: "No gluten",
    [DietaryFilter.NO_NUT]: "No nuts",
    [DietaryFilter.NO_DAIRY]: "No dairy",
  };

  const toggleRestriction = (item: string) => {
    if (item === "No specific preferences") {
      setSelectedAllergens([]);
    } else {
      setSelectedAllergens((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    }
  };

  const toggleDietary = (item: DietaryFilter) => {
    setSelectedDietaryRestrictions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleApply = () => {
    onApply({
      dietaryRestrictions: selectedDietaryRestrictions,
      allergens: selectedAllergens,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Modal (fixed overlay) */}
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          // Close if clicking the backdrop (not the modal content)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          ref={mobileModalRef}
          className="bg-white rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
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
              Allergies
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              No specific preferences
            </p>
            <div className="flex flex-wrap gap-2">
              {allergies.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleRestriction(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedAllergens.includes(item)
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="mb-5">
            <h3 className="text-base font-semibold text-base-content mb-2">
              Dietary Restrictions
            </h3>
            <div className="flex flex-wrap gap-2">
              {dietaryFilterOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleDietary(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedDietaryRestrictions.includes(item)
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {DIETARY_LABELS[item]}
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
      </div>

      {/* Desktop Dropdown (absolute positioning) */}
      <div
        ref={desktopDropdownRef}
        className="hidden md:block absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl max-h-[80vh] overflow-y-auto p-6 z-50 max-w-4xl mx-auto"
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
            Allergies
          </h3>
          <p className="text-sm text-gray-500 mb-2">No specific preferences</p>
          <div className="flex flex-wrap gap-2">
            {allergies.map((item) => (
              <button
                key={item}
                onClick={() => toggleRestriction(item)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedAllergens.includes(item)
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-base-content mb-2">
            Dietary Restrictions
          </h3>
          <div className="flex flex-wrap gap-2">
            {dietaryFilterOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleDietary(item)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedDietaryRestrictions.includes(item)
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {DIETARY_LABELS[item]}
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
    </>
  );
}
