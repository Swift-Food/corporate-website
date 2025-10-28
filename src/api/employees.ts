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
   * Get pending approvals
   */
  getPendingApprovals: async (organizationId: string): Promise<CorporateUser[]> => {
    const response = await apiClient.get<CorporateUser[]>(
      `/corporate-users/organization/${organizationId}/pending`
    );
    return response.data;
  },

  /**
   * Approve employee
   */
  approveEmployee: async (employeeId: string, approverId: string): Promise<CorporateUser> => {
    const response = await apiClient.post<CorporateUser>(
      `/corporate-users/${employeeId}/approve`,
      { approvedBy: approverId }
    );
    return response.data;
  },

  /**
   * Reject employee
   */
  rejectEmployee: async (employeeId: string, rejectorId: string): Promise<void> => {
    await apiClient.post(
      `/corporate-users/${employeeId}/reject`,
      { rejectedBy: rejectorId }
    );
  },

  /**
   * Get single employee by ID
   */
  getEmployee: async (id: string): Promise<CorporateUser> => {
    const response = await apiClient.get<CorporateUser>(`/corporate-users/${id}`);
    return response.data;
  },
};