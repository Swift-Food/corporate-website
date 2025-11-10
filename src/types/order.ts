// Types matching the backend DTOs for order creation

export interface SelectedAddon {
  name: string;
  price: number;
  quantity: number;
  groupTitle?: string;
}

export interface MenuItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  restaurantPrice?: number;
  commissionPrice?: number;
  cateringQuantityUnit?: number;
  feedsPerUnit?: number;
  selectedAddons?: SelectedAddon[];
}

export interface RestaurantOrder {
  restaurantId: string;
  restaurantName: string;
  menuItems: MenuItem[];
  specialInstructions?: string;
}

export interface CreateEmployeeOrderDto {
  restaurantOrders: RestaurantOrder[];
  deliveryAddressId: string;
  requestedDeliveryTime: string;
  specialInstructions?: string;
  dietaryRestrictions?: string[];
}

// Response type for created order
export interface OrderResponse {
  id: string;
  employeeId?: string;
  organizationId: string;
  status: string;
  orderDate: string;
  requestedDeliveryTime: string;
  estimatedDeliveryTime: string | null;
  actualDeliveryTime: string | null;
  deliveryAddressId: string;
  deliveryInstructions: string | null;
  subtotal: string | number;
  taxAmount: string | number;
  deliveryFee: string | number;
  discount: string | number;
  totalAmount: string | number;
  totalEmployees: number;
  paymentMethod?: string;
  paymentSource?: string;
  paymentIntentId: string | null;
  paymentCompleted: boolean;
  isPaid: boolean;
  paidAt: string | null;
  restaurantAccepted: boolean;
  restaurantAcceptedAt: string | null;
  restaurantRejectedAt: string | null;
  restaurantRejectionReason: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  cutoffTime: string;
  driverId: string | null;
  trackingUrl: string | null;
  metadata: any | null;
  restaurantOrders: RestaurantOrder[];
  subOrders?: any[];
  createdAt: string;
  updatedAt: string;
}

// Pagination info
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Order history response with pagination
export interface OrderHistoryResponse {
  orders: OrderResponse[];
  pagination: PaginationInfo;
}
