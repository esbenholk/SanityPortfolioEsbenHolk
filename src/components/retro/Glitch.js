import { useEffect, useRef } from "react";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Briefly tears the whole page whenever `trigger` changes (i.e. on navigation)
export function PageGlitch({ trigger }) {
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    document.body.classList.add("page-glitch");
    const timeout = setTimeout(
      () => document.body.classList.remove("page-glitch"),
      380
    );
    return () => {
      clearTimeout(timeout);
      document.body.classList.remove("page-glitch");
    };
  }, [trigger]);

  return null;
}
