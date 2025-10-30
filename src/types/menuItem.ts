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

export interface AddonOption {
  id?: string;
  name: string;
  price: number;
  // any extra metadata the UI might need
  description?: string;
  isDefault?: boolean;
}

export interface Addon {
  id?: string;
  name: string;
  // whether customer must pick one of the options
  required?: boolean;
  // min/max selection counts for this addon group
  min?: number;
  max?: number;
  options: AddonOption[];
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
