import { useLayoutEffect, useState } from "react";

// Returns a height for `targetRef` so that `containerRef` (which holds the target) ends
// exactly at the bottom of the screen when the page is scrolled to the top.
// Whatever sits above the container (header, breadcrumbs…) is taken into account automatically.
// Re-measures when the window or the container's other content (e.g. images loading) changes size.
// The space left below the container is the container's own CSS margin-bottom,
// so it's set in the CSS; pass `gap` (in px) to use a fixed number instead.
export default function useFitToScreen(
  targetRef,
  containerRef,
  { min = 100, gap, enabled = true } = {},
) {
  const [height, setHeight] = useState(null);

  useLayoutEffect(() => {
    if (!enabled) {
      setHeight(null);
      return;
    }
    const target = targetRef.current;
    const container = containerRef.current;
    if (!target || !container) return;

    let frame;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bottom =
          container.getBoundingClientRect().bottom + window.scrollY;
        const space =
          gap !== undefined
            ? gap
            : parseFloat(getComputedStyle(container).marginBottom) || 0;
        const overflow = bottom - (window.innerHeight - space);
        const next = Math.max(
          min,
          Math.round(target.getBoundingClientRect().height - overflow),
        );
        setHeight((current) =>
          current !== null && Math.abs(current - next) < 2 ? current : next,
        );
      });
    };

    // phones resize the window while scrolling (the address bar slides away), so only width counts there
    const touch = window.matchMedia("(pointer: coarse)").matches;
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (touch && window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      measure();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    // anything above can change height too (header, fonts, logo loading)
    observer.observe(document.body);
    window.addEventListener("resize", onResize);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [targetRef, containerRef, min, gap, enabled]);

  return height;
}
