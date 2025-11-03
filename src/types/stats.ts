// types/stats.ts

export interface RestaurantStatsBreakdown {
  restaurantId: string;
  restaurantName: string;
  totalSpent: number;
  totalOrders: number;
  restaurantEarnings: number;
  itemCount: number;
}

export interface OrganizationStats {
  id: string;
  organizationId: string;
  year: number;
  month: number;
  
  // Order counts
  totalOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  cancelledOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  
  // Financial
  totalSpent: number;
  totalRefunded: number;
  walletUsage: number;
  stripeUsage: number;
  averageOrderValue: number;
  
  // Employees
  uniqueEmployeesOrdered: number;
  totalEmployeeOrders: number;
  
  // Restaurants
  restaurantBreakdown: RestaurantStatsBreakdown[];
  
  // Budget
  totalBudgetAllocated: number;
  totalBudgetUsed: number;
  budgetUtilizationRate: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  organization: {
    id: string;
    name: string;
    walletBalance: number;
    walletReserved: number;
  };
  currentMonth: {
    year: number;
    month: number;
    totalOrders: number;
    approvedOrders: number;
    rejectedOrders: number;
    deliveredOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    uniqueEmployees: number;
    walletUsage: number;
    stripeUsage: number;
  };
  topRestaurants: RestaurantStatsBreakdown[];
  spendingTrends: SpendingTrend[];
}

export interface SpendingTrend {
  year: number;
  month: number;
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  orders: {
    total: number;
    approved: number;
    rejected: number;
    cancelled: number;
    delivered: number;
    failed: number;
  };
  financial: {
    totalSpent: number;
    totalRefunded: number;
    walletUsage: number;
    stripeUsage: number;
    averageOrderValue: number;
  };
  employees: {
    uniqueOrdered: number;
    totalOrders: number;
  };
  restaurants: RestaurantStatsBreakdown[];
  budget: {
    allocated: number;
    used: number;
    utilizationRate: number;
  };
}