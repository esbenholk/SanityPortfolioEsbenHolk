import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import urlFor, { hotspotStyle } from "../functions/urlFor";
import { prefersReducedMotion } from "./Glitch";
import { hashOf } from "./theme";

const FRAMES = 6;

// A wall of frames that flip through project images like GIFs.
// `interval` sets the pace: fast and choppy for tube, slow fades for swamp.
export default function GifWall({ projects, title, interval = 700 }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(timer);
  }, [interval]);

  const images = (projects || []).filter((post) => post.mainImage && post.mainImage.asset);
  if (images.length === 0) return null;

  return (
    <section className="gif-wall">
      {title && <h2 className="gif-wall__title">{title}</h2>}
      <div className="gif-wall__grid">
        {Array.from({ length: Math.min(FRAMES, images.length) }, (_, slot) => {
          // each frame runs its own loop, offset so they don't flip in sync
          const post = images[(slot + Math.floor((tick + slot) / 3)) % images.length];
          const image = post.mainImage;
          return (
            <Link
              to={"/projects/" + post.slug.current}
              className="gif-frame"
              key={slot}
            >
              <img
                key={post.slug.current}
                src={urlFor(image.asset).width(360).url()}
                alt={image.alt || post.title}
                style={hotspotStyle(image)}
              />
              <span className="gif-frame__badge">GIF</span>
              <span className="gif-frame__title">{post.title}</span>
              <span className="gif-frame__views">
                {(hashOf(post.title) % 900) + 100}K views
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
