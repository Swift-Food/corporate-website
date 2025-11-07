import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";


// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Only auto-logout on 401 if it's an authentication endpoint
    // This prevents premature logout on temporary network issues
    if (error.response?.status === 401) {
      const url = error.config?.url || "";

      // Only clear auth and redirect for auth-related endpoints
      if (url.includes("/auth/") || url.includes("/corporate-users/email/")) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");

        // Only redirect if not already on login page
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/new-login")
        ) {
          window.location.href = "/new-login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
