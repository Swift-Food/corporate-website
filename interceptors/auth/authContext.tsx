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
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        if (!token) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Decode token to get user info
        const payload: JWTPayload = authApi.decodeToken(token);

        if (!payload || !payload.sub) {
          throw new Error("Invalid token");
        }

        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          throw new Error("Token expired");
        }

        // Verify role is corporate employee
        if (payload.role !== UserRole.CORPORATE_EMPLOYEE) {
          throw new Error("Invalid user role");
        }

        const user: User = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          verified: payload.verified,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Fetch corporate user profile
        const corporateUser = await authApi.getCorporateProfile(payload.email);

        setState({
          user,
          corporateUser,
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

        // Save token
        localStorage.setItem("auth_token", access_token);

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

        setState({
          user,
          corporateUser,
          token: access_token,
          isLoading: false,
          isAuthenticated: true,
        });

        // Redirect based on role
        if (
          corporateUser.corporateRole === CorporateUserRole.MANAGER ||
          corporateUser.corporateRole === CorporateUserRole.ADMIN
        ) {
          router.push("/dashboard");
        } else {
          // Regular employees can't access manager dashboard
          throw new Error("You do not have manager access");
        }
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
    router.push("/login");
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
