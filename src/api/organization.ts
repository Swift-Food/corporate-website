import apiClient from "./client";
import { OrganizationResponseDto } from "../types/organization";

export const organizationApi = {
  /**
   * Fetch organization by ID
   * GET /organizations/:id
   */
  fetchOrganizationById: async (
    organizationId: string
  ): Promise<OrganizationResponseDto> => {
    const response = await apiClient.get(
      `${process.env.NEXT_PUBLIC_API_URL}/organizations/${organizationId}`
    );
    return response.data;
  },
};
