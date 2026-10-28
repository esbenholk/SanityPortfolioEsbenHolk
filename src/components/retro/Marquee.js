import React from "react";

// Endless ticker; content is rendered twice so the loop is seamless
export default function Marquee({ items, separator = "*", className = "" }) {
  if (!items || items.length === 0) return null;
  const run = items.map((item, index) => (
    <span key={index}>
      {item}
      <span className="marquee__sep">{separator}</span>
    </span>
  ));

  return (
    <div className={`marquee ${className}`}>
      <div className="marquee__track">
        <div className="marquee__run">{run}</div>
        <div className="marquee__run" aria-hidden="true">
          {run}
        </div>
      </div>
    </div>
  );
}
