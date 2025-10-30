"use client";

import { CartProvider } from "@/context/CartContext";
import { ReactNode } from "react";

export default function RestaurantCatalogueLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
