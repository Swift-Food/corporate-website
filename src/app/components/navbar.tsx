"use client";

import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { Menu } from "@deemlol/next-icons";
import { ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../interceptors/auth/authContext";

import styles from "./navbar.module.css";
import LoginModal from "./LoginModal";

interface NavbarActionProps {
  onLinkClick?: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
}

function NavbarAction({
  onLinkClick,
  onLoginClick,
  onLogout,
  isAuthenticated,
}: NavbarActionProps) {
  const router = useRouter();

  const handleManagerClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
      if (onLinkClick) onLinkClick();
    } else {
      onLoginClick();
      if (onLinkClick) onLinkClick();
    }
  };

  const handleLogout = () => {
    onLogout();
    if (onLinkClick) onLinkClick();
  };

  // Use the custom hook for cart context
  const { cartItems = [] } = useCart();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex gap-4 items-center max-sm:flex-col-reverse max-sm:mt-8 text-black">
      <button
        onClick={handleManagerClick}
        className="btn btn-md bg-white hover:bg-gray-50 rounded-md text-black border-black font-semibold text-base px-6"
      >
        MANAGER
      </button>
      <div className="relative">
        <button
          onClick={() => router.push("/checkout")}
          className="w-10 h-10 rounded-full text-black flex items-center justify-center transition-all cursor-pointer"
          aria-label="Cart"
        >
          <ShoppingCart className="w-6 h-6" />
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
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer"
        aria-label="Profile"
      >
        <User className="w-6 h-6 text-black" />
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 flex flex-col z-50">
        <div className="flex items-center justify-between px-16 py-4 max-lg:px-4 bg-base-200 gap-5 flex-nowrap">
          <div className="invisible max-xl:hidden whitespace-nowrap">
            <NavbarAction
              onLoginClick={openLoginModal}
              onLogout={logout}
              isAuthenticated={isAuthenticated}
            />
          </div>
          <Link href={"/"} className="cursor-pointer">
            <div className="flex items-center gap-4 cursor-pointer h-full whitespace-nowrap group relative">
              <div className="relative">
                <div
                  className={`font-bold text-primary text-3xl md:text-5xl cursor-pointer ${styles.montFont} leading-none whitespace-nowrap`}
                >
                  <span className={styles.logoTicker}>
                    <span className={styles.logoTrack}>
                      <span>SWIFT FOOD</span>
                      <span className="text-3xl text-center">
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
          <div className="visible max-md:hidden whitespace-nowrap">
            <NavbarAction
              onLoginClick={openLoginModal}
              onLogout={logout}
              isAuthenticated={isAuthenticated}
            />
          </div>
          <button
            onClick={toggleMenu}
            className="btn btn-ghost btn-square hover:bg-primary/10 border-0 hidden max-md:flex"
          >
            <Menu size={28} color="var(--color-primary)" />
          </button>
        </div>

        {/* Mobile Inline Menu */}
        <div
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
            />
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
