"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Allergens, DietaryFilter } from "@/types/menuItem";

export interface FilterState {
  dietaryRestrictions: DietaryFilter[];
  allergens: Allergens[];
}

interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const STORAGE_KEY = "restaurant-filters";

const defaultFilters: FilterState = {
  dietaryRestrictions: [],
  allergens: [],
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load filters from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFiltersState(parsed);
      }
    } catch (error) {
      console.error("Failed to load filters from local storage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Save filters to local storage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      } catch (error) {
        console.error("Failed to save filters to local storage:", error);
      }
    }
  }, [filters, isInitialized]);

  const setFilters = (newFilters: FilterState) => {
    setFiltersState(newFilters);
  };

  const clearFilters = () => {
    setFiltersState(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, clearFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
