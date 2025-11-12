// components/SpendingTrendsChart.tsx
"use client";

import { SpendingTrend } from "@/types/stats";
import { useState, useMemo } from "react";

interface SpendingTrendsChartProps {
  trends: SpendingTrend[];
}

export function SpendingTrendsChart({ trends }: SpendingTrendsChartProps) {
  // Test data - remove this when you have real data
  const testData: SpendingTrend[] = [
    { month: 10, year: 2024, totalSpent: 3200, totalOrders: 32, averageOrderValue: 100 },
    { month: 11, year: 2024, totalSpent: 4100, totalOrders: 41, averageOrderValue: 100 },
    { month: 12, year: 2024, totalSpent: 5500, totalOrders: 55, averageOrderValue: 100 },
    { month: 1, year: 2025, totalSpent: 4500, totalOrders: 45, averageOrderValue: 100 },
    { month: 2, year: 2025, totalSpent: 6200, totalOrders: 62, averageOrderValue: 100 },
    { month: 3, year: 2025, totalSpent: 3800, totalOrders: 38, averageOrderValue: 100 },
    { month: 4, year: 2025, totalSpent: 5500, totalOrders: 55, averageOrderValue: 100 },
    { month: 5, year: 2025, totalSpent: 4100, totalOrders: 41, averageOrderValue: 100 },
    { month: 6, year: 2025, totalSpent: 7200, totalOrders: 72, averageOrderValue: 100 },
  ];

  // Use test data if no real data is available
  const allTrends = trends.length > 1 ? trends : testData;

  // Sort trends by date
  const sortedTrends = useMemo(() => {
    return [...allTrends].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [allTrends]);

  // Get available date range
  const availableDates = useMemo(() => {
    return sortedTrends.map(t => ({ month: t.month, year: t.year }));
  }, [sortedTrends]);

  // Initialize with last 6 months or all available data
  const [startIndex, setStartIndex] = useState(() =>
    Math.max(0, availableDates.length - 6)
  );
  const [endIndex, setEndIndex] = useState(() => availableDates.length - 1);

  // Filter trends based on selected range (max 12 months)
  const displayTrends = useMemo(() => {
    const maxRange = 12;
    let actualEndIndex = endIndex;

    if (endIndex - startIndex >= maxRange) {
      actualEndIndex = startIndex + maxRange - 1;
    }

    return sortedTrends.slice(startIndex, actualEndIndex + 1);
  }, [sortedTrends, startIndex, endIndex]);

  // Check if multiple years are present in display
  const hasMultipleYears = useMemo(() => {
    const years = new Set(displayTrends.map(t => t.year));
    return years.size > 1;
  }, [displayTrends]);

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

  // Format month/year for display
  const formatMonthYear = (month: number, year: number) => {
    return new Date(year, month - 1).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-base-200 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Spending Trends
        </h3>

        {/* Date Range Selectors */}
        <div className="flex items-center gap-2 text-sm">
          <select
            value={startIndex}
            onChange={(e) => setStartIndex(Number(e.target.value))}
            className="px-2 py-1 rounded border border-slate-300 text-slate-700 bg-white"
          >
            {availableDates.map((date, idx) => (
              <option key={`start-${idx}`} value={idx}>
                {formatMonthYear(date.month, date.year)}
              </option>
            ))}
          </select>
          <span className="text-slate-600">to</span>
          <select
            value={endIndex}
            onChange={(e) => setEndIndex(Number(e.target.value))}
            className="px-2 py-1 rounded border border-slate-300 text-slate-700 bg-white"
          >
            {availableDates.map((date, idx) => (
              <option
                key={`end-${idx}`}
                value={idx}
                disabled={idx < startIndex}
              >
                {formatMonthYear(date.month, date.year)}
              </option>
            ))}
          </select>
        </div>
      </div>

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
              <div className="flex flex-col items-center min-h-[2.5rem]">
                <span className="text-xs font-medium text-slate-600">
                  {monthName}
                </span>
                {/* Year label - show for first column or Jan or first month of a new year */}
                {hasMultipleYears &&
                  (index === 0 ||
                    trend.month === 1 ||
                    (index > 0 &&
                      displayTrends[index - 1].year !== trend.year)) ? (
                    <span className="text-xs font-semibold text-slate-800 mt-1">
                      {trend.year}
                    </span>
                  ) : (
                    hasMultipleYears && (
                      <span className="text-xs mt-1 invisible">0000</span>
                    )
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
