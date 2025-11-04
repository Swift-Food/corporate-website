import apiClient from './client';
import { CorporateUser, CorporateUserRole } from '../types/user';

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

  /**
   * Change employee role (promote/demote)
   */
  changeRole: async (
    employeeId: string,
    managerId: string,
    newRole: CorporateUserRole
  ) => {
    const response = await apiClient.patch(
      `/corporate-users/${employeeId}/change-role`,
      { newRole },
      { params: { managerId } }
    );
    return response.data;
  },

  /**
   * Promote employee to manager
   */
  promoteToManager: async (employeeId: string, managerId: string) => {
    const response = await apiClient.post(
      `/corporate-users/${employeeId}/promote-to-manager`,
      {},
      { params: { managerId } }
    );
    return response.data;
  },

  /**
   * Demote manager to employee
   */
  demoteToEmployee: async (employeeId: string, managerId: string) => {
    const response = await apiClient.post(
      `/corporate-users/${employeeId}/demote-to-employee`,
      {},
      { params: { managerId } }
    );
    return response.data;
  },

  async deactivateEmployee(employeeId: string): Promise<void> {
    await apiClient.post(
      `/corporate-users/${employeeId}/deactivate`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
  },
  
  async reactivateEmployee(employeeId: string): Promise<void> {
    await apiClient.post(
      `/corporate-users/${employeeId}/reactivate`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
  }
};