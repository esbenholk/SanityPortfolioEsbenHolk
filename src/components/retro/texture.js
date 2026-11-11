import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

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

// A GIF keeps animating only when shown as uploaded. `asset` can be a full asset
// ({ url, mimeType }) or just a reference ({ _ref: "image-…-gif" }), as in project galleries.
const textureUrl = (image) => {
  const { asset } = image;
  const isGif =
    asset.mimeType === "image/gif" ||
    /\.gif$/i.test(asset.url || "") ||
    /-gif$/i.test(asset._ref || "");
  return isGif && asset.url ? asset.url : urlFor(asset).width(700).url();
};

const hasAsset = (image) => image && image.asset;

// TEXTURE_COUNT urls picked at random from `images` (repeating when there are fewer)
const pickTextures = (images) => {
  if (!images.length) return [];
  const mixed = shuffle(images);
  return Array.from({ length: TEXTURE_COUNT }, (_, i) =>
    textureUrl(mixed[i % mixed.length]),
  );
};

// every image of a project: main, product and gallery images
const imagesOfProject = (project) =>
  [
    project.mainImage,
    project.productImage,
    ...(project.imagesGallery || []).map((item) => item && item.image),
  ].filter(hasAsset);

const setTextures = (prefix, urls, active) => {
  const root = document.documentElement;
  for (let i = 1; i <= TEXTURE_COUNT; i++) {
    const url = urls[i - 1];
    if (active && url)
      root.style.setProperty(`--${prefix}-${i}`, `url("${url}")`);
    else root.style.removeProperty(`--${prefix}-${i}`);
  }
};

// For the "texture" skin: images go into the CSS variables that themes.css uses as the
// background of nearly everything.
// --gtex-1 … --gtex-8: a random mix of the images picked in Sanity (Settings → Texture
//   images), or else of project images. The header and footer always use these.
// --tex-1 … --tex-8: everything else. On a project's page they're that project's own
//   images; on every other page the same random mix.
// Lives inside the router, so it knows which page is open.
export default function TextureSkin({
  active,
  siteSettings,
  projects,
  allProjects,
}) {
  const { pathname } = useLocation();

  const globalUrls = useMemo(() => {
    const chosen = ((siteSettings && siteSettings.textureImages) || []).filter(
      hasAsset,
    );
    return pickTextures(
      chosen.length
        ? chosen
        : (projects || [])
            .map((project) => project.mainImage || project.productImage)
            .filter(hasAsset),
    );
  }, [siteSettings, projects]);

  const slug = (pathname.match(/^\/projects\/([^/?#]+)/) || [])[1];
  const projectUrls = useMemo(() => {
    const project =
      slug && (allProjects || []).find((post) => post.slug.current === slug);
    return project ? pickTextures(imagesOfProject(project)) : [];
  }, [slug, allProjects]);

  useEffect(() => {
    setTextures("gtex", globalUrls, active);
    setTextures("tex", projectUrls.length ? projectUrls : globalUrls, active);
  }, [active, globalUrls, projectUrls]);

  return null;
}
