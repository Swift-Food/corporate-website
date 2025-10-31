import { CreateEmployeeOrderDto, OrderResponse } from "@/types/order";
import apiClient from "./client";

export const checkoutApi = {
  createOrder: async (
    employeeId: string,
    orderData: CreateEmployeeOrderDto
  ): Promise<OrderResponse> => {
    console.log("Checkout create order: ", employeeId, orderData);
    const response = await apiClient.post(
      `${process.env.NEXT_PUBLIC_API_URL}/corporate-orders/my-order/${employeeId}`,
      orderData
    );
    return response.data;
  },
};
