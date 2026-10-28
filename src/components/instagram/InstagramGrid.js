import React, { useEffect, useRef, useState } from "react";
import { isPortrait, mediaOf } from "./useInstagramFeed";

const PAGE_SIZE = 12;

function Media({ item, playing }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      const started = video.play();
      if (started && started.catch) started.catch(() => {});
    } else {
      video.pause();
    }
  }, [playing]);

  if (item.media_type === "VIDEO") {
    return (
      <video
        ref={videoRef}
        src={item.media_url}
        poster={item.thumbnail_url}
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }
  return <img src={item.media_url} alt="" loading="lazy" />;
}

// One post: its media, with arrows to step through a carousel. Videos play while hovered.
function Tile({ post }) {
  const media = mediaOf(post);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`ig-tile ${isPortrait(post) ? "ig-tile--portrait" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Media key={index} item={media[index]} playing={hovered} />

      {media.length > 1 && (
        <>
          {index > 0 && (
            <button
              className="ig-arrow ig-arrow--prev"
              onClick={() => setIndex(index - 1)}
              aria-label="Previous"
            >
              ‹
            </button>
          )}
          {index < media.length - 1 && (
            <button
              className="ig-arrow ig-arrow--next"
              onClick={() => setIndex(index + 1)}
              aria-label="Next"
            >
              ›
            </button>
          )}
          <span className="ig-dots" aria-hidden="true">
            {media.map((_, dot) => (
              <span key={dot} className={dot === index ? "is-on" : ""} />
            ))}
          </span>
        </>
      )}
    </div>
  );
}

// Media-only profile grid; more posts load as you scroll down
export default function InstagramGrid({ posts }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible((count) => count + PAGE_SIZE);
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [posts]);

  return (
    <>
      <div className="ig-grid">
        {posts.slice(0, visible).map((post) => (
          <Tile key={post.id} post={post} />
        ))}
      </div>
      {visible < posts.length && <div ref={sentinelRef} className="ig-sentinel" />}
    </>
  );
}
