import apiClient from "./client";
import { Restaurant } from "@/types/restaurant";

export const restaurantApi = {
  fetchRestaurants: async (): Promise<Restaurant[]> => {
    const response = await apiClient.get(
      `/restaurant/corporate/restaurants`
    );
    console.log("Fetched restaurants: ", response);
    return response.data;
  },
};
