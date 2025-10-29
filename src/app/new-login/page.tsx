"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "../../../interceptors/auth/authContext";
import RegisterForm from "@/components/RegisterForm";

export default function LoginPage() {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login(loginData.email, loginData.password);
      // The login function in authContext will handle the redirect based on user's actual role
    } catch (err: any) {
      console.error("Login error:", err);

      if (err.response?.data?.needsVerification) {
        setNeedsVerification(true);
        setError(
          "Please verify your email. A verification code has been sent."
        );
      } else if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 403) {
        setError(err.response?.data?.message || "Your account is not active");
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { authApi } = await import("../../../interceptors/auth");
      await authApi.verifyCorporateEmail(loginData.email, verificationCode);

      setNeedsVerification(false);
      setVerificationCode("");
      setError("");

      // Try to log in again after verification
      await login(loginData.email, loginData.password);
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Verification Modal */}
      {needsVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-neutral mb-4">
              Verify Your Email
            </h2>
            <p className="text-sm text-base-content/70 mb-6">
              We sent a 6-digit code to{" "}
              {loginData.email}
            </p>
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white text-center text-2xl tracking-widest"
                placeholder="000000"
                disabled={isLoading}
              />
              {error && (
                <div className="bg-error/10 border border-error/20 text-error text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-content font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNeedsVerification(false);
                  setError("");
                }}
                className="w-full text-sm text-base-content/70 hover:text-base-content"
              >
                Back to login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-base-200 h-screen">
        <Image
          src="/home page illustration.jpg"
          alt="Swift Food Illustration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right side - Forms Container */}
      <div className="w-full lg:w-1/2 bg-base-100 relative overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-hidden px-8 py-8">
          <div className="w-full max-w-md mx-auto relative min-h-full flex items-center">
            {/* Login Form */}
            <div
              className={`w-full transition-all duration-500 ease-in-out ${
                isSignUp
                  ? "opacity-0 -translate-x-full absolute"
                  : "opacity-100 translate-x-0"
              }`}
            >
              {/* Logo/Brand */}
              <div className="text-center mb-6">
                <Image
                  src="/favicon.png"
                  alt="Swift Food Logo"
                  width={60}
                  height={60}
                  className="mx-auto mb-3"
                />
                <h1 className="text-2xl font-bold text-neutral mb-1">
                  Welcome Back
                </h1>
                <p className="text-sm text-base-content/70">
                  Sign in to your corporate Swift Food account
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Account Type Selection */}
                {/* <div>
                  <label className="block text-sm font-medium text-neutral mb-2">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleAccountTypeSelect("manager")}
                      className={`px-4 py-2.5 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        accountType === "manager"
                          ? "border-primary bg-primary/10"
                          : accountTypeError
                          ? "border-error hover:border-error/70"
                          : "border-base-300 hover:border-primary/50"
                      }`}
                    >
                      <span className="text-lg">👔</span>
                      <span className="font-medium text-sm">Manager</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAccountTypeSelect("employee")}
                      className={`px-4 py-2.5 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        accountType === "employee"
                          ? "border-primary bg-primary/10"
                          : accountTypeError
                          ? "border-error hover:border-error/70"
                          : "border-base-300 hover:border-primary/50"
                      }`}
                    >
                      <span className="text-lg">👤</span>
                      <span className="font-medium text-sm">Employee</span>
                    </button>
                  </div>
                  {accountTypeError && (
                    <p className="text-error text-xs mt-1">
                      Please select an account type
                    </p>
                  )}
                </div> */}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral mb-2"
                  >
                    Corporate Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="w-full px-4 py-2.5 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white transition-colors"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="w-full px-4 py-2.5 pr-12 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white transition-colors"
                      placeholder="••••••••"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary border-base-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-base-content/70">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Forgot password?
                  </a>
                </div>

                {error && !needsVerification && (
                  <div className="bg-error/10 border border-error/20 text-error text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-content font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Sign up link */}
              <p className="text-center mt-4 text-sm text-base-content/70">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError("");
                  }}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* Sign Up Form */}
            <div
              className={`w-full transition-all duration-500 ease-in-out ${
                isSignUp
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-full absolute"
              }`}
            >
              {/* Logo/Brand */}
              <div className="text-center mb-8">
                <Image
                  src="/favicon.png"
                  alt="Swift Food Logo"
                  width={80}
                  height={80}
                  className="mx-auto mb-4"
                />
              </div>

              {/* Register Form Component */}
              <RegisterForm
                onSuccess={() => {
                  setIsSignUp(false);
                  alert("Registration successful! Please sign in.");
                }}
                onSwitchToLogin={() => {
                  setIsSignUp(false);
                  setError("");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
