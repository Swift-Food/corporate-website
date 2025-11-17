"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../auth";
import {
  User,
  CorporateUser,
  AuthState,
  JWTPayload,
  CorporateUserRole,
  UserRole,
} from "../../src/types/user";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  validateProfile: () => Promise<boolean>;
  isManager: boolean;
  isAdmin: boolean;
  organizationId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    corporateUser: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const refreshToken = localStorage.getItem("refresh_token"); // ✅ Add this
        const storedUserData = localStorage.getItem("user_data");

        if (!token || !storedUserData || !refreshToken) { // ✅ Check refresh token
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        const userData = JSON.parse(storedUserData);
        const payload: JWTPayload = authApi.decodeToken(token);

        if (!payload || !payload.sub) {
          throw new Error("Invalid token");
        }

        // Restore auth state
        setState({
          user: userData.user,
          corporateUser: userData.corporateUser,
          token,
          isLoading: false,
          isAuthenticated: true,
        });

        // Validate profile
        try {
          await authApi.getProfile();
        } catch (profileError: any) {
          console.error("Profile validation failed:", profileError);
          // Error will be handled by interceptor (auto-refresh or logout)
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token"); // ✅ Add this
        localStorage.removeItem("user_data");
        setState({
          user: null,
          corporateUser: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initAuth();
  }, []);

  // AuthContext.tsx - Update login function
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        // Get both access and refresh tokens
        const { access_token, refresh_token } = await authApi.login(email, password);

        const payload: JWTPayload = authApi.decodeToken(access_token);

        const user: User = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          verified: payload.verified,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const corporateUser = await authApi.getCorporateProfile(email);

        // Save BOTH tokens
        localStorage.setItem("auth_token", access_token);
        localStorage.setItem("refresh_token", refresh_token); // ✅ Add this

        localStorage.setItem(
          "user_data",
          JSON.stringify({
            user,
            corporateUser,
          })
        );

        setState({
          user,
          corporateUser,
          token: access_token,
          isLoading: false,
          isAuthenticated: true,
        });

        const redirectUrl = localStorage.getItem("redirect_after_login");
        if (redirectUrl) {
          localStorage.removeItem("redirect_after_login");
          router.push(redirectUrl);
        } else {
          router.push("/RestaurantCatalogue");
        }
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [router]
  );

  // AuthContext.tsx - Update logout function
  const logout = useCallback(
    (message?: string) => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token"); // ✅ Add this
      localStorage.removeItem("user_data");
      
      setState({
        user: null,
        corporateUser: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });

      if (message) {
        sessionStorage.setItem("logout_message", message);
      }

      router.push("/RestaurantCatalogue");
    },
    [router]
  );

  const validateProfile = useCallback(async (): Promise<boolean> => {
    try {
      if (!state.token) {
        return false;
      }

      // Validate profile with backend
      await authApi.getProfile();
      return true;
    } catch (error: any) {
      console.error("Profile validation failed:", error);

      // Determine the error message
      let message = "Your session has expired. Please log in again.";

      if (error.response?.status === 403) {
        message = "Your account is not active. Please contact your manager.";
      } else if (error.response?.status === 401) {
        message = "Your session has expired. Please log in again.";
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      logout(message);
      return false;
    }
  }, [state.token, logout]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    validateProfile,
    isManager:
      state.corporateUser?.corporateRole === CorporateUserRole.MANAGER ||
      state.corporateUser?.corporateRole === CorporateUserRole.ADMIN,
    isAdmin: state.corporateUser?.corporateRole === CorporateUserRole.ADMIN,
    organizationId: state.corporateUser?.organizationId || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
