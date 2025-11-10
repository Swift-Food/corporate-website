"use client";

import Image from "next/image";
import LoginForm from "./LoginForm";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Main Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col lg:flex-row relative max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image - Top on mobile, Left on desktop */}
        <div className="w-full lg:w-1/2 relative bg-base-200 h-48 lg:h-[600px] flex-shrink-0">
          <Image
            src="/home page illustration.jpg"
            alt="Swift Food Illustration"
            fill
            className="object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
            priority
          />
        </div>

        {/* Forms Container - Bottom on mobile, Right on desktop */}
        <div className="w-full lg:w-1/2 bg-base-100 relative lg:h-[600px] flex-shrink-0">
          <div className="h-full overflow-y-auto overflow-x-hidden px-8 py-8">
            <LoginForm onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}
