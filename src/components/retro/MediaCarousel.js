import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import getYouTubeId from "get-youtube-id";

import urlFor, { hotspotStyle } from "../functions/urlFor";
import { prefersReducedMotion } from "./Glitch";

const AUTOPLAY_DELAY = 3200;
const VIDEO_ASPECT = 16 / 9;

// YouTube / Vimeo link → embeddable player address
function embedUrl(url) {
  if (url.includes("vimeo")) {
    const id = (url.match(/(\d{6,})/) || [])[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  const id = getYouTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

// A row of media that all share the carousel's height (so widths follow each item's shape).
// Drag it with the mouse, swipe it on touch screens. It moves on by itself until someone
// touches, drags, scrolls or clicks it. `items` are { image } or { youtube: { url } }.
// The ref exposes goTo(index) for thumbnails and arrows.
const MediaCarousel = forwardRef(function MediaCarousel(
  { items, height, viewportRef, onIndexChange, className = "" },
  ref
) {
  const ownRef = useRef(null);
  const viewport = viewportRef || ownRef;
  const [autoplay, setAutoplay] = useState(true);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const indexRef = useRef(0);
  const requested = useRef(null); // the item asked for by goTo, until the scroll gets there
  const [playingVideo, setPlayingVideo] = useState(null);

  const slides = () => (viewport.current ? Array.from(viewport.current.children[0].children) : []);

  const scrollToIndex = useCallback(
    (index) => {
      const list = slides();
      if (!list.length || !viewport.current) return;
      const wrapped = (index + list.length) % list.length;
      requested.current = wrapped;
      const target = list[wrapped];
      viewport.current.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
      // near the end the row may not move at all, so update the count right away
      indexRef.current = wrapped;
      if (onIndexChange) onIndexChange(wrapped);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onIndexChange]
  );

  const stop = useCallback(() => setAutoplay(false), []);

  useImperativeHandle(ref, () => ({
    goTo: (index) => {
      stop();
      scrollToIndex(index);
    },
    step: (direction) => {
      stop();
      scrollToIndex(indexRef.current + direction);
    },
  }));

  // the item nearest the left edge counts as the current one
  const onScroll = () => {
    const list = slides();
    if (!list.length) return;
    const left = viewport.current.scrollLeft;
    let nearest = 0;
    list.forEach((slide, i) => {
      if (Math.abs(slide.offsetLeft - left) < Math.abs(list[nearest].offsetLeft - left)) nearest = i;
    });
    // at the very end the last item is current, even if it can't reach the left edge
    const el = viewport.current;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
      nearest = requested.current !== null ? requested.current : list.length - 1;
    }
    if (nearest !== indexRef.current) {
      indexRef.current = nearest;
      if (onIndexChange) onIndexChange(nearest);
    }
  };

  // autoplay: next item every few seconds, back to the start after the last one
  useEffect(() => {
    if (!autoplay || items.length < 2 || prefersReducedMotion()) return;
    const timer = setInterval(() => {
      const el = viewport.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      scrollToIndex(atEnd ? 0 : indexRef.current + 1);
    }, AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [autoplay, items.length, scrollToIndex, viewport]);

  // mouse dragging (touch screens scroll natively)
  const onPointerDown = (e) => {
    stop();
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    requested.current = null;
    drag.current = { x: e.clientX, left: viewport.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (!drag.current.moved && Math.abs(dx) > 4) {
      drag.current.moved = true;
      setDragging(true);
    }
    if (drag.current.moved) viewport.current.scrollLeft = drag.current.left - dx;
  };
  const endDrag = () => {
    if (!drag.current) return;
    const moved = drag.current.moved;
    drag.current = null;
    setDragging(false);
    // a drag shouldn't count as a click on whatever is under the mouse
    if (moved) {
      const swallow = (e) => {
        e.stopPropagation();
        e.preventDefault();
      };
      window.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
    }
  };

  useEffect(() => {
    window.addEventListener("pointerup", endDrag);
    return () => window.removeEventListener("pointerup", endDrag);
  });

  return (
    <div
      ref={viewport}
      className={`carousel ${dragging ? "is-dragging" : ""} ${className}`}
      style={height ? { height } : undefined}
      onScroll={onScroll}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onWheel={stop}
      onTouchStart={stop}
      onKeyDown={stop}
      tabIndex={0}
      aria-roledescription="carousel"
    >
      <div className="carousel__track">
        {items.map((item, index) => {
          if (item.youtube) {
            const src = embedUrl(item.youtube.url);
            return (
              src && (
                <div className="carousel__item carousel__item--video" key={index} style={{ aspectRatio: VIDEO_ASPECT }}>
                  <iframe
                    src={src}
                    title={`Video ${index + 1}`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                  {playingVideo !== index && (
                    <button
                      className="carousel__shield"
                      aria-label="Use this video"
                      onClick={() => {
                        stop();
                        setPlayingVideo(index);
                      }}
                    />
                  )}
                </div>
              )
            );
          }
          const { image } = item;
          const dims = image.asset.metadata && image.asset.metadata.dimensions;
          return (
            <div className="carousel__item" key={index}>
              <img
                src={urlFor(image.asset).height(1200).url()}
                alt={image.alt || ""}
                draggable={false}
                style={{ ...hotspotStyle(image), aspectRatio: dims ? `${dims.width} / ${dims.height}` : undefined }}
                loading={index < 3 ? "eager" : "lazy"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default MediaCarousel;
