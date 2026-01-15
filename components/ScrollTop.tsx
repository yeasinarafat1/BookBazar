"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Force the window to scroll to (0, 0) instantly on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use 'auto' or 'instant' to avoid weird animation conflicts
    });
  }, [pathname]);

  return null;
}