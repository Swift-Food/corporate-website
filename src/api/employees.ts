import apiClient from './client';
import { CorporateUser } from '../types/user';

export const employeesApi = {
  /**
   * Get all employees in organization
   */
  getAllEmployees: async (organizationId: string, managerId: string): Promise<CorporateUser[]> => {
    const response = await apiClient.get<CorporateUser[]>(
      `/corporate-users/organization/${organizationId}/employees`,
      { params: { managerId } }
    );
    return response.data;
  },

  /**
   * Get single employee by ID
   */
  getEmployee: async (id: string): Promise<CorporateUser> => {
    const response = await apiClient.get<CorporateUser>(`/corporate-users/${id}`);
    return response.data;
  },
};