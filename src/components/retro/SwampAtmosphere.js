import React, { useMemo } from "react";

const FIREFLY_COUNT = 28;

// Swamp skin: drifting fog banks and fireflies behind the page
export default function SwampAtmosphere() {
  const fireflies = useMemo(
    () =>
      Array.from({ length: FIREFLY_COUNT }, () => ({
        left: Math.random() * 100,
        top: 20 + Math.random() * 80,
        delay: Math.random() * -14,
        duration: 9 + Math.random() * 10,
        size: 3 + Math.random() * 4,
      })),
    []
  );

  return (
    <div className="swamp-air" aria-hidden="true">
      <div className="fog fog--a" />
      <div className="fog fog--b" />
      {fireflies.map((fly, i) => (
        <span
          key={i}
          className="firefly"
          style={{
            left: `${fly.left}%`,
            top: `${fly.top}%`,
            width: fly.size,
            height: fly.size,
            animationDelay: `${fly.delay}s, ${fly.delay / 2}s`,
            animationDuration: `${fly.duration}s, ${fly.duration / 3}s`,
          }}
        />
      ))}
    </div>
  );
}
