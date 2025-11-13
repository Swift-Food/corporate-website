import { DashboardStats } from "@/types/stats";
import { useEffect, useState } from "react";
import { useAuth } from "../../../interceptors/auth/authContext";
import { statsApi } from "@/api/stats";

// Order Status Item
interface OrderStatusItemProps {
  label: string;
  count: number;
  color: "emerald" | "red" | "blue" | "slate";
}

function OrderStatusItem({ label, count, color }: OrderStatusItemProps) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  };
  const bgColors = {
    blue: "--color-swift-blue",
    emerald: "--color-swift-green",
    red: "--color-swift-pink",
    slate: "--color-swift-yellow",
  };
  return (
    <div className="text-center">
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2`}
        style={{ backgroundColor: `var(${bgColors[color]})` }}
      >
        <span className="text-2xl font-bold">{count}</span>
      </div>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
export default function OrderStatusStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { corporateUser } = useAuth();

  const formatNumber = (num: number): string => {
    return num.toLocaleString("en-GB");
  };

  useEffect(() => {
    loadStats();
  }, [corporateUser?.organizationId]);

  const loadStats = async () => {
    try {
      if (!corporateUser || !corporateUser.organizationId) return;
      setLoading(true);
      const data = await statsApi.getDashboardStats(
        corporateUser?.organizationId
      );
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return (
      <div className="text-center py-12 text-slate-500">
        Failed to load statistics
      </div>
    );
  }

  const { currentMonth } = stats;

  return (
    <div className="flex-1">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Order Status</h3>
      <div className="grid md:flex grid-cols-2 justify-between gap-8">
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
  );
}
