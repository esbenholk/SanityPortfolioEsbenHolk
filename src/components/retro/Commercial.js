import React, { useContext } from "react";
import { Link } from "react-router-dom";

import AppContext from "../../globalState";
import urlFor, { hotspotStyle } from "../functions/urlFor";

// How many commercials each spot on the site can hold
export const COMMERCIAL_SLOTS = {
  header: 1,
  left: 1,
  center: 2,
  right: 2,
  greeting: 2,
};

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Fill every spot with a random commercial (new mix every page load). Each spot prefers a
// commercial that isn't on the page yet; when there aren't enough, commercials are reused.
// A spot stays empty only if no commercial is allowed there ("Can appear in" in Sanity).
export function scatterCommercials(commercials) {
  const ads = (commercials || []).filter((ad) => ad.image && ad.image.asset);
  const allowedIn = (ad, slot) =>
    !ad.placements || !ad.placements.length || ad.placements.includes(slot);
  const slots = {};
  Object.keys(COMMERCIAL_SLOTS).forEach((slot) => (slots[slot] = []));

  // every single spot, in random order, so no part of the page gets first pick
  const spots = shuffle(
    Object.entries(COMMERCIAL_SLOTS).flatMap(([slot, count]) =>
      Array(count).fill(slot),
    ),
  );
  const used = new Set();
  spots.forEach((slot) => {
    const allowed = ads.filter((ad) => allowedIn(ad, slot));
    if (!allowed.length) return;
    // prefer one not on the page yet; else at least not twice in the same spot
    const fresh = allowed.filter((ad) => !used.has(ad._id));
    const notHere = allowed.filter(
      (ad) => !slots[slot].some((other) => other._id === ad._id),
    );
    const pool = fresh.length ? fresh : notHere.length ? notHere : allowed;
    const ad = pool[Math.floor(Math.random() * pool.length)];
    used.add(ad._id);
    slots[slot].push(ad);
  });
  return slots;
}

const NONE = [];

// The commercials picked for one spot: "header" | "left" | "center" | "right"
export function useCommercials(slot) {
  const { commercialSlots } = useContext(AppContext);
  return (commercialSlots && commercialSlots[slot]) || NONE;
}

function adSource(image, width) {
  const { asset } = image;
  // resizing would freeze a GIF on its first frame, so GIFs are shown as uploaded
  const isGif =
    asset.mimeType === "image/gif" || /\.gif$/i.test(asset.url || "");
  return isGif ? asset.url : urlFor(asset).width(width).url();
}

// One commercial: the image or GIF, linking to its project, a page on the site or another website
export default function Commercial({ ad, width = 600, className = "" }) {
  const { image } = ad;
  const dimensions = image.asset.metadata && image.asset.metadata.dimensions;
  const content = (
    <>
      <img
        src={adSource(image, width)}
        alt={image.alt || ad.title || ""}
        style={{
          ...hotspotStyle(image),
          aspectRatio: dimensions
            ? `${dimensions.width} / ${dimensions.height}`
            : undefined,
        }}
        loading="lazy"
      />
      <span className="commercial__label">look at me</span>
    </>
  );
  const classes = `commercial ${className}`;

  if (ad.projectSlug) {
    return (
      <Link to={"/projects/" + ad.projectSlug} className={classes}>
        {content}
      </Link>
    );
  }
  if (ad.url && ad.url.startsWith("/")) {
    return (
      <Link to={ad.url} className={classes}>
        {content}
      </Link>
    );
  }
  if (ad.url) {
    return (
      <a href={ad.url} className={classes} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return <div className={classes}>{content}</div>;
}

// The commercials picked for a spot, one after another; `index` shows just one of them,
// so a column's commercials can sit in different places
export function CommercialSlot({ slot, index, width, className }) {
  const ads = useCommercials(slot);
  const shown = index === undefined ? ads : ads.slice(index, index + 1);
  return shown.map((ad, i) => (
    <Commercial
      ad={ad}
      width={width}
      className={className}
      key={`${ad._id}-${i}`}
    />
  ));
}
