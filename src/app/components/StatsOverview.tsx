// components/dashboard/StatsOverview.tsx
"use client";

import { useEffect, useState } from "react";
import { DashboardStats, SpendingTrend } from "@/types/stats";
import { statsApi } from "@/api/stats";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  Wallet,
  CreditCard,
  Store,
} from "lucide-react";
import { PaymentMethodsChart } from "./PaymentMethodsChart";
import { SpendingTrendsChart } from "./SpendingTrendsChart";

interface StatsOverviewProps {
  organizationId: string;
}

export function StatsOverview({ organizationId }: StatsOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const formatNumber = (num: number): string => {
    return num.toLocaleString("en-GB");
  };

  useEffect(() => {
    loadStats();
  }, [organizationId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsApi.getDashboardStats(organizationId);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-slate-500">
        Failed to load statistics
      </div>
    );
  }

  const { currentMonth, organization } = stats;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Spent */}
        <StatCard
          title="Total Spent"
          value={`£${currentMonth.totalSpent.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
          subtitle={`${currentMonth.totalOrders} orders`}
        />

        {/* Average Order Value */}
        <StatCard
          title="Avg Order Value"
          value={`£${formatNumber(
            Number(currentMonth.averageOrderValue.toFixed(2))
          )}`}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="emerald"
          subtitle="per order"
        />

        {/* Active Employees */}
        <StatCard
          title="Active Employees"
          value={currentMonth.uniqueEmployees.toString()}
          icon={<Users className="w-6 h-6" />}
          color="purple"
          subtitle="ordered this month"
        />

        {/* Wallet Balance */}
        <StatCard
          title="Wallet Balance"
          value={`£${formatNumber(
            Number(organization.walletBalance.toFixed(2))
          )}`}
          icon={<Wallet className="w-6 h-6" />}
          color="amber"
        />
      </div>
      {/* Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="rounded-xl p-6 bg-base-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Payment Methods
            </h3>
            <Wallet className="w-5 h-5 text-slate-400" />
          </div>
          <PaymentMethodsChart
            walletAmount={currentMonth.walletUsage}
            stripeAmount={currentMonth.stripeUsage}
          />
        </div>

        {/* Top Restaurants */}
        <div className="rounded-xl p-6 bg-base-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Top Restaurants
            </h3>
            <Store className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
            {stats.topRestaurants.slice(0, 5).map((restaurant, index) => (
              <RestaurantItem
                key={restaurant.restaurantId}
                rank={index + 1}
                name={restaurant.restaurantName}
                spent={restaurant.totalSpent}
                orders={restaurant.totalOrders}
              />
            ))}
            {stats.topRestaurants.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                No restaurant orders yet
              </p>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <SpendingTrendsChart trends={stats.spendingTrends} />
        </div>
      </div>

      {/* Spending Trends Chart */}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "purple" | "amber";
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
  };

  const bgColors = {
    blue: "--color-swift-blue",
    emerald: "--color-swift-green",
    purple: "--color-swift-pink",
    amber: "--color-swift-yellow",
  };

  return (
    <div
      className={`bg-gradient-to-br rounded-xl bg-base-200 pb-6 pt-4 px-4 text-black`}
    >
      <div
        className={`${bgColors[color]} h-1 w-full rounded-full mb-4`}
        style={{ backgroundColor: `var(${bgColors[color]})` }}
      ></div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        {/* <div className="w-12 h-12 rounded-lg flex items-center justify-center">
          {icon}
        </div> */}
      </div>
      {subtitle && <p className="text-sm">{subtitle}</p>}
    </div>
  );
}

// Restaurant Item
interface RestaurantItemProps {
  rank: number;
  name: string;
  spent: number;
  orders: number;
}

function RestaurantItem({ rank, name, spent, orders }: RestaurantItemProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full text-base-content flex items-center justify-center font-semibold text-sm">
          {rank}
        </div>
        <div>
          <p className="font-medium text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{orders} orders</p>
        </div>
      </div>
      <span className="font-semibold text-slate-900">£{spent.toFixed(2)}</span>
    </div>
  );
}

