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
    const initAuth = () => {
      try {
        const token = localStorage.getItem("auth_token");
        const storedUserData = localStorage.getItem("user_data");

        if (!token || !storedUserData) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Parse stored user data
        const userData = JSON.parse(storedUserData);

        // Decode token to check expiration
        const payload: JWTPayload = authApi.decodeToken(token);

        if (!payload || !payload.sub) {
          throw new Error("Invalid token");
        }

        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          throw new Error("Token expired");
        }

        // Restore auth state from localStorage
        setState({
          user: userData.user,
          corporateUser: userData.corporateUser,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error("Auth initialization failed:", error);
        // Clear invalid auth data
        localStorage.removeItem("auth_token");
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

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        // Call login API
        const { access_token } = await authApi.login(email, password);

        // Decode token
        const payload: JWTPayload = authApi.decodeToken(access_token);

        const user: User = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          verified: payload.verified,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Fetch corporate user profile
        const corporateUser = await authApi.getCorporateProfile(email);

        // Save token and user data to localStorage
        localStorage.setItem("auth_token", access_token);
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

        // Redirect to restaurant catalogue after successful login
        router.push("/RestaurantCatalogue");
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setState({
      user: null,
      corporateUser: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push("/RestaurantCatalogue");
  }, [router]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
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
