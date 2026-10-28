import React from "react";
import urlFor, { hotspotStyle } from "../functions/urlFor";

const hasAsset = (image) => Boolean(image && image.asset);

// Sanity image that fills its frame. If `hoverImage` is given, hovering fades over to it.
export default function FrameImage({ image, hoverImage, width = 800, className = "" }) {
  if (!hasAsset(image)) return null;
  const swap = hasAsset(hoverImage) ? hoverImage : null;

  return (
    <div className={`frame-img ${className}`}>
      <img
        className="frame-img__base"
        src={urlFor(image.asset).width(width).url()}
        alt={image.alt || ""}
        style={hotspotStyle(image)}
        loading="lazy"
      />
      {swap && (
        <img
          className="frame-img__swap"
          src={urlFor(swap.asset).width(width).url()}
          alt=""
          aria-hidden="true"
          style={hotspotStyle(swap)}
          loading="lazy"
        />
      )}
    </div>
  );
}
