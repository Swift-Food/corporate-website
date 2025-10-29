import apiClient from '@/api/client';
import {
  Restaurant,
  RestaurantsResponse,
  RestaurantFilters,
} from '../src/types/restaurant';

export const restaurantApi = {
  /**
   * Fetch all restaurants for consumers
   */
  getRestaurants: async (
    filters?: RestaurantFilters
  ): Promise<RestaurantsResponse> => {
    const params = new URLSearchParams();

    if (filters?.cuisine) params.append('cuisine', filters.cuisine);
    if (filters?.priceRange) params.append('priceRange', filters.priceRange);
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/restaurant/consumer/restaurants${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<RestaurantsResponse>(url);
    return response.data;
  },

  /**
   * Get a single restaurant by ID
   */
  getRestaurantById: async (id: string): Promise<Restaurant> => {
    const response = await apiClient.get<Restaurant>(
      `/restaurant/consumer/restaurants/${id}`
    );
    return response.data;
  },

  /**
   * Search restaurants by name or cuisine
   */
  searchRestaurants: async (query: string): Promise<RestaurantsResponse> => {
    const response = await apiClient.get<RestaurantsResponse>(
      `/restaurant/consumer/restaurants?search=${encodeURIComponent(query)}`
    );
    return response.data;
  },
};

export default restaurantApi;
