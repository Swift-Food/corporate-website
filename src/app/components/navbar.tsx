"use client";

import React from "react";
import { Menu } from "@deemlol/next-icons";
import Link from "next/link";

import styles from "./navbar.module.css";

function NavbarAction({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <div className="flex gap-4 items-center max-sm:flex-col-reverse max-sm:mt-8 text-black">
      <Link href={"/dashboard"} onClick={onLinkClick}>
        <button className="btn btn-md bg-white hover:bg-gray-50 rounded-md text-black border-1 border-black font-semibold text-base px-6">
          MANAGER
        </button>
      </Link>
      <Link href={"/new-login"} onClick={onLinkClick}>
        <button className="btn btn-md bg-primary hover:bg-primary/90 rounded-md text-white border-0 font-semibold text-base px-6">
          LOGIN
        </button>
      </Link>
    </div>
  );
}

export default function Navbar() {
  const closeDrawer = () => {
    const drawerCheckbox = document.getElementById(
      "my-drawer"
    ) as HTMLInputElement;
    if (drawerCheckbox) {
      drawerCheckbox.checked = false;
    }
  };

  return (
    <nav className="sticky top-0 left-0 right-0 flex flex-col z-50">
      <div className="flex items-center justify-between px-16 py-4 bg-secondary gap-5 flex-nowrap">
        <div className="invisible max-xl:hidden whitespace-nowrap">
          <NavbarAction />
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
          <NavbarAction />
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
              <NavbarAction onLinkClick={closeDrawer} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
