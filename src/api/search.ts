import { SearchFilters, SearchResponse } from "@/types/search";
import apiClient from "./client";

export const searchApi = {
  searchMenuItems: async (
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResponse> => {
    const params = new URLSearchParams();

    params.append("q", query);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.marketId) params.append("marketId", filters.marketId);
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.minRating)
      params.append("minRating", filters.minRating.toString());
    if (filters?.maxPrice)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters?.dietaryFilters)
      params.append("dietaryFilters", filters.dietaryFilters.join(","));
    if (filters?.allergens)
      params.append("excludeAllergens", filters.allergens.join(","));

    console.log("Search payload: ", params);
    const response = await apiClient.get(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/search?corporate=true&${params.toString()}`
    );
    console.log("Search response: ", response);
    return response.data;
  },
};
