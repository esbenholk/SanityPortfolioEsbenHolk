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

// Fetched once per visit and shared by the grid, the 3D view and the landing page ticker.
// The function answers one page at a time; the first page shows right away.
// The landing page only needs that first page; the Instagram page asks for the rest,
// which then keeps arriving in the background.
const store = {
  posts: null,
  error: null,
  done: false,
  loading: false,
  after: null, // cursor of the next page
  wantAll: false,
  listeners: new Set(),
};

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

// Loads the first page, then (only if someone wants everything) the following ones
async function load() {
  if (store.loading || store.done) return;
  store.loading = true;
  store.error = null;
  emit();
  try {
    do {
      const body = await fetchPage(store.after);
      const posts = (body.posts || []).filter((post) => !isReel(post));
      store.posts = [...(store.posts || []), ...posts];
      store.after = body.next || null;
      if (!store.after) store.done = true;
      emit();
    } while (store.after && store.wantAll);
  } catch (error) {
    // keep what already arrived; only show the error when there's nothing to show
    if (!store.posts) store.error = error.message;
    else store.done = true;
  }
  store.loading = false;
  emit();
}

// `all: false` is enough for a preview: it only loads the first page
export function useInstagramFeed({ all = true } = {}) {
  const [, rerender] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    store.listeners.add(rerender);
    if (all) store.wantAll = true;
    // first visit, a retry after a failed first page, or the rest of the pages
    if (!store.posts || (all && !store.done)) load();
    return () => {
      store.listeners.delete(rerender);
    };
  }, [all]);

  return { posts: store.posts, error: store.error, done: store.done };
}
