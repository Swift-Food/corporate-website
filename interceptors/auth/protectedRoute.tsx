"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./authContext";
import { CorporateUserRole } from "@/types/user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireManager?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireManager = false,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, corporateUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/RestaurantCatalogue");
        return;
      }

      // Check role requirements
      if (
        requireAdmin &&
        corporateUser?.corporateRole !== CorporateUserRole.ADMIN
      ) {
        router.push("/unauthorized");
        return;
      }

      if (
        requireManager &&
        corporateUser?.corporateRole !== CorporateUserRole.MANAGER &&
        corporateUser?.corporateRole !== CorporateUserRole.ADMIN
      ) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    corporateUser,
    requireManager,
    requireAdmin,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
