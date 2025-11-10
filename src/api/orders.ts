import apiClient from './client';
import { CreateEmployeeOrderDto, OrderResponse } from '@/types/order';

export const ordersApi = {
  /**
   * Create a new employee order
   * POST /corporate-orders/my-order/:employeeId
   */
  createOrder: async (
    employeeId: string,
    orderData: CreateEmployeeOrderDto
  ): Promise<OrderResponse> => {
    const response = await apiClient.post(
      `/corporate-orders/my-order/${employeeId}`,
      orderData
    );
    return response.data;
  },

  /**
   * Get today's active order for the employee
   * GET /corporate-orders/my-order/:employeeId
   */
  getMyOrder: async (employeeId: string): Promise<OrderResponse | null> => {
    const response = await apiClient.get(
      `/corporate-orders/my-order/${employeeId}`
    );
    return response.data;
  },

  /**
   * Get employee's active orders
   * GET /corporate-orders/employee/:employeeId/active
   */
  getEmployeeActiveOrders: async (employeeId: string): Promise<OrderResponse[]> => {
    const response = await apiClient.get(
      `/corporate-orders/employee/${employeeId}/active`
    );
    return response.data;
  },

  /**
   * Get approved orders (for managers)
   * GET /corporate-orders/approved/:managerId
   */
  getApprovedOrders: async (managerId: string) => {
    const response = await apiClient.get(
      `/corporate-orders/approved/${managerId}`
    );
    return response.data;
  },

  /**
   * Get pending order for today (for managers)
   * GET /corporate-orders/pending/:managerId
   */
  getPendingOrder: async (managerId: string) => {
    const response = await apiClient.get(
      `/corporate-orders/pending/${managerId}`
    );
    return response.data;
  },

  /**
   * Approve an order (for managers)
   * POST /corporate-orders/:orderId/approve
   */
  approveOrder: async (orderId: string, managerId: string) => {
    const response = await apiClient.post(
      `/corporate-orders/${orderId}/approve`,
      { managerId }
    );
    return response.data;
  },

  /**
   * Reject an order (for managers)
   * POST /corporate-orders/:orderId/reject
   */
  rejectOrder: async (orderId: string, managerId: string, reason?: string) => {
    const response = await apiClient.post(
      `/corporate-orders/${orderId}/reject`,
      { managerId, reason }
    );
    return response.data;
  },

  /**
   * Reject a sub-order (for managers)
   * POST /corporate-orders/sub-orders/:subOrderId/reject
   */
  rejectSubOrder: async (subOrderId: string, managerId: string, reason?: string) => {
    const response = await apiClient.post(
      `/corporate-orders/sub-orders/${subOrderId}/reject`,
      { managerId, reason }
    );
    return response.data;
  },

  /**
   * Bulk reject sub-orders (for managers)
   * POST /corporate-orders/sub-orders/bulk-reject
   */
  bulkRejectSubOrders: async (
    subOrderIds: string[],
    managerId: string,
    reason?: string
  ) => {
    const response = await apiClient.post(
      `/corporate-orders/sub-orders/bulk-reject`,
      { subOrderIds, managerId, reason }
    );
    return response.data;
  },
};
