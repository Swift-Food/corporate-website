export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  rating?: number;
  cuisine?: string;
  priceRange?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
