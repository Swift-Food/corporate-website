import { useState, useRef, useEffect } from "react";
import { DietaryFilter, Allergens } from "../../types/menuItem";
import { useFilters } from "../../contexts/FilterContext";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const mobileModalRef = useRef<HTMLDivElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const { filters, setFilters } = useFilters();

  // Local state for temporary selections (before Apply)
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    filters.allergens
  );
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] =
    useState<DietaryFilter[]>(filters.dietaryRestrictions);

  // Sync local state with context when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAllergens(filters.allergens);
      setSelectedDietaryRestrictions(filters.dietaryRestrictions);
    }
  }, [isOpen, filters]);

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

  const handleNoSaveClose = () => {
    setSelectedAllergens([]);
    setSelectedDietaryRestrictions([]);
    onClose();
  };

  // Close dropdown when clicking outside (desktop only - mobile uses backdrop onClick)
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     // Only handle for desktop (mobile uses backdrop onClick)
  //     if (window.innerWidth >= 768) {
  //       if (
  //         desktopDropdownRef.current &&
  //         !desktopDropdownRef.current.contains(event.target as Node)
  //       ) {
  //         onClose();
  //       }
  //     }
  //   };

  //   if (isOpen) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [isOpen, onClose]);

  // Official Big 14 Allergens
  const allergenOptions: Allergens[] = [
    Allergens.CELERY,
    Allergens.CEREALS_CONTAINING_GLUTEN,
    Allergens.CRUSTACEANS,
    Allergens.EGGS,
    Allergens.FISH,
    Allergens.LUPIN,
    Allergens.MILK,
    Allergens.MOLLUSCS,
    Allergens.MUSTARD,
    Allergens.PEANUTS,
    Allergens.SESAME_SEEDS,
    Allergens.SOYBEANS,
    Allergens.SULPHUR_DIOXIDE,
    Allergens.TREE_NUTS,
  ];

  const ALLERGEN_LABELS: Record<Allergens, string> = {
    // Official (Big 14 Allergens)
    [Allergens.CELERY]: "Celery",
    [Allergens.CEREALS_CONTAINING_GLUTEN]: "Cereals containing gluten",
    [Allergens.CRUSTACEANS]: "Crustaceans",
    [Allergens.EGGS]: "Eggs",
    [Allergens.FISH]: "Fish",
    [Allergens.LUPIN]: "Lupin",
    [Allergens.MILK]: "Milk",
    [Allergens.MOLLUSCS]: "Molluscs",
    [Allergens.MUSTARD]: "Mustard",
    [Allergens.PEANUTS]: "Peanuts",
    [Allergens.SESAME_SEEDS]: "Sesame seeds",
    [Allergens.SOYBEANS]: "Soybeans",
    [Allergens.SULPHUR_DIOXIDE]: "Sulphur dioxide",
    [Allergens.TREE_NUTS]: "Tree nuts",
    // Common Sensitivities / Additions
    [Allergens.WHEAT]: "Wheat",
    [Allergens.BARLEY]: "Barley",
    [Allergens.RYE]: "Rye",
    [Allergens.OATS]: "Oats",
    [Allergens.CORN]: "Corn",
    [Allergens.GELATIN]: "Gelatin",
    [Allergens.GARLIC]: "Garlic",
    [Allergens.ONION]: "Onion",
    [Allergens.ALCOHOL]: "Alcohol",
    [Allergens.PORK]: "Pork",
    [Allergens.BEEF]: "Beef",
    [Allergens.CHICKEN]: "Chicken",
    [Allergens.LAMB]: "Lamb",
    [Allergens.LEGUMES]: "Legumes",
    [Allergens.CAFFEINE]: "Caffeine",
    [Allergens.COCOA]: "Cocoa",
    [Allergens.COLORANTS]: "Colorants",
    [Allergens.PRESERVATIVES]: "Preservatives",
    // Legacy
    [Allergens.GLUTEN]: "Gluten",
    [Allergens.MEAT]: "Meat",
    [Allergens.NUTS]: "Nuts",
    [Allergens.MOLUSCS]: "Moluscs (legacy)",
    [Allergens.SOYA]: "Soya",
  };

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

  const toggleAllergen = (item: Allergens) => {
    setSelectedAllergens((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Clear both allergens and dietary restrictions
  const clearFilters = () => {
    setSelectedAllergens([]);
    setSelectedDietaryRestrictions([]);
  };

  const clearAllergens = () => {
    setSelectedAllergens([]);
  };

  const clearDietaryRestrictions = () => {
    setSelectedDietaryRestrictions([]);
  };

  const toggleDietary = (item: DietaryFilter) => {
    setSelectedDietaryRestrictions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleApply = () => {
    setFilters({
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
              onClick={handleNoSaveClose}
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

          {/* Allergens */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-base-content">
                Allergens
              </h3>
              {selectedAllergens.length > 0 && (
                <button
                  onClick={clearAllergens}
                  className="text-xs text-pink-500 hover:text-pink-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Select allergens to exclude from results
            </p>
            <div className="flex flex-wrap gap-2">
              {allergenOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleAllergen(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedAllergens.includes(item)
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {ALLERGEN_LABELS[item]}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-base-content">
                Dietary Restrictions
              </h3>
              {selectedDietaryRestrictions.length > 0 && (
                <button
                  onClick={clearDietaryRestrictions}
                  className="text-xs text-pink-500 hover:text-pink-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
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

        {/* Allergens */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-base-content">
              Allergens
            </h3>
            {selectedAllergens.length > 0 && (
              <button
                onClick={clearAllergens}
                className="text-xs text-pink-500 hover:text-pink-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Select allergens to exclude from results
          </p>
          <div className="flex flex-wrap gap-2">
            {allergenOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleAllergen(item)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedAllergens.includes(item)
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {ALLERGEN_LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-base-content">
              Dietary Restrictions
            </h3>
            {selectedDietaryRestrictions.length > 0 && (
              <button
                onClick={clearDietaryRestrictions}
                className="text-xs text-pink-500 hover:text-pink-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
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

        {/* Clear Filter Button (desktop) */}
        {(selectedAllergens.length > 0 ||
          selectedDietaryRestrictions.length > 0) && (
          <button
            onClick={clearFilters}
            className="mb-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-full text-sm transition-colors"
          >
            Clear Filter
          </button>
        )}

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
