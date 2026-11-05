import { useEffect, useState } from "react";
import sanityClient from "../../client";

// Image fields with their size, so carousels can lay out before images load
export const IMAGE_FIELDS = "asset->{_id, url, metadata{dimensions}}, hotspot, alt";

export const POST_QUERY = `*[slug.current == $slug]{
  id, title, mainImage{${IMAGE_FIELDS}}, productImage{${IMAGE_FIELDS}}, body, year, abbreviated_year,
  imagesGallery[]{..., image{${IMAGE_FIELDS}}}, miniImagesGallery, star_rating, slug,
  categories[]->{title, slug}, tags, color, recap, yearString, client, videos[]
}`;

// Gallery entries are either { image } or { youtube: { url } }; skip empty slots
export const mediaOf = (gallery) =>
  (gallery || []).filter(
    (item) => item && ((item.image && item.image.asset) || (item.youtube && item.youtube.url))
  );

// The gallery, or just the main image when there's no gallery
export const projectMedia = (project) => {
  const gallery = mediaOf(project.imagesGallery);
  if (gallery.length > 0) return gallery;
  return project.mainImage && project.mainImage.asset ? [{ image: project.mainImage }] : [];
};

// One project, fetched by slug (undefined while loading, null if it doesn't exist)
export default function useProject(slug) {
  const [project, setProject] = useState();
  useEffect(() => {
    let cancelled = false;
    setProject(undefined);
    sanityClient
      .fetch(POST_QUERY, { slug })
      .then((data) => !cancelled && setProject(data[0] || null))
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return project;
}
