"use client";

import React, { useState } from "react";
import { Menu } from "@deemlol/next-icons";
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

  return (
    <div className="flex gap-4 items-center max-sm:flex-col-reverse max-sm:mt-8 text-black">
      <button
        onClick={handleManagerClick}
        className="btn btn-md bg-white hover:bg-gray-50 rounded-md text-black border-black font-semibold text-base px-6"
      >
        MANAGER
      </button>

      {isAuthenticated ? (
        <>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-md bg-primary hover:bg-primary/90 rounded-md text-white border-0 font-semibold text-base px-6"
          >
            LOGOUT
          </button>

          {/* Profile Icon */}
          <button
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 flex items-center justify-center transition-all hover:shadow-lg"
            aria-label="Profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            onLoginClick();
            if (onLinkClick) onLinkClick();
          }}
          className="btn btn-md bg-primary hover:bg-primary/90 rounded-md text-white border-0 font-semibold text-base px-6"
        >
          LOGIN
        </button>
      )}
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
      <nav className="sticky top-0 left-0 right-0 flex flex-col z-50 relative">
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
