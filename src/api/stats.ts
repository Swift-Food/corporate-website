// lib/api/stats.ts
import apiClient from './client';
import { DashboardStats, MonthlyReport, SpendingTrend } from '@/types/stats';

export const statsApi = {
  getDashboardStats: async (organizationId: string): Promise<DashboardStats> => {
    const response = await apiClient.get(`/organizations/${organizationId}/stats/dashboard`);
    return response.data;
  },

  getMonthlyReport: async (
    organizationId: string,
    year: number,
    month: number
  ): Promise<MonthlyReport> => {
    const response = await apiClient.get(
      `/organizations/${organizationId}/stats/monthly/${year}/${month}`
    );
    return response.data;
  },

  getSpendingTrends: async (
    organizationId: string,
    months: number = 6
  ): Promise<SpendingTrend[]> => {
    const response = await apiClient.get(
      `/organizations/${organizationId}/stats/trends?months=${months}`
    );
    return response.data;
  },

  rebuildStats: async (
    organizationId: string,
    year: number,
    month: number
  ): Promise<any> => {
    const response = await apiClient.post(
      `/organizations/${organizationId}/stats/rebuild/${year}/${month}`
    );
    return response.data;
  },
};