import React from "react";
import { Link } from "react-router-dom";

// Endless ticker; content is rendered twice so the loop is seamless.
// Items are text, or { label, to } to make each one a link.
// `to` makes the whole ticker one link instead.
export default function Marquee({ items, separator = "*", className = "", to }) {
  if (!items || items.length === 0) return null;
  // the copy is only there for the loop, so keyboard users skip its links
  const run = (copy) =>
    items.map((item, index) => {
      const label = typeof item === "string" ? item : item.label;
      return (
        <span key={index}>
          {item.to && !to ? (
            <Link to={item.to} className="marquee__link" tabIndex={copy ? -1 : undefined}>
              {label}
            </Link>
          ) : (
            label
          )}
          <span className="marquee__sep">{separator}</span>
        </span>
      );
    });

  const track = (
    <div className="marquee__track">
      <div className="marquee__run">{run(false)}</div>
      <div className="marquee__run" aria-hidden="true">
        {run(true)}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className={`marquee marquee--link ${className}`}>
      {track}
    </Link>
  ) : (
    <div className={`marquee ${className}`}>{track}</div>
  );
}
