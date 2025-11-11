"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../../context/CartContext";
// import { Menu } from "@deemlol/next-icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../../interceptors/auth/authContext";

import styles from "./navbar.module.css";
import LoginModal from "./LoginModal";
import CartHoverPreview from "@/components/cart/CartHoverPreview";
import MenuItemModal from "@/components/catalogue/MenuItemModal";

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
  const [showCartPreview, setShowCartPreview] = useState(false);
  const cartCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use the custom hook for cart context
  const {
    cartItems = [],
    removeFromCart,
    updateCartQuantity,
    addToCart,
  } = useCart();

  const handleCartMouseEnter = () => {
    // Clear any existing timeout
    if (cartCloseTimeoutRef.current) {
      clearTimeout(cartCloseTimeoutRef.current);
      cartCloseTimeoutRef.current = null;
    }
    setShowCartPreview(true);
  };

  const handleCartMouseLeave = () => {
    // Set a delay before closing
    cartCloseTimeoutRef.current = setTimeout(() => {
      setShowCartPreview(false);
    }, 300); // 300ms delay
  };

  const handleCartClick = () => {
    // On mobile, toggle cart preview
    // On desktop, route to checkout
    if (window.innerWidth < 768) {
      setShowCartPreview(!showCartPreview);
    } else {
      router.push("/checkout");
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (cartCloseTimeoutRef.current) {
        clearTimeout(cartCloseTimeoutRef.current);
      }
    };
  }, []);

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

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if we're on the dashboard page
  const isOnDashboard = pathname === "/dashboard";

  return (
    <div className="flex gap-2 md:gap-4 items-center text-black">
      {isManager && (
        <div className="relative group">
          <button
            onClick={handleManagerClick}
            className={`px-2 py-1 md:px-3 md:py-1.5 bg-transparent ${
              isOnDashboard ? "text-black" : "hover:bg-primary hover:text-white"
            } rounded-2xl flex items-center justify-center transition-all cursor-pointer`}
            aria-label={isOnDashboard ? "Go to Order" : "Manager Dashboard"}
          >
            {isOnDashboard ? (
              <Image
                src="/icons/navbar/market.svg"
                alt="Market"
                width={24}
                height={24}
                className="w-5 h-5 md:w-6 md:h-6"
              />
            ) : (
              <>
                <span className="font-semibold text-xs md:text-sm md:hidden">
                  MGR
                </span>
                <span className="font-semibold text-sm hidden md:inline">
                  MANAGER
                </span>
              </>
            )}
          </button>
          {/* Tooltip */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 bg-neutral text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg z-50">
            {isOnDashboard ? "Restaurant Catalogue" : "Manager Dashboard"}
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-neutral rotate-45"></div>
          </div>
        </div>
      )}
      <div
        className="relative"
        onMouseEnter={handleCartMouseEnter}
        onMouseLeave={handleCartMouseLeave}
      >
        <button
          onClick={handleCartClick}
          className="w-8 h-8 md:w-10 md:h-10 rounded-full text-black flex items-center justify-center transition-all cursor-pointer"
          aria-label="Cart"
        >
          <Image
            src="/icons/navbar/co-cart.svg"
            alt="Cart"
            width={24}
            height={24}
            className="w-5 h-5 md:w-6 md:h-6"
          />
        </button>
        {cartItemCount > 0 && (
          <span
            className="absolute bottom-0 right-0 bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg border border-white"
            style={{ transform: "translate(40%, 40%)" }}
          >
            {cartItemCount}
          </span>
        )}

        {/* Cart Preview on Hover */}
        {showCartPreview && (
          <CartHoverPreview
            onMouseEnter={handleCartMouseEnter}
            onMouseLeave={handleCartMouseLeave}
            onEditItem={(index) => {
              setEditingIndex(index);
              setIsModalOpen(true);
            }}
            onClose={() => setShowCartPreview(false)}
          />
        )}
      </div>

      {/* Edit Modal */}
      {editingIndex !== null && cartItems[editingIndex] && (
        <MenuItemModal
          item={cartItems[editingIndex].item}
          isOpen={isModalOpen}
          quantity={cartItems[editingIndex].quantity}
          cartIndex={editingIndex}
          existingSelectedAddons={cartItems[editingIndex].selectedAddons}
          onClose={() => {
            setIsModalOpen(false);
            setEditingIndex(null);
          }}
          onAddItem={(item, quantity, selectedAddons) => {
            // Remove the old item first, then add the updated one
            removeFromCart(editingIndex);
            addToCart(item, quantity, selectedAddons);
            setIsModalOpen(false);
            setEditingIndex(null);
          }}
          onUpdateQuantity={(itemId, cartIndex, newQuantity) => {
            updateCartQuantity(cartIndex, newQuantity);
            if (newQuantity === 0) {
              setIsModalOpen(false);
              setEditingIndex(null);
            }
          }}
          onRemoveItem={(itemId, cartIndex) => {
            removeFromCart(cartIndex);
            setIsModalOpen(false);
            setEditingIndex(null);
          }}
          isEditMode={true}
        />
      )}

      <div className="relative group">
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
          <Image
            src="/icons/navbar/co-profile.svg"
            alt="Profile"
            width={24}
            height={24}
            className="w-5 h-5 md:w-6 md:h-6"
          />
        </button>
        {/* Tooltip */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 bg-neutral text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg z-50">
          {isAuthenticated ? "My Profile" : "Login"}
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-neutral rotate-45"></div>
        </div>
      </div>
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
  const pathname = usePathname();

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

      // Only open login modal if NOT in RestaurantCatalogue pages
      // Login modal should only open automatically on checkout page when session expires
      if (!pathname.includes("/RestaurantCatalogue")) {
        setIsLoginModalOpen(true);
      }
      // You can use customEvent.detail.message if needed for displaying a message
    };

    window.addEventListener("open-login-modal", handleOpenLoginModal);

    return () => {
      window.removeEventListener("open-login-modal", handleOpenLoginModal);
    };
  }, [pathname]);

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
