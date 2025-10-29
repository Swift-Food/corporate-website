"use client";

import Image from "next/image";
import LoginForm from "@/app/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Image - Top on mobile, Left on desktop */}
      <div className="w-full lg:w-1/2 relative bg-base-200 h-64 lg:h-screen">
        <Image
          src="/home page illustration.jpg"
          alt="Swift Food Illustration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Forms Container - Bottom on mobile, Right on desktop */}
      <div className="w-full lg:w-1/2 bg-base-100 relative overflow-hidden flex-1">
        <div className="h-full overflow-y-auto overflow-x-hidden px-8 py-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
