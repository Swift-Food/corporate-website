"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
// import { Menu } from "@deemlol/next-icons";
import { ShoppingCart, User, Utensils } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../../interceptors/auth/authContext";

import styles from "./navbar.module.css";
import LoginModal from "./LoginModal";

interface NavbarActionProps {
  onLinkClick?: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  isManager: boolean;
}

function NavbarAction({
  onLinkClick,
  onLoginClick,
  onLogout,
  isAuthenticated,
  isManager,
}: NavbarActionProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleManagerClick = () => {
    if (isAuthenticated) {
      // If already on dashboard, go back to home, otherwise go to dashboard
      if (pathname === "/dashboard") {
        router.push("/");
      } else {
        router.push("/dashboard");
      }
      if (onLinkClick) onLinkClick();
    } else {
      onLoginClick();
      if (onLinkClick) onLinkClick();
    }
  };

  // Use the custom hook for cart context
  const { cartItems = [] } = useCart();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if we're on the dashboard page
  const isOnDashboard = pathname === "/dashboard";

  return (
    <div className="flex gap-2 md:gap-4 items-center text-black">
      {isManager && (
        <button
          onClick={handleManagerClick}
          className={`px-2 py-1 md:px-3 md:py-1.5 ${
            isOnDashboard ? "bg-transparent" : "bg-white"
          } rounded flex items-center justify-center transition-all cursor-pointer`}
          aria-label={isOnDashboard ? "Go to Order" : "Manager Dashboard"}
        >
          {isOnDashboard ? (
            <Utensils className="w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <>
              <span className="text-black font-semibold text-xs md:text-sm md:hidden">
                MGR
              </span>
              <span className="text-black font-semibold text-sm hidden md:inline">
                MANAGER
              </span>
            </>
          )}
        </button>
      )}
      <div className="relative">
        <button
          onClick={() => router.push("/checkout")}
          className="w-8 h-8 md:w-10 md:h-10 rounded-full text-black flex items-center justify-center transition-all cursor-pointer"
          aria-label="Cart"
        >
          <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        {cartItemCount > 0 && (
          <span
            className="absolute bottom-0 right-0 bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg border border-white"
            style={{ transform: "translate(40%, 40%)" }}
          >
            {cartItemCount}
          </span>
        )}
      </div>

      <button
        onClick={() => {
          if (isAuthenticated) {
            router.push("/profile");
            if (onLinkClick) onLinkClick();
          } else {
            onLoginClick();
            if (onLinkClick) onLinkClick();
          }
        }}
        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer"
        aria-label="Profile"
      >
        <User className="w-5 h-5 md:w-6 md:h-6 text-black" />
      </button>
      {/* <button
        className="w-10 h-10 rounded-full text-white bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 flex items-center justify-center transition-all hover:shadow-lg"
        aria-label="Profile"
      > */}
    </div>
  );
}

export default function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, isManager } = useAuth();

  // const closeMenu = () => {
  //   setIsMenuOpen(false);
  // };

  // const toggleMenu = () => {
  //   setIsMenuOpen(!isMenuOpen);
  // };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  // Listen for custom event to open login modal
  useEffect(() => {
    const handleOpenLoginModal = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsLoginModalOpen(true);
      // You can use customEvent.detail.message if needed for displaying a message
    };

    window.addEventListener("open-login-modal", handleOpenLoginModal);

    return () => {
      window.removeEventListener("open-login-modal", handleOpenLoginModal);
    };
  }, []);

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 flex flex-col z-50">
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-16 py-4 bg-base-200 gap-2 md:gap-5">
          <Link href={"/"} className="cursor-pointer flex-shrink-0">
            <div className="flex items-center gap-4 cursor-pointer h-full whitespace-nowrap group relative">
              <div className="relative">
                <div
                  className={`font-bold text-primary text-3xl md:text-5xl cursor-pointer ${styles.montFont} leading-none whitespace-nowrap`}
                >
                  <span className={styles.logoTicker}>
                    <span className={styles.logoTrack}>
                      <span>SWIFT FOOD</span>
                      <span className="text-xl md:text-3xl text-center">
                        REAL, LOCAL & FAST
                      </span>
                    </span>
                  </span>
                  <span className="sr-only">
                    Swift Food — Real, Local & Fast
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <div className="whitespace-nowrap flex-shrink-0">
            <NavbarAction
              onLoginClick={openLoginModal}
              onLogout={logout}
              isAuthenticated={isAuthenticated}
              isManager={isManager}
            />
          </div>
          {/* <button
            onClick={toggleMenu}
            className="btn btn-ghost btn-square hover:bg-primary/10 border-0 hidden max-md:flex"
          >
            <Menu size={28} color="var(--color-primary)" />
          </button> */}
        </div>

        {/* Mobile Inline Menu */}
        {/* <div
          className={`md:hidden bg-gradient-to-b from-secondary to-secondary/95 overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-80 py-6" : "max-h-0 py-0"
          }`}
        >
          <div className="px-6">
            <NavbarAction
              onLinkClick={closeMenu}
              onLoginClick={openLoginModal}
              onLogout={logout}
              isAuthenticated={isAuthenticated}
              isManager={isManager}
            />
          </div>
        </div> */}
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
