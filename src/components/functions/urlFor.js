import sanityClient from "../../client";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(sanityClient);

export default function urlFor(source) {
  return builder.image(source);
}

// object-position from a Sanity hotspot, so cropped frames keep the subject in view
export function hotspotStyle(image) {
  if (!image || !image.hotspot) return undefined;
  return {
    objectPosition: `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`,
  };
}
