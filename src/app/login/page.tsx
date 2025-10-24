"use client";

import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-base-200">
        <Image
          src="/home page illustration.jpg"
          alt="Swift Food Illustration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-base-100 px-8 py-12">
        <div className="w-full max-w-md">
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
              Welcome Back
            </h1>
            <p className="text-base-content/70">
              Sign in to your Swift Food account
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6">
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
                className="w-full px-4 py-3 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white transition-colors"
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
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-4 py-3 border-2 border-base-300 rounded-lg focus:outline-none focus:border-primary bg-white transition-colors"
                placeholder="••••••••"
                required
              />
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-content font-semibold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Sign In
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center mt-6 text-sm text-base-content/70">
            Don't have an account?{" "}
            <a href="#" className="text-primary hover:text-primary/80 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
