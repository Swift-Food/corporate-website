export type Allergen = string; // keep flexible (e.g. 'NUTS', 'DAIRY', ...)

export type MenuItemStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SOLD_OUT"
  | "DRAFT"
  | "CATERING";

export enum MenuItemStyle {
  CARD = "CARD",
  HORIZONTAL = "HORIZONTAL",
}

export enum DietaryFilter {
  VEGETARIAN = "vegetarian",
  NONVEGETARIAN = "nonvegetarian",
  VEGAN = "vegan",
  NO_GLUTEN = "no_gluten",
  NO_NUT = "no_nut",
  NO_DAIRY = "no_dairy",
  HALAL = "halal",
  PESCATERIAN = "pescatarian",
}

export enum Allergens {
  // =========================
  // ✅ Official (Big 14 Allergens)
  // =========================
  CELERY = "celery",
  CEREALS_CONTAINING_GLUTEN = "cereals_containing_gluten",
  CRUSTACEANS = "crustaceans",
  EGGS = "eggs",
  FISH = "fish",
  LUPIN = "lupin",
  MILK = "milk",
  MOLLUSCS = "molluscs",
  MUSTARD = "mustard",
  PEANUTS = "peanuts",
  SESAME_SEEDS = "sesame_seeds",
  SOYBEANS = "soybeans",
  SULPHUR_DIOXIDE = "sulphur_dioxide",
  TREE_NUTS = "tree_nuts",

  // =========================
  // 🌱 Common Sensitivities / Additions
  // =========================
  WHEAT = "wheat",
  BARLEY = "barley",
  RYE = "rye",
  OATS = "oats",
  CORN = "corn",
  GELATIN = "gelatin",
  GARLIC = "garlic",
  ONION = "onion",
  ALCOHOL = "alcohol",
  PORK = "pork",
  BEEF = "beef",
  CHICKEN = "chicken",
  LAMB = "lamb",
  LEGUMES = "legumes",
  CAFFEINE = "caffeine",
  COCOA = "cocoa",
  COLORANTS = "colorants",
  PRESERVATIVES = "preservatives",

  // =========================
  // 🧩 Old stuff (legacy keys — safe to remove later)
  // =========================
  GLUTEN = "gluten",
  MEAT = "meat",
  NUTS = "nuts",
  MOLUSCS = "moluscs", // typo legacy of molluscs
  SOYA = "soya", // alias of soybeans
}

// export interface AddonOption {
//   id?: string;
//   name: string;
//   price: number;
//   // any extra metadata the UI might need
//   description?: string;
//   isDefault?: boolean;
// }

// export interface Addon {
//   id?: string;
//   name: string;
//   // whether customer must pick one of the options
//   isRequired: boolean;
//   price: number;
//   // min/max selection counts for this addon group
//   min?: number;
//   max?: number;
//   options: AddonOption[];
// }
export interface AddonGroup {
  groupTitle: string;
  addons: Addon[];
  isRequired: boolean;
  selectionType: "single" | "multiple";
}

export interface Addon {
  name: string;
  price: number;
  allergens: string[];
  groupTitle: string;
  isRequired: boolean;
  selectionType: "single" | "multiple";
}

export interface ApiMenuItem {
  id: string;
  restaurantId: string;
  restaurant?: { id: string; name?: string } | null;

  name: string;
  description?: string | null;
  groupTitle?: string | null;
  image?: string | null;

  price: string;
  discountPrice?: string | null;
  isDiscount: boolean;

  allergens: Allergen[];
  dietaryFilters?: string[];

  addons?: Addon[] | null;

  style: MenuItemStyle;

  itemDisplayOrder: string | number;
  prepTime: string | number;
  averageRating: string | number;
  popular: boolean;
  isAvailable: boolean;
  status: MenuItemStatus;

  cateringQuantityUnit: string | number;
  feedsPerUnit: string | number;

  maxPortionsPerSession?: string | number | null;

  limitedIngredientsContained?: string[] | null;
  limitedIngredientsRemaining?: Record<string, number> | null;

  createdAt: string | Date;
  updatedAt: string | Date;
}
export interface CorporateMenuItem {
  id: string;
  restaurantId: string;
  // optional relation payload (frontend may only have id)
  restaurant?: { id: string; name?: string } | null;

  name: string;
  description?: string | null;
  groupTitle?: string | null;
  image?: string | null;

  price: number;
  discountPrice?: number | null;
  isDiscount: boolean;

  allergens: Allergen[];
  dietaryFilters?: DietaryFilter[];

  addons?: Addon[] | null;

  style: MenuItemStyle;

  itemDisplayOrder: number;
  prepTime: number;
  averageRating: number;
  popular: boolean;
  isAvailable: boolean;
  status: MenuItemStatus;

  cateringQuantityUnit: number;
  feedsPerUnit: number;

  maxPortionsPerSession?: number | null;

  limitedIngredientsContained?: string[] | null;
  limitedIngredientsRemaining?: Record<string, number> | null;

  createdAt: string | Date;
  updatedAt: string | Date;
}
