import React, { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Endless ticker; content is rendered twice so the loop is seamless.
// Items are text, { label, to } to make each one a link, or { image } for a picture.
// `to` makes the whole ticker one link instead.
// `speed` is in pixels per second, so it stays the same however much content there is.
// `reverse` scrolls to the right instead of the left.
export default function Marquee({
  items,
  separator = "*",
  className = "",
  to,
  color = "",
  speed = 60,
  reverse = false,
}) {
  const runRef = useRef(null);
  const [duration, setDuration] = useState(null);

  // one loop moves the track one run width, so duration = width / speed.
  // hooks have to run before the early return below.
  useLayoutEffect(() => {
    const el = runRef.current;
    if (!el) return;
    const update = () => setDuration(el.offsetWidth / speed);
    update();
    // lazy images and font loading change the width after first paint
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [speed, items]);

  if (!items || items.length === 0) return null;

  // the copy is only there for the loop, so keyboard users skip its links
  const run = (copy) =>
    items.map((item, index) => {
      const label =
        typeof item === "string" ? (
          item
        ) : item.image ? (
          <img
            className="marquee__img"
            src={item.image}
            alt=""
            loading="lazy"
            draggable={false}
          />
        ) : (
          item.label
        );
      return (
        <span key={index}>
          {item.to && !to ? (
            <Link
              to={item.to}
              className="marquee__link"
              tabIndex={copy ? -1 : undefined}
            >
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
      <div className="marquee__run" ref={runRef}>
        {run(false)}
      </div>
      <div className="marquee__run" aria-hidden="true">
        {run(true)}
      </div>
    </div>
  );

  const style = {
    ...(color && { backgroundColor: color }),
    ...(duration && { "--marquee-duration": `${duration}s` }),
  };

  const classes = [
    "marquee",
    reverse && "marquee--reverse",
    to && "marquee--link",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return to ? (
    <Link to={to} className={classes} style={style}>
      {track}
    </Link>
  ) : (
    <div className={classes} style={style}>
      {track}
    </div>
  );
}
