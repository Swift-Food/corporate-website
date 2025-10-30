import { CorporateMenuItem } from "@/types/menuItem";
import apiClient from "./client";

export const menuItemApi = {
  fetchItemsFromRestaurant: async (
    restaurantId: string
  ): Promise<CorporateMenuItem[]> => {
    const response = await apiClient.get(
      `${process.env.NEXT_PUBLIC_API_URL}/corporate-menu-item/restaurant/${restaurantId}`
    );
    console.log("Fetching the corporate menu items: ", response);
    return response.data;
  },
};
