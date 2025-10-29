export enum RestaurantType {
  STALL = 'stall',
  RESTAURANT = 'restaurant',
}

export interface RestaurantOpeningHours {
  day: string;
  open: string | null;
  close: string | null;
}

export interface RestaurantCateringOperatingHours {
  day: string;
  open: string | null;
  close: string | null;
  enabled: boolean;
}

export interface RestaurantMenuGroupSettings {
  [groupTitle: string]: {
    displayOrder: number;
    isVisible: boolean;
  };
}

export interface RestaurantHappyHour {
  discount: number;
  freeDrink: boolean;
  durationMinutes: number;
  startTime?: Date;
  endTime?: Date;
}

export interface RestaurantPaymentMethod {
  id: string;
  type: string;
  accountHolderName?: string;
  accountNumber?: string;
  sortCode?: string;
}

export interface RestaurantCateringMinOrderSettings {
  minQuantity: number;
  applicableSections: string[]; // Array of group titles that count towards minimum
}

export interface Restaurant {
  id: string;
  restaurant_name: string;
  restaurant_description: string | null;
  commission: number;
  addressId: string;
  phoneNumber: string | null;
  restaurantType: RestaurantType;
  email: string | null;
  featured: boolean;
  openingHours: RestaurantOpeningHours[];
  images: string[] | null;
  averageRating: number;
  isOpen: boolean;
  menuGroupSettings: RestaurantMenuGroupSettings | null;
  createdAt: Date;
  updatedAt: Date;
  marketId: string;
  restaurantNumber: string | null;
  orderItems: any[] | null; // OrderItem type would be defined in orderItem.ts
  deviceToken: string | null;
  happyHour: RestaurantHappyHour | null;
  isCatering: boolean | null;
  isHappyHour: boolean | null;
  activePromotionsCount: number;
  maxDiscountAmount: number;
  maxDiscountPercentage: number;
  fsa: number;
  fsaLink: string | null;
  autoAccept: boolean | null;
  availableBalance: number;
  lastPayoutDate: Date | null;
  paymentMethods: RestaurantPaymentMethod[] | null;
  cateringMinOrderSettings: RestaurantCateringMinOrderSettings | null;
  minimumDeliveryNoticeHours: number | null;
  contactEmail: string | null;
  contactNumber: string | null;
  takeDiscount: boolean;
  cateringOperatingHours: RestaurantCateringOperatingHours[] | null;
}

export interface RestaurantsResponse {
  restaurants: Restaurant[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface RestaurantFilters {
  cuisine?: string;
  priceRange?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}
