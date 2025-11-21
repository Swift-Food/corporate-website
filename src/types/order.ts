export interface SelectedAddon {
  addonId?: string;
  name: string;
  quantity: number;
  groupTitle?: string;
}

export interface PricingAddon {
  addonId: string;
  name: string;
  customerUnitPrice: number;
  quantity: number;
  groupTitle?: string;
}

export interface PricingMenuItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  customerUnitPrice: number;
  customerTotalPrice: number;
  restaurantBaseUnitPrice: number;
  restaurantBaseTotalPrice: number;
  commissionRate: number;
  commissionAmount: number;
  restaurantNetAmount: number;
  isDiscounted: boolean;
  originalUnitPrice?: number;
  discountAmount?: number;
  cateringQuantityUnit?: number;
  feedsPerUnit?: number;
  groupTitle?: string;
  selectedAddons?: PricingAddon[];
}

export interface PricingOrderItem {
  restaurantId: string;
  restaurantName: string;
  status: string;
  specialInstructions?: string;
  reminderConfirmed?: boolean;
  reminderConfirmedAt?: Date;
  menuItems: PricingMenuItem[];
  customerTotal: number;
  restaurantGrossAmount: number;
  restaurantCommissionTotal: number;
  restaurantNetAmount: number;
}

export interface MinimalMenuItem {
  menuItemId: string;
  quantity: number;
  selectedAddons?: Array<{
    addonId?: string;
    name: string;
    quantity: number;
    groupTitle?: string;
  }>;
  groupTitle?: string;
}

export interface MinimalRestaurantOrder {
  restaurantId: string;
  menuItems: MinimalMenuItem[];
  specialInstructions?: string;
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
  menuItems: MinimalMenuItem[];
  specialInstructions?: string;
}

export interface CreateEmployeeOrderDto {
  restaurantOrders: RestaurantOrder[];
  deliveryAddressId: string;
  requestedDeliveryTime: string;
  specialInstructions?: string;
  dietaryRestrictions?: string[];
}

export interface SubOrderResponse {
  id: string;
  status: string;
  employeeName: string;
  employeeEmail: string;
  employeeId: string;
  restaurants: PricingOrderItem[];
  customerTotal: number;
  platformCommission: number;
  restaurantGross: number;
  restaurantNet: number;
  specialInstructions?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorporateOrderResponse {
  id: string;
  orderReference: string;
  deliveryDate: Date;
  deliveryTime: string;
  cutoffTime: Date;
  status: string;
  organizationId: string;
  organizationName: string;
  subOrders: SubOrderResponse[];
  restaurantBreakdown: PricingOrderItem[];
  customerFinalTotal: number;
  platformCommissionRevenue: number;
  restaurantsTotalGross: number;
  restaurantsTotalNet: number;
  deliveryAddress: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  approvedByManagerId?: string;
  approvedByManagerName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  stripePaymentIntentId?: string;
  paid: boolean;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CateringOrderStatus {
  PENDING_REVIEW: string;
  PAYMENT_LINK_SENT: string;
  PAID: string;
  CONFIRMED: string;
  IN_PROGRESS: string;
  COMPLETED: string;
  CANCELLED: string;
}

export interface CateringOrderResponse {
  id: string;
  orderReference: string;
  eventDate: Date;
  deliveryDate: Date;
  eventTime: string;
  deliveryTime: string;
  status: string;
  restaurants: PricingOrderItem[];
  customerFinalTotal: number;
  platformCommissionRevenue: number;
  restaurantsTotalGross: number;
  restaurantsTotalNet: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType?: string;
  guestCount?: number;
  deliveryAddress?: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  pickupContactName?: string;
  pickupContactPhone?: string;
  specialInstructions?: string;
  accessToken?: string;
  sharedAccessUsers?: Array<{
    userId: string;
    email: string;
    role: 'viewer' | 'editor';
  }>;
  stripePaymentIntentId?: string;
  paid: boolean;
  paymentLinkUrl?: string;
  paymentLinkSentAt?: Date;
  paidAt?: Date;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  subtotal?: number;
  serviceCharge?: number;
  deliveryFee?: number;
  promoDiscount?: number;
  depositAmount?: number;
  estimatedTotal?: number;
  finalTotal?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CateringOrderSummary {
  id: string;
  orderReference: string;
  eventDate: Date;
  deliveryDate: Date;
  eventTime?: string;
  status: string;
  customerFinalTotal: number;
  restaurantCount: number;
  customerName: string;
  guestCount?: number;
  eventType?: string;
  paid: boolean;
  createdAt: Date;
}

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
  subOrders?: SubOrderResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface OrderHistoryResponse {
  data: SubOrderResponse[];
  pagination: PaginationInfo;
}
