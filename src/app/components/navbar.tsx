"use client";

import React from "react";
import { Menu } from "@deemlol/next-icons";
import Link from "next/link";

import styles from "./navbar.module.css";

function NavbarAction({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <div className="flex gap-4 items-center max-sm:flex-col-reverse max-sm:mt-8 text-black">
      <Link href={"/event-order"} onClick={onLinkClick}>
        <button className="btn btn-md btn-ghost rounded-full text-primary  hover:bg-primary border-0 hover:text-white text-lg">
          EVENT ORDERING
        </button>
      </Link>
      <Link href={"/#aboutus"} onClick={onLinkClick}>
        <button className="btn btn-md btn-ghost rounded-full text-primary  hover:bg-primary border-0 hover:text-white text-lg">
          ABOUT
        </button>
      </Link>
      <Link href={"/contact"} onClick={onLinkClick}>
        <button className="btn btn-md btn-ghost rounded-full text-primary hover:bg-primary border-0 hover:text-white text-lg">
          CONTACT US
        </button>
      </Link>

      {/* <button className="btn btn-md btn-outline btn-primary rounded-full">
        Sign up
      </button>
      <button className="btn btn-md btn-outline btn-primary rounded-full">
        Log in
      </button> */}
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
      <div className="flex items-center justify-between px-16 py-4 max-lg:px-4 bg-secondary gap-5 flex-nowrap">
        {/* <div className="hidden md:block w-full max-w-xs"> */}
        {/* <SearchBar /> */}
        {/* </div> */}
        <div className="invisible max-xl:hidden whitespace-nowrap">
          <NavbarAction />
        </div>
        <Link href={"/"} className="cursor-pointer">
          <div className="flex items-center gap-4 cursor-pointer h-full whitespace-nowrap group relative">
            {/* <Image
            src="/logo.png"
            width={40}
            height={40}
            alt="swift foods logo"
          /> */}
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
