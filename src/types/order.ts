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
  employeeId: string;
  status: string;
  totalAmount: number;
  restaurantOrders: RestaurantOrder[];
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
