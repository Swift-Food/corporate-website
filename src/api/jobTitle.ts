import apiClient from './client';

export interface JobTitle {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  maxOrderValue?: number;
  dailyBudgetLimit?: number;
  monthlyBudgetLimit?: number;
  canOrder: boolean;
  requiresApproval: boolean;
  approvalThreshold?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  employeeCount?: number;
}

export interface CreateJobTitleDto {
  name: string;
  description?: string;
  maxOrderValue?: number;
  dailyBudgetLimit?: number;
  monthlyBudgetLimit?: number;
  canOrder?: boolean;
  requiresApproval?: boolean;
  approvalThreshold?: number;
}

export interface AssignJobTitleDto {
  jobTitleId: string;
  employeeIds: string[];
}

export const jobTitlesApi = {
  /**
   * Get all job titles for organization
   */
  getAll: async (organizationId: string): Promise<JobTitle[]> => {
    const response = await apiClient.get<JobTitle[]>(
      `/organizations/${organizationId}/job-titles`
    );
    return response.data;
  },

  /**
   * Get single job title
   */
  getOne: async (organizationId: string, id: string): Promise<JobTitle> => {
    const response = await apiClient.get<JobTitle>(
      `/organizations/${organizationId}/job-titles/${id}`
    );
    return response.data;
  },

  /**
   * Create job title
   */
  create: async (organizationId: string, data: CreateJobTitleDto): Promise<JobTitle> => {
    const response = await apiClient.post<JobTitle>(
      `/organizations/${organizationId}/job-titles`,
      data
    );
    return response.data;
  },

  /**
   * Update job title
   */
  update: async (organizationId: string, id: string, data: CreateJobTitleDto): Promise<JobTitle> => {
    const response = await apiClient.put<JobTitle>(
      `/organizations/${organizationId}/job-titles/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete job title
   */
  delete: async (organizationId: string, id: string): Promise<void> => {
    await apiClient.delete(`/organizations/${organizationId}/job-titles/${id}`);
  },

  /**
   * Get statistics
   */
  getStatistics: async (organizationId: string): Promise<any> => {
    const response = await apiClient.get(
      `/organizations/${organizationId}/job-titles/statistics`
    );
    return response.data;
  },

  /**
   * Assign job title to employees
   */
  assign: async (
    organizationId: string,
    data: AssignJobTitleDto,
    managerId: string
  ): Promise<any> => {
    const response = await apiClient.post(
      `/corporate-users/organization/${organizationId}/assign-job-title`,
      data,
      { params: { managerId } }
    );
    return response.data;
  },

  /**
   * Get employees by job title
   */
  getEmployeesByTitle: async (
    organizationId: string,
    jobTitleId: string
  ): Promise<any[]> => {
    const response = await apiClient.get(
      `/corporate-users/organization/${organizationId}/job-title/${jobTitleId}/employees`
    );
    return response.data;
  },

  /**
   * Remove job title from employee
   */
  removeFromEmployee: async (employeeId: string, managerId: string): Promise<any> => {
    const response = await apiClient.delete(
      `/corporate-users/${employeeId}/job-title`,
      { params: { managerId } }
    );
    return response.data;
  },
};