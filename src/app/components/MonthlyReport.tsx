// components/dashboard/MonthlyReport.tsx
'use client';

import { useState, useEffect } from 'react';
import { MonthlyReport as MonthlyReportType } from '@/types/stats';
import { statsApi } from '@/api/stats';
import { 
  Calendar, 
  Download,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Store,
  FileText
} from 'lucide-react';

interface MonthlyReportProps {
  organizationId: string;
}

export function MonthlyReport({ organizationId }: MonthlyReportProps) {
  const [report, setReport] = useState<MonthlyReportType | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadReport();
  }, [organizationId, selectedYear, selectedMonth]);

  const handleExportReport = () => {
    if (!report || !report.orders) {
      return;
    }
  
    // Create CSV content
    const csvContent = generateReportCSV(report, selectedYear, selectedMonth);
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `monthly-report-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Helper function to generate CSV
  const generateReportCSV = (report: MonthlyReportType, year: number, month: number): string => {
    const monthName = months[month - 1];
    
    let csv = `Monthly Report - ${monthName} ${year}\n\n`;
    
    // Summary Section
    csv += `SUMMARY\n`;
    csv += `Total Orders,${report.orders.total}\n`;
    csv += `Approved Orders,${report.orders.approved}\n`;
    csv += `Delivered Orders,${report.orders.delivered}\n`;
    csv += `Rejected Orders,${report.orders.rejected}\n`;
    csv += `Cancelled Orders,${report.orders.cancelled}\n`;
    csv += `Failed Orders,${report.orders.failed}\n\n`;
    
    // Financial Section
    csv += `FINANCIAL\n`;
    csv += `Total Spent,£${report.financial.totalSpent.toFixed(2)}\n`;
    csv += `Wallet Usage,£${report.financial.walletUsage.toFixed(2)}\n`;
    csv += `Direct Payments,£${report.financial.stripeUsage.toFixed(2)}\n`;
    csv += `Total Refunded,£${report.financial.totalRefunded.toFixed(2)}\n`;
    csv += `Average Order Value,£${report.financial.averageOrderValue.toFixed(2)}\n\n`;
    
    // Employee Section
    csv += `EMPLOYEES\n`;
    csv += `Unique Employees Ordered,${report.employees.uniqueOrdered}\n`;
    csv += `Total Employee Orders,${report.employees.totalOrders}\n\n`;
    
    // Restaurant Breakdown
    csv += `RESTAURANT BREAKDOWN\n`;
    csv += `Restaurant Name,Total Orders,Items Sold,Total Spent,Restaurant Earnings\n`;
    report.restaurants.forEach(restaurant => {
      csv += `${restaurant.restaurantName},${restaurant.totalOrders},${restaurant.itemCount},£${restaurant.totalSpent.toFixed(2)},£${restaurant.restaurantEarnings.toFixed(2)}\n`;
    });
    
    if (report.budget) {
      csv += `\nBUDGET\n`;
      csv += `Budget Allocated,£${report.budget.allocated.toFixed(2)}\n`;
      csv += `Budget Used,£${report.budget.used.toFixed(2)}\n`;
      csv += `Utilization Rate,${report.budget.utilizationRate.toFixed(1)}%\n`;
    }
    
    return csv;
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await statsApi.getMonthlyReport(
        organizationId,
        selectedYear,
        selectedMonth
      );
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  if (!report || !report.orders) {
    return (
      <div className="space-y-6">
        {/* Header with Month Selector - ALWAYS VISIBLE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Monthly Report</h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                disabled
                className="px-4 py-2 bg-slate-300 text-slate-500 rounded-lg cursor-not-allowed flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* No Data Message */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Available</h3>
            <p className="text-slate-500">
              No order data found for {months[selectedMonth - 1]} {selectedYear}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Try selecting a different month or wait for orders to be placed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Monthly Report</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportReport}
              disabled={!report || !report.orders}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                report && report.orders
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Spent"
          value={`£${report.financial.totalSpent.toFixed(2)}`}
          subtitle={`Avg: £${report.financial.averageOrderValue.toFixed(2)}/order`}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Wallet Usage"
          value={`£${report.financial.walletUsage.toFixed(2)}`}
          subtitle={`${((report.financial.walletUsage / report.financial.totalSpent) * 100).toFixed(0)}% of total`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="emerald"
        />
        <MetricCard
          title="Direct Payments"
          value={`£${report.financial.stripeUsage.toFixed(2)}`}
          subtitle={`${((report.financial.stripeUsage / report.financial.totalSpent) * 100).toFixed(0)}% of total`}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Orders Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Orders Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <OrderMetric label="Total" value={report.orders.total} color="slate" />
          <OrderMetric label="Approved" value={report.orders.approved} color="emerald" />
          <OrderMetric label="Delivered" value={report.orders.delivered} color="blue" />
          <OrderMetric label="Rejected" value={report.orders.rejected} color="red" />
          <OrderMetric label="Cancelled" value={report.orders.cancelled} color="amber" />
          <OrderMetric label="Failed" value={report.orders.failed} color="rose" />
        </div>
      </div>

      {/* Employee Participation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Employee Participation</h3>
          <Users className="w-5 h-5 text-slate-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-3xl font-bold text-blue-600">{report.employees.uniqueOrdered}</p>
            <p className="text-sm text-slate-600">Unique employees ordered</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-600">{report.employees.totalOrders}</p>
            <p className="text-sm text-slate-600">Total employee orders</p>
          </div>
        </div>
      </div>

      {/* Restaurant Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Restaurant Breakdown</h3>
          <Store className="w-5 h-5 text-slate-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Restaurant</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Orders</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Items</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total Spent</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Restaurant Earnings</th>
              </tr>
            </thead>
            <tbody>
              {report.restaurants.map((restaurant) => (
                <tr key={restaurant.restaurantId} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-sm text-slate-900">{restaurant.restaurantName}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 text-right">{restaurant.totalOrders}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 text-right">{restaurant.itemCount}</td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900 text-right">
                    £{restaurant.totalSpent.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-emerald-600 text-right">
                    £{restaurant.restaurantEarnings.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {report.restaurants.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No restaurant orders this month
            </div>
          )}
        </div>
      </div>

      {/* Budget Utilization */}
      {report.budget && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Budget Utilization</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-700">Budget Used</span>
                <span className="font-semibold text-slate-900">
                  £{report.budget.used.toFixed(2)} / £{report.budget.allocated.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                  style={{ width: `${Math.min(report.budget.utilizationRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {report.budget.utilizationRate.toFixed(1)}% utilized
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'purple';
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-6 text-white`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-white/80 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-white/70 text-xs">{subtitle}</p>
    </div>
  );
}

interface OrderMetricProps {
  label: string;
  value: number;
  color: 'slate' | 'emerald' | 'blue' | 'red' | 'amber' | 'rose';
}

function OrderMetric({ label, value, color }: OrderMetricProps) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${colors[color]} mb-2`}>
        <span className="text-xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-slate-600">{label}</p>
    </div>
  );
}