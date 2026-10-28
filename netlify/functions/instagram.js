// Returns one page of the Instagram account's main-grid posts (no Reels), with each carousel's items.
// Call without parameters for the first page; pass ?after=<next> for the following ones.
// Pages keep each call far below Netlify's function time limit (10s by default).
// The token stays here on the server; set INSTAGRAM_TOKEN under
// Netlify → Site configuration → Environment variables.
// Long-lived tokens expire after 60 days unless refreshed:
//   https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=TOKEN

const GRAPH = "https://graph.instagram.com";
const MEDIA_FIELDS = "media_type,media_url,thumbnail_url";
const POST_FIELDS = `id,caption,permalink,timestamp,${MEDIA_FIELDS}`;
const PAGE_SIZE = 25;
const REQUEST_TIMEOUT = 8000; // give up on a slow Instagram request instead of hanging
const TIMEOUT_MESSAGE = "Instagram took too long to answer";
const CACHE_TIME = 10 * 60 * 1000; // reuse pages for 10 minutes while the function stays warm

const cache = new Map();

const respond = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    ...extraHeaders,
  },
  body: JSON.stringify(body),
});

async function getJson(url) {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
  } catch (error) {
    throw new Error(error.name === "TimeoutError" ? TIMEOUT_MESSAGE : error.message);
  }
  const body = await response.json();
  if (!response.ok || body.error) {
    // Instagram's error message never includes the token, so it's safe to pass on
    throw new Error((body.error && body.error.message) || `Instagram HTTP ${response.status}`);
  }
  return body;
}

// Reels live at instagram.com/reel/…, grid posts at instagram.com/p/…
const isReel = (post) =>
  post.media_product_type === "REELS" || /\/reels?\//.test(post.permalink || "");

async function fetchPage(auth, after) {
  const cursor = after ? `&after=${encodeURIComponent(after)}` : "";
  const url = (fields) => `${GRAPH}/me/media?fields=${fields}&limit=${PAGE_SIZE}${cursor}&${auth}`;
  try {
    // carousel items in the same request
    return await getJson(url(`${POST_FIELDS},children{${MEDIA_FIELDS}}`));
  } catch (error) {
    // a slow answer won't get faster by asking twice
    if (error.message === TIMEOUT_MESSAGE) throw error;
    // if Instagram refuses the nested field, fetch this page's carousels side by side
    const page = await getJson(url(POST_FIELDS));
    await Promise.all(
      (page.data || [])
        .filter((post) => post.media_type === "CAROUSEL_ALBUM")
        .map(async (post) => {
          post.children = await getJson(`${GRAPH}/${post.id}/children?fields=${MEDIA_FIELDS}&${auth}`);
        })
    );
    return page;
  }
}

exports.handler = async (event) => {
  const token = process.env.INSTAGRAM_TOKEN;
  if (!token) {
    return respond(500, { error: "INSTAGRAM_TOKEN is not set" });
  }
  const auth = `access_token=${encodeURIComponent(token)}`;
  const after = (event && event.queryStringParameters && event.queryStringParameters.after) || "";
  // media_url links expire after a while, so browsers cache briefly
  const cacheHeaders = { "Cache-Control": "public, max-age=900" };

  const cached = cache.get(after);
  if (cached && Date.now() - cached.time < CACHE_TIME) {
    return respond(200, cached.body, cacheHeaders);
  }

  try {
    const [profile, page] = await Promise.all([
      after ? null : getJson(`${GRAPH}/me?fields=username&${auth}`),
      fetchPage(auth, after),
    ]);

    const posts = (page.data || [])
      .filter((post) => !isReel(post))
      .map((post) => ({
        ...post,
        children: post.children ? post.children.data || [] : undefined,
      }));
    const next =
      page.paging && page.paging.next && page.paging.cursors ? page.paging.cursors.after : null;

    const body = { profile: profile ? { username: profile.username } : undefined, posts, next };
    cache.set(after, { time: Date.now(), body });
    return respond(200, body, cacheHeaders);
  } catch (error) {
    return respond(502, { error: error.message });
  }
};
