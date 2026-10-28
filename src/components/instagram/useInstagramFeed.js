import { useEffect, useReducer } from "react";

// Served by netlify/functions/instagram.js (run locally with `npx netlify dev`).
// Set REACT_APP_INSTAGRAM_ENDPOINT to use other data, e.g. /instagram-sample.json.
const ENDPOINT =
  process.env.REACT_APP_INSTAGRAM_ENDPOINT || "/.netlify/functions/instagram";
const IMAGE_PROXY = "/.netlify/functions/instagram-image";

// Instagram moved the profile grid from square to 3:4 tiles; posts from this date on are 3:4
export const GRID_UPDATE = new Date("2025-01-01T00:00:00Z");

export const isPortrait = (post) =>
  Boolean(post.timestamp) && new Date(post.timestamp) >= GRID_UPDATE;

const isReel = (post) => /\/reels?\//.test(post.permalink || "");

// The photos/videos of a post: a carousel's items, or the post itself
export const mediaOf = (post) =>
  post.media_type === "CAROUSEL_ALBUM" && post.children && post.children.length > 0
    ? post.children
    : [post];

// Instagram's CDN doesn't allow WebGL to read its images, so 3D textures go through our proxy
export function textureUrl(url) {
  try {
    const host = new URL(url).hostname;
    if (/(^|\.)(cdninstagram\.com|fbcdn\.net)$/.test(host)) {
      return `${IMAGE_PROXY}?url=${encodeURIComponent(url)}`;
    }
  } catch (e) {}
  return url;
}

// Every still image across all posts (carousel items included), newest first
export const imagesOf = (posts) =>
  posts.flatMap((post) =>
    mediaOf(post)
      .filter((item) => item.media_type !== "VIDEO" && item.media_url)
      .map((item) => item.media_url)
  );

// Fetched once per visit and shared by the grid and the 3D view.
// The function answers one page at a time; the first page shows right away
// and the rest keep arriving in the background.
const store = { posts: null, error: null, done: false, loading: false, listeners: new Set() };

const emit = () => store.listeners.forEach((listener) => listener());

async function fetchPage(after) {
  const response = await fetch(after ? `${ENDPOINT}?after=${encodeURIComponent(after)}` : ENDPOINT);
  // `npm start` answers unknown paths with index.html instead of running the function
  const type = response.headers.get("content-type") || "";
  if (!type.includes("json")) {
    throw new Error(
      "the Instagram function isn't running here (use `npx netlify dev`, or set REACT_APP_INSTAGRAM_ENDPOINT)"
    );
  }
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
  return body;
}

async function loadAll() {
  store.loading = true;
  store.error = null;
  emit();
  let after = null;
  try {
    do {
      const body = await fetchPage(after);
      const posts = (body.posts || []).filter((post) => !isReel(post));
      store.posts = [...(store.posts || []), ...posts];
      after = body.next || null;
      emit();
    } while (after);
    store.done = true;
  } catch (error) {
    // keep what already arrived; only show the error when there's nothing to show
    if (!store.posts) store.error = error.message;
    else store.done = true;
  }
  store.loading = false;
  emit();
}

export function useInstagramFeed() {
  const [, rerender] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    store.listeners.add(rerender);
    // first visit, or a retry after a failed first page
    if (!store.loading && !store.done && !store.posts) loadAll();
    return () => {
      store.listeners.delete(rerender);
    };
  }, []);

  return { posts: store.posts, error: store.error, done: store.done };
}
