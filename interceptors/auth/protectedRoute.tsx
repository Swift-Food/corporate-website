"use client";

import { useEffect, useRef } from "react";
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
  const hasShownAlert = useRef(false);

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
        if (!hasShownAlert.current) {
          hasShownAlert.current = true;
          alert("You don't have authorization to access this page. Admin access required.");
          router.push("/RestaurantCatalogue");
        }
        return;
      }

      if (
        requireManager &&
        corporateUser?.corporateRole !== CorporateUserRole.MANAGER &&
        corporateUser?.corporateRole !== CorporateUserRole.ADMIN
      ) {
        if (!hasShownAlert.current) {
          hasShownAlert.current = true;
          alert("You don't have authorization to access this page. Manager access required.");
          router.push("/RestaurantCatalogue");
        }
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

  // Check authorization before rendering children
  if (
    requireAdmin &&
    corporateUser?.corporateRole !== CorporateUserRole.ADMIN
  ) {
    return null;
  }

  if (
    requireManager &&
    corporateUser?.corporateRole !== CorporateUserRole.MANAGER &&
    corporateUser?.corporateRole !== CorporateUserRole.ADMIN
  ) {
    return null;
  }

  return <>{children}</>;
}
