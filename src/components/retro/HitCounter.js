import React, { useEffect, useState } from "react";

const BASE = 143394;

// Per-browser visit counter, styled as an odometer
export default function HitCounter() {
  const [hits, setHits] = useState(BASE);

  useEffect(() => {
    try {
      const visits = parseInt(localStorage.getItem("hok_visits") || "0", 10) + 1;
      localStorage.setItem("hok_visits", String(visits));
      setHits(BASE + visits);
    } catch (e) {
      setHits(BASE + 1);
    }
  }, []);

  return (
    <div className="hit-counter" aria-label={`${hits} visitors`}>
      {String(hits)
        .padStart(8, "0")
        .split("")
        .map((digit, index) => (
          <span key={index}>{digit}</span>
        ))}
    </div>
  );
}
