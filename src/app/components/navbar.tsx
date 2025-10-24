"use client";

import React from "react";
import { Menu } from "@deemlol/next-icons";
import Link from "next/link";

import styles from "./navbar.module.css";

// function NavbarAction({ onLinkClick }: { onLinkClick?: () => void }) {
//   return (
//     <div className="flex gap-4 items-center max-sm:flex-col-reverse max-sm:mt-8 text-black">
//       <Link href={"/event-order"} onClick={onLinkClick}>
//         <button className="btn btn-md btn-ghost rounded-full text-primary  hover:bg-primary border-0 hover:text-white text-lg">
//           EVENT ORDERING
//         </button>
//       </Link>
//       <Link href={"/#aboutus"} onClick={onLinkClick}>
//         <button className="btn btn-md btn-ghost rounded-full text-primary  hover:bg-primary border-0 hover:text-white text-lg">
//           ABOUT
//         </button>
//       </Link>
//       <Link href={"/contact"} onClick={onLinkClick}>
//         <button className="btn btn-md btn-ghost rounded-full text-primary hover:bg-primary border-0 hover:text-white text-lg">
//           CONTACT US
//         </button>
//       </Link>
//     </div>
//   );
// }

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
      <div className="flex items-center justify-center px-16 py-4 bg-secondary gap-5 flex-nowrap">
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
      </div>
    </nav>
  );
}
