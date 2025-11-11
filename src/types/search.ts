import { Allergens, DietaryFilter } from "./menuItem";

export interface SearchResult {
  type: "restaurant" | "menu_item";
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: string;
  isDiscount: boolean;
  discountPrice?: string;
  groupTitle?: string;
  cateringQuantityUnit?: number;
  feedsPerUnit?: number;
  rating?: number;
  reviews?: number;
  isOpen?: boolean;
  openHours?: string;
  openingHours?: any[];
  marketId?: string;
  restaurantId: string;
  fsa?: number;
  fsaLink?: string;
  minimumDeliveryNoticeHours?: number;
  addonPrice?: number;
  itemDisplayOrder: number;
  addons: any[];
  allergens?: string[];
  averageRating?: string;
  status?: string;
  portionQuantity?: number;
  selectedAddons?: {
    name: string;
    price: number;
    quantity: number;
    groupTitle: string;
  }[];
  restaurant?: {
    id: string;
    name: string;
    description: string;
    matchType: string;
    image: string[];
    rating: string;
    reviews: number;
    isOpen: boolean;
    openHours: string;
    openingHours: any[];
    minimumDeliveryNoticeHours?: number;
    marketId: string;
    restaurantId: string;
    fsa?: number;
    fsaLink?: string;
  };
  score: number;
  matchType: "exact" | "prefix" | "word" | "partial" | "description";
}

export interface SearchResponse {
  restaurants: any[];
  menuItems: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface SearchFilters {
  page?: number;
  limit?: number;
  marketId?: string;
  categoryId?: string;
  minRating?: number;
  maxPrice?: number;
  dietaryFilters: DietaryFilter[]
  allergens: Allergens[]
}