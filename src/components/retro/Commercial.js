import React, { useContext } from "react";
import { Link } from "react-router-dom";

import AppContext from "../../globalState";
import urlFor, { hotspotStyle } from "../functions/urlFor";

// How many commercials each spot on the site can hold
export const COMMERCIAL_SLOTS = { header: 1, left: 2, center: 2, right: 2 };

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Scatter the commercials at random over the spots they're allowed in (new mix every page load)
export function scatterCommercials(commercials) {
  const slots = {};
  Object.keys(COMMERCIAL_SLOTS).forEach((slot) => (slots[slot] = []));
  const allowedFor = (ad) =>
    ad.placements && ad.placements.length ? ad.placements : Object.keys(COMMERCIAL_SLOTS);
  shuffle((commercials || []).filter((ad) => ad.image && ad.image.asset))
    // the pickiest ones choose first, so a header-only ad doesn't lose its spot to an "anywhere" one
    .sort((a, b) => allowedFor(a).length - allowedFor(b).length)
    .forEach((ad) => {
      const open = allowedFor(ad).filter(
        (slot) => slots[slot] && slots[slot].length < COMMERCIAL_SLOTS[slot]
      );
      if (open.length) slots[open[Math.floor(Math.random() * open.length)]].push(ad);
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
  const isGif = asset.mimeType === "image/gif" || /\.gif$/i.test(asset.url || "");
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
          aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : undefined,
        }}
        loading="lazy"
      />
      <span className="commercial__label">ADVERTISEMENT</span>
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
  return shown.map((ad) => <Commercial ad={ad} width={width} className={className} key={ad._id} />);
}
