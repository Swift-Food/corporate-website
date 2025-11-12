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
    {
      month: 10,
      year: 2024,
      totalSpent: 3200,
      totalOrders: 32,
      averageOrderValue: 100,
    },
    {
      month: 11,
      year: 2024,
      totalSpent: 4100,
      totalOrders: 41,
      averageOrderValue: 100,
    },
    {
      month: 12,
      year: 2024,
      totalSpent: 5500,
      totalOrders: 55,
      averageOrderValue: 100,
    },
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
  const allTrends = trends.length > 1 ? trends : testData;

  // Sort trends by date
  const sortedTrends = useMemo(() => {
    return [...allTrends].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [allTrends]);

  // Get available years and months
  const availableYears = useMemo(() => {
    const years = new Set(sortedTrends.map((t) => t.year));
    return Array.from(years).sort((a, b) => a - b);
  }, [sortedTrends]);

  // Initialize with last available data or default
  const lastTrend =
    sortedTrends[sortedTrends.length - 1] || testData[testData.length - 1];
  const defaultStartIndex = Math.max(0, sortedTrends.length - 6);
  const defaultStart = sortedTrends[defaultStartIndex] || sortedTrends[0];

  const [startMonth, setStartMonth] = useState(defaultStart?.month || 1);
  const [startYear, setStartYear] = useState(defaultStart?.year || 2025);
  const [endMonth, setEndMonth] = useState(lastTrend?.month || 6);
  const [endYear, setEndYear] = useState(lastTrend?.year || 2025);

  // Get available months for a given year
  const getAvailableMonthsForYear = (year: number) => {
    return sortedTrends
      .filter((t) => t.year === year)
      .map((t) => t.month)
      .sort((a, b) => a - b);
  };

  // Filter trends based on selected range (max 12 months)
  const displayTrends = useMemo(() => {
    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);

    // Filter trends within range
    let filtered = sortedTrends.filter((t) => {
      const trendDate = new Date(t.year, t.month - 1);
      return trendDate >= startDate && trendDate <= endDate;
    });

    // Limit to 12 months
    if (filtered.length > 12) {
      filtered = filtered.slice(0, 12);
    }

    return filtered;
  }, [sortedTrends, startMonth, startYear, endMonth, endYear]);

  // Check if multiple years are present in display
  const hasMultipleYears = useMemo(() => {
    const years = new Set(displayTrends.map((t) => t.year));
    return years.size > 1;
  }, [displayTrends]);

  const maxSpent = displayTrends.length > 0 ? Math.max(...displayTrends.map((t) => t.totalSpent)) : 0;

  // Month names
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get available months for start based on selected year
  const availableStartMonths = getAvailableMonthsForYear(startYear);
  const availableEndMonths = getAvailableMonthsForYear(endYear);

  // Check if a month/year combination is valid for end date
  const isValidEndDate = (month: number, year: number) => {
    if (year < startYear) return false;
    if (year === startYear && month < startMonth) return false;
    return true;
  };

  // Check if a month/year combination is valid for start date
  const isValidStartDate = (month: number, year: number) => {
    if (year > endYear) return false;
    if (year === endYear && month > endMonth) return false;
    return true;
  };

  return (
    <div className="bg-base-200 rounded-xl p-6 h-full flex flex-col min-h-[480px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Spending Trends
        </h3>

        {/* Date Range Selectors */}
        <div className="flex items-center gap-2 text-sm">
          {/* Start Month */}
          <select
            value={startMonth}
            onChange={(e) => {
              const newMonth = Number(e.target.value);
              setStartMonth(newMonth);
              // Auto-adjust end date if it becomes invalid
              if (!isValidEndDate(endMonth, endYear)) {
                setEndMonth(newMonth);
                setEndYear(startYear);
              }
            }}
            className="px-2 py-1 rounded border border-slate-300 text-slate-700 bg-white"
          >
            {availableStartMonths.map((month) => (
              <option
                key={`start-month-${month}`}
                value={month}
                disabled={!isValidStartDate(month, startYear)}
              >
                {monthNames[month - 1]}
              </option>
            ))}
          </select>

          {/* Start Year */}
          <select
            value={startYear}
            onChange={(e) => {
              const newYear = Number(e.target.value);
              setStartYear(newYear);
              // Update month to first available for new year that's <= end date
              const months = getAvailableMonthsForYear(newYear);
              const validMonths = months.filter((m) =>
                isValidStartDate(m, newYear)
              );
              if (validMonths.length > 0 && !validMonths.includes(startMonth)) {
                setStartMonth(validMonths[0]);
              }
              // Auto-adjust end date if it becomes invalid
              if (!isValidEndDate(endMonth, endYear)) {
                setEndMonth(validMonths[0] || 1);
                setEndYear(newYear);
              }
            }}
            className="px-2 py-1 rounded border border-slate-300 text-slate-700 bg-white"
          >
            {availableYears.map((year) => (
              <option
                key={`start-year-${year}`}
                value={year}
                disabled={year > endYear}
              >
                {year}
              </option>
            ))}
          </select>

          <span className="text-slate-600">to</span>

          {/* End Month */}
          <select
            value={endMonth}
            onChange={(e) => {
              const newMonth = Number(e.target.value);
              setEndMonth(newMonth);
              // Auto-adjust start date if it becomes invalid
              if (!isValidStartDate(startMonth, startYear)) {
                setStartMonth(newMonth);
                setStartYear(endYear);
              }
            }}
            className="px-2 py-1 rounded border border-slate-300 text-slate-700 bg-white"
          >
            {availableEndMonths.map((month) => (
              <option
                key={`end-month-${month}`}
                value={month}
                disabled={!isValidEndDate(month, endYear)}
              >
                {monthNames[month - 1]}
              </option>
            ))}
          </select>

          {/* End Year */}
          <select
            value={endYear}
            onChange={(e) => {
              const newYear = Number(e.target.value);
              setEndYear(newYear);
              // Update month to first available for new year that's >= start date
              const months = getAvailableMonthsForYear(newYear);
              const validMonths = months.filter((m) =>
                isValidEndDate(m, newYear)
              );
              if (validMonths.length > 0 && !validMonths.includes(endMonth)) {
                setEndMonth(validMonths[0]);
              }
              // Auto-adjust start date if it becomes invalid
              if (!isValidStartDate(startMonth, startYear)) {
                setStartMonth(validMonths[0] || 1);
                setStartYear(newYear);
              }
            }}
            className="px-2 py-1 rounded border border-slate-300 text-slate-700 bg-white"
          >
            {availableYears.map((year) => (
              <option
                key={`end-year-${year}`}
                value={year}
                disabled={year < startYear}
              >
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {displayTrends.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-slate-700 mb-2">
              Invalid date range
            </p>
            <p className="text-sm text-slate-500">
              No data available for the selected period
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
