import urlFor from "../../functions/urlFor";
import { mediaOf, textureUrl } from "../useInstagramFeed";

// Where the block images come from
export const SOURCES = [
  { id: "instagram", label: "INSTAGRAM" },
  { id: "projects", label: "PROJECTS" },
  { id: "both", label: "BOTH" },
];

const firstLine = (text) => (text || "").split("\n").find((line) => line.trim()) || "";

// Every still image of every Instagram post, tagged with the post it came from
function instagramMedia(posts) {
  return (posts || []).flatMap((post) => {
    const title = firstLine(post.caption);
    const meta = {
      kind: "instagram",
      title: title || "Instagram post",
      date: post.timestamp,
      link: post.permalink,
      // the caption minus the line already used as the title
      text: (post.caption || "").replace(title, "").trim(),
    };
    return mediaOf(post)
      .filter((item) => item.media_type !== "VIDEO" && item.media_url)
      .map((item) => ({ url: textureUrl(item.media_url), preview: item.media_url, meta }));
  });
}

const sanityImage = (image) =>
  image && image.asset ? urlFor(image.asset).width(640).url() : null;

// Main, product and gallery images of every project, tagged with the project.
// Sanity's CDN allows WebGL to use its images directly, so no proxy is needed.
function projectMedia(projects) {
  return (projects || []).flatMap((project) => {
    const meta = {
      kind: "project",
      title: project.title,
      date: [project.year, project.yearString].filter(Boolean).join(" "),
      link: "/projects/" + project.slug.current,
      categories: (project.categories || []).map((category) => category.title),
      recap: project.recap,
    };
    const images = [
      project.mainImage,
      project.productImage,
      ...(project.imagesGallery || []).map((item) => item && item.image),
    ];
    return images
      .map(sanityImage)
      .filter(Boolean)
      .map((url) => ({ url, preview: url, meta }));
  });
}

// Alternate two lists so "both" mixes the sources from the start
function interleave(a, b) {
  const mixed = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < a.length) mixed.push(a[i]);
    if (i < b.length) mixed.push(b[i]);
  }
  return mixed;
}

// The images for a source, without duplicates, in loading order
export function mediaFor(source, posts, projects) {
  const instagram = source === "projects" ? [] : instagramMedia(posts);
  const work = source === "instagram" ? [] : projectMedia(projects);
  const seen = new Set();
  return interleave(instagram, work).filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
