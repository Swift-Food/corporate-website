import apiClient from "@/api/client";
import {
  LoginDto,
  LoginResponse,
  RegisterCorporateUserDto,
  RegisterCorporateResponse,
  CheckDomainDto,
  CheckDomainResponse,
  VerifyCorporateEmailDto,
  VerifyCorporateEmailResponse,
  CorporateUser,
  UserRole,
} from "../src/types/user";

export const authApi = {
  /**
   * Login for corporate users
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const payload: LoginDto = {
      email,
      password,
    };
    const response = await apiClient.post<LoginResponse>(
      "/auth/corporate-login",
      payload
    );
    return response.data;
  },

  /**
   * Check if email domain is eligible for corporate registration
   */
  checkCorporateDomain: async (email: string): Promise<CheckDomainResponse> => {
    const payload: CheckDomainDto = { email };
    const response = await apiClient.post<CheckDomainResponse>(
      "/auth/check-corporate-domain",
      payload
    );
    return response.data;
  },

  /**
   * Register new corporate user
   */
  registerCorporate: async (
    data: RegisterCorporateUserDto
  ): Promise<RegisterCorporateResponse> => {
    const response = await apiClient.post<RegisterCorporateResponse>(
      "/auth/register-corporate",
      data
    );
    return response.data;
  },

  /**
   * Verify corporate email with code
   */
  verifyCorporateEmail: async (
    email: string,
    code: string
  ): Promise<VerifyCorporateEmailResponse> => {
    const payload: VerifyCorporateEmailDto = { email, code };
    const response = await apiClient.post<VerifyCorporateEmailResponse>(
      "/auth/verify-corporate-email",
      payload
    );
    return response.data;
  },

  /**
   * Request password reset code
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  /**
   * Reset password with code
   */
  resetPassword: async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      "/auth/reset-password",
      { email, code, newPassword }
    );
    return response.data;
  },

  /**
   * Get current user's profile (validates token)
   */
  getProfile: async (): Promise<any> => {
    const response = await apiClient.get<any>("/auth/profile");
    return response.data;
  },

  /**
   * Get current user's corporate profile
   */
  getCorporateProfile: async (email: string): Promise<CorporateUser> => {
    const response = await apiClient.get<CorporateUser>(
      `/corporate-users/email/${email}`
    );
    return response.data;
  },

  /**
   * Decode JWT token (client-side only - for reading payload)
   */
  decodeToken: (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  },

  refreshToken: async (refreshToken: string) => {
    console.log("refresh called")
    const response = await apiClient.post('/auth/refresh-corporate', {
      refresh_token: refreshToken,
    });
    return response.data; // Returns { access_token, refresh_token, expires_in, adminMode }
  },
};
