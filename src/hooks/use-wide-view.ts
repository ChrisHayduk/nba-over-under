"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when the viewport is wide enough to comfortably render dense tables.
 * We treat traditional min-width breakpoints and landscape orientation as triggers.
 */
export function useWideView(minWidth = 768) {
  const [isWide, setIsWide] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsWide(width >= minWidth || width > height);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [minWidth]);

  return isWide;
}
