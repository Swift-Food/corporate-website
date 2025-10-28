"use client";

import Image from "next/image";
import { useState } from "react";

type AccountType = "manager" | "employee" | null;

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [accountTypeError, setAccountTypeError] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType) {
      setAccountTypeError(true);
      return;
    }
    // Proceed with login
    console.log("Login submitted with account type:", accountType);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType) {
      setAccountTypeError(true);
      return;
    }
    // Proceed with sign up
    console.log("Sign up submitted with account type:", accountType);
  };

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setAccountTypeError(false);
  };

  return (
    <div className="h-screen flex overflow-hidden">
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
                <div>
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
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2.5 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white transition-colors"
                    placeholder="you@example.com"
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
                      className="w-full px-4 py-2.5 pr-12 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white transition-colors"
                      placeholder="••••••••"
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

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-content font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
              </form>

              {/* Sign up link */}
              <p className="text-center mt-4 text-sm text-base-content/70">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setAccountType(null);
                    setAccountTypeError(false);
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
                <h1 className="text-3xl font-bold text-neutral mb-2">
                  Create Account
                </h1>
                <p className="text-base-content/70">Join Swift Food today</p>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleSignUpSubmit} className="space-y-6">
                {/* Account Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral mb-3">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleAccountTypeSelect("manager")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        accountType === "manager"
                          ? "border-primary bg-primary/10"
                          : accountTypeError
                          ? "border-error hover:border-error/70"
                          : "border-base-300 hover:border-primary/50"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">👔</div>
                        <div className="font-semibold text-neutral">
                          Manager
                        </div>
                        <div className="text-xs text-base-content/70 mt-1">
                          Manage orders & team
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAccountTypeSelect("employee")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        accountType === "employee"
                          ? "border-primary bg-primary/10"
                          : accountTypeError
                          ? "border-error hover:border-error/70"
                          : "border-base-300 hover:border-primary/50"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">👤</div>
                        <div className="font-semibold text-neutral">
                          Employee
                        </div>
                        <div className="text-xs text-base-content/70 mt-1">
                          Place personal orders
                        </div>
                      </div>
                    </button>
                  </div>
                  {accountTypeError && (
                    <p className="text-error text-xs mt-1">
                      Please select an account type
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="signup-first-name"
                      className="block text-sm font-medium text-neutral mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="signup-first-name"
                      name="first-name"
                      className="w-full px-4 py-3 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white transition-colors"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="signup-last-name"
                      className="block text-sm font-medium text-neutral mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="signup-last-name"
                      name="last-name"
                      className="w-full px-4 py-3 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white transition-colors"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-sm font-medium text-neutral mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    className="w-full px-4 py-3 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-sm font-medium text-neutral mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="signup-password"
                      name="password"
                      className="w-full px-4 py-3 pr-12 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white transition-colors"
                      placeholder="••••••••"
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

                <button
                  type="submit"
                  className="w-full font-semibold py-3 px-4 rounded-lg transition-all shadow-md bg-primary hover:bg-primary/90 text-primary-content hover:shadow-lg"
                >
                  Create Account
                </button>
              </form>

              {/* Sign in link */}
              <p className="text-center mt-6 text-sm text-base-content/70">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setAccountType(null);
                    setAccountTypeError(false);
                  }}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
