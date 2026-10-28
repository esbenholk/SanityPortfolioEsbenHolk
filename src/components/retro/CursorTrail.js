import { useEffect } from "react";
import { prefersReducedMotion } from "./Glitch";

const SPARKLES = ["✦", "✧", "★", "✶", "+"];
const COLORS = ["#ffe600", "#ff2bd6", "#00e5ff", "#39ff14", "#ffffff"];

// Sparkle trail behind the mouse pointer. Plain DOM nodes so React doesn't re-render per move.
export default function CursorTrail() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let last = 0;
    const onMove = (e) => {
      // no sparkles while a game has captured the mouse
      if (document.pointerLockElement) return;
      const now = performance.now();
      if (now - last < 45) return;
      last = now;

      const spark = document.createElement("span");
      spark.className = "sparkle";
      spark.textContent = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
      spark.style.left = `${e.clientX}px`;
      spark.style.top = `${e.clientY}px`;
      spark.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      spark.style.setProperty("--drift", `${(Math.random() - 0.5) * 40}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 900);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
