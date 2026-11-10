import { useEffect, useMemo } from "react";

import urlFor from "../functions/urlFor";

export const TEXTURE_COUNT = 8;

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// A GIF keeps animating only when shown as uploaded
const textureUrl = (image) => {
  const { asset } = image;
  const isGif =
    asset.mimeType === "image/gif" || /\.gif$/i.test(asset.url || "");
  return isGif ? asset.url : urlFor(asset).width(700).url();
};

// For the "texture" skin: puts TEXTURE_COUNT images into the CSS variables --tex-1 … --tex-8,
// which themes.css uses as the background of nearly everything. The images are the ones
// picked in Sanity (Settings → Texture images), or else a random mix of project images.
export default function useTextureImages(active, siteSettings, projects) {
  const urls = useMemo(() => {
    const chosen = ((siteSettings && siteSettings.textureImages) || []).filter(
      (image) => image && image.asset,
    );
    const pool = chosen.length
      ? chosen
      : (projects || [])
          .map((project) => project.mainImage || project.productImage)
          .filter((image) => image && image.asset);
    if (!pool.length) return [];
    const mixed = shuffle(pool);
    return Array.from({ length: TEXTURE_COUNT }, (_, i) =>
      textureUrl(mixed[i % mixed.length]),
    );
  }, [siteSettings, projects]);

  useEffect(() => {
    const root = document.documentElement;
    urls.forEach((url, i) => {
      if (active) root.style.setProperty(`--tex-${i + 1}`, `url("${url}")`);
      else root.style.removeProperty(`--tex-${i + 1}`);
    });
  }, [active, urls]);
}
