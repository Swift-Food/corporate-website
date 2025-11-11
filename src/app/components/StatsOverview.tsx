// components/dashboard/StatsOverview.tsx
'use client';

import { useEffect, useState } from 'react';
import { DashboardStats, SpendingTrend } from '@/types/stats';
import { statsApi } from '@/api/stats';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingBag, 
  DollarSign,
  Wallet,
  CreditCard,
  Store
} from 'lucide-react'

interface StatsOverviewProps {
  organizationId: string;
}

export function StatsOverview({ organizationId }: StatsOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-GB');
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
      console.error('Failed to load stats:', error);
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
          value={`£${formatNumber(Number(currentMonth.averageOrderValue.toFixed(2)))}`}
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
          value={`£${formatNumber(Number(organization.walletBalance.toFixed(2)))}`}
          icon={<Wallet className="w-6 h-6" />}
          color="amber"
          
        />
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <OrderStatusItem
            label="Approved"
            count={currentMonth.approvedOrders}
            color="emerald"
          />
          <OrderStatusItem
            label="Rejected"
            count={currentMonth.rejectedOrders}
            color="red"
          />
          <OrderStatusItem
            label="Delivered"
            count={currentMonth.deliveredOrders}
            color="blue"
          />
          <OrderStatusItem
            label="Total"
            count={currentMonth.totalOrders}
            color="slate"
          />
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Payment Methods</h3>
            <Wallet className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            <PaymentMethodItem
              label="Wallet"
              amount={currentMonth.walletUsage}
              percentage={
                (currentMonth.walletUsage / 
                  (currentMonth.walletUsage + currentMonth.stripeUsage)) * 100
              }
              color="blue"
            />
            <PaymentMethodItem
              label="Direct Payment"
              amount={currentMonth.stripeUsage}
              percentage={
                (currentMonth.stripeUsage / 
                  (currentMonth.walletUsage + currentMonth.stripeUsage)) * 100
              }
              color="purple"
            />
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Top Restaurants</h3>
            <Store className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
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
      </div>

      {/* Spending Trends Chart */}
      <SpendingTrendsChart trends={stats.spendingTrends} />
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      {subtitle && (
        <p className="text-white/70 text-sm">{subtitle}</p>
      )}
    </div>
  );
}

// Order Status Item
interface OrderStatusItemProps {
  label: string;
  count: number;
  color: 'emerald' | 'red' | 'blue' | 'slate';
}

function OrderStatusItem({ label, count, color }: OrderStatusItemProps) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colors[color]} mb-2`}>
        <span className="text-2xl font-bold">{count}</span>
      </div>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

// Payment Method Item
interface PaymentMethodItemProps {
  label: string;
  amount: number;
  percentage: number;
  color: 'blue' | 'purple';
}

function PaymentMethodItem({ label, amount, percentage, color }: PaymentMethodItemProps) {
  const colors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-slate-900">
          £{amount.toFixed(2)} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`${colors[color]} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
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
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
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

// Spending Trends Chart
interface SpendingTrendsChartProps {
  trends: SpendingTrend[];
}

function SpendingTrendsChart({ trends }: SpendingTrendsChartProps) {
  if (trends.length === 0) {
    return null;
  }

  const maxSpent = Math.max(...trends.map(t => t.totalSpent));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Spending Trends</h3>
      <div className="space-y-4">
        {trends.map((trend, index) => {
          const percentage = (trend.totalSpent / maxSpent) * 100;
          const monthName = new Date(trend.year, trend.month - 1).toLocaleString('default', { 
            month: 'short',
            year: 'numeric'
          });

          return (
            <div key={`${trend.year}-${trend.month}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{monthName}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900">
                    £{trend.totalSpent.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    ({trend.totalOrders} orders)
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}