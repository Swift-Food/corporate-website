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

function NavbarAction({ onLinkClick, onLoginClick, onLogout, isAuthenticated }: NavbarActionProps) {
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
        className="btn btn-md bg-white hover:bg-gray-50 rounded-md text-black border-1 border-black font-semibold text-base px-6"
      >
        MANAGER
      </button>

      {isAuthenticated ? (
        <>
          {/* Profile Icon */}
          <button
            className="btn btn-circle bg-white hover:bg-gray-50 border-2 border-black w-12 h-12 min-h-0 p-0"
            aria-label="Profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-7 h-7 text-black"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-md bg-primary hover:bg-primary/90 rounded-md text-white border-0 font-semibold text-base px-6"
          >
            LOGOUT
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
  const { isAuthenticated, logout } = useAuth();

  const closeDrawer = () => {
    const drawerCheckbox = document.getElementById(
      "my-drawer"
    ) as HTMLInputElement;
    if (drawerCheckbox) {
      drawerCheckbox.checked = false;
    }
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
        <div className="flex items-center justify-between px-16 py-4 bg-secondary gap-5 flex-nowrap">
          <div className="invisible max-xl:hidden whitespace-nowrap">
            <NavbarAction onLoginClick={openLoginModal} onLogout={logout} isAuthenticated={isAuthenticated} />
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
                  <span className="sr-only">Swift Food — Real, Local & Fast</span>
                </div>
              </div>
            </div>
          </Link>
          <div className="visible max-md:hidden whitespace-nowrap">
            <NavbarAction onLoginClick={openLoginModal} onLogout={logout} isAuthenticated={isAuthenticated} />
          </div>
          <div className="drawer w-fit hidden max-md:block">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <label
                className="btn btn-ghost btn-square drawer-button hover:bg-primary/10 border-0"
                htmlFor="my-drawer"
              >
                <Menu size={28} color="var(--color-primary)" />
              </label>
            </div>
            <div className="drawer-side">
              <label
                htmlFor="my-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <div className="h-full bg-white w-[80%]">
                <div className="px-3 mt-4">{/* <SearchBar /> */}</div>
                <NavbarAction onLinkClick={closeDrawer} onLoginClick={openLoginModal} onLogout={logout} isAuthenticated={isAuthenticated} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
