// components/SpendingTrendsChart.tsx
"use client";

import { SpendingTrend } from "@/types/stats";

interface SpendingTrendsChartProps {
  trends: SpendingTrend[];
}

export function SpendingTrendsChart({ trends }: SpendingTrendsChartProps) {
  // Test data - remove this when you have real data
  const testData: SpendingTrend[] = [
    {
      month: 1,
      year: 2025,
      totalSpent: 4500,
      totalOrders: 45,
      averageOrderValue: 100,
    },
    {
      month: 2,
      year: 2025,
      totalSpent: 6200,
      totalOrders: 62,
      averageOrderValue: 100,
    },
    {
      month: 3,
      year: 2025,
      totalSpent: 3800,
      totalOrders: 38,
      averageOrderValue: 100,
    },
    {
      month: 4,
      year: 2025,
      totalSpent: 5500,
      totalOrders: 55,
      averageOrderValue: 100,
    },
    {
      month: 5,
      year: 2025,
      totalSpent: 4100,
      totalOrders: 41,
      averageOrderValue: 100,
    },
    {
      month: 6,
      year: 2025,
      totalSpent: 7200,
      totalOrders: 72,
      averageOrderValue: 100,
    },
  ];

  // Use test data if no real data is available
  const displayTrends = trends.length > 1 ? trends : testData;

  if (displayTrends.length === 0) {
    return (
      <div className="bg-base-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Spending Trends
        </h3>
        <p className="text-sm text-slate-500 text-center py-8">
          No spending data available
        </p>
      </div>
    );
  }

  const maxSpent = Math.max(...displayTrends.map((t) => t.totalSpent));

  return (
    <div className="bg-base-200 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        Spending Trends
      </h3>

      <div className="flex items-end justify-between gap-2 flex-1 w-full">
        {displayTrends.map((trend, index) => {
          const percentage =
            maxSpent > 0 ? (trend.totalSpent / maxSpent) * 100 : 0;
          const monthName = new Date(
            trend.year,
            trend.month - 1
          ).toLocaleString("default", {
            month: "short",
          });

          return (
            <div
              key={`${trend.year}-${trend.month}`}
              className="flex-1 flex flex-col items-center gap-2 group h-full"
            >
              {/* Bar */}
              <div className="relative w-full flex flex-col justify-end h-full">
                <div
                  className="w-full bg-[#ffb3cc] rounded-t-md hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${percentage}%`,
                    transformOrigin: "bottom",
                    animation: `growBar 1s ease-out ${index * 0.1}s forwards`,
                  }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    £{trend.totalSpent.toFixed(2)}
                    <br />
                    {trend.totalOrders} orders
                  </div>
                </div>
              </div>

              {/* Month label */}
              <span className="text-xs font-medium text-slate-600">
                {monthName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
