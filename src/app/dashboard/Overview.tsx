// components/dashboard/Overview.tsx
import { CorporateUser, CorporateUserRole } from "@/types/user";
import { StatsOverview } from "../components/StatsOverview";
import { useEffect, useState } from "react";
import { organizationApi } from "@/api/organization";
import OrderStatusStats from "../components/OrderStatusStats";

interface OverviewProps {
  corporateUser: CorporateUser | null;
  user: any;
}

export function Overview({ corporateUser, user }: OverviewProps) {
  const getRoleColor = (role: string) => {
    const colors = {
      ADMIN: "bg-purple-100 text-purple-700",
      MANAGER: "bg-blue-100 text-blue-700",
      EMPLOYEE: "bg-slate-100 text-slate-700",
    };
    return colors[role as keyof typeof colors] || "bg-slate-100 text-slate-700";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "bg-emerald-100 text-emerald-700",
      PENDING: "bg-amber-100 text-amber-700",
      SUSPENDED: "bg-red-100 text-red-700",
      DEACTIVATED: "bg-gray-100 text-gray-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const [orgName, setOrgName] = useState("");
  // Fetch organization name
  useEffect(() => {
    const fetchCutoffTime = async () => {
      if (!corporateUser?.organizationId) return;

      try {
        const organizationData = await organizationApi.fetchOrganizationById(
          corporateUser.organizationId
        );
        const orgName = organizationData.name ?? "";
        setOrgName(orgName);
      } catch (err) {
        console.error("Failed to fetch organization cutoff time: ", err);
      }
    };

    fetchCutoffTime();
  }, [corporateUser?.organizationId]);
  return (
    <div className="space-y-6">
      {/* Budget Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Daily Budget</p>
              <p className="text-3xl font-bold mt-1">
                £{corporateUser?.dailyBudgetRemaining?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-100">of £{corporateUser?.dailyBudgetLimit?.toFixed(2) || '0.00'}</span>
            <span className="text-blue-100">
              {corporateUser?.dailyBudgetLimit 
                ? Math.round((corporateUser.dailyBudgetRemaining / corporateUser.dailyBudgetLimit) * 100) 
                : 0}% remaining
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Monthly Budget</p>
              <p className="text-3xl font-bold mt-1">
                £{corporateUser?.monthlyBudgetRemaining?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-100">of £{corporateUser?.monthlyBudgetLimit?.toFixed(2) || '0.00'}</span>
            <span className="text-emerald-100">
              {corporateUser?.monthlyBudgetLimit 
                ? Math.round((corporateUser.monthlyBudgetRemaining / corporateUser.monthlyBudgetLimit) * 100) 
                : 0}% remaining
            </span>
          </div>
        </div>
      </div> */}
      {/* Personal Info Card */}{" "}
      <h1 className="text-2xl text-base-content font-bold my-4">
        Hi {corporateUser?.fullName}
      </h1>
      <div className="flex flex-col md:flex-row flex-1 flex-between gap-8">
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900 break-words">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">Company</p>
                <p className="font-medium text-slate-900 break-words">
                  {orgName}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">Department</p>
                <p className="font-medium text-slate-900 break-words">
                  {corporateUser?.department || "Not assigned"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">Employee Code</p>
                <p className="font-medium text-slate-900 break-words">
                  {corporateUser?.employeeCode || "Not assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <OrderStatusStats />
      </div>
      {corporateUser?.corporateRole === CorporateUserRole.MANAGER &&
        corporateUser?.organizationId && (
          <StatsOverview organizationId={corporateUser.organizationId} />
        )}
    </div>
  );
}
