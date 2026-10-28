// Relays an Instagram CDN image with CORS headers, so the 3D view can use it as a WebGL texture.
// Only Instagram/Facebook CDN hosts are allowed, so this can't be used as an open proxy.

const ALLOWED_HOST = /(^|\.)(cdninstagram\.com|fbcdn\.net)$/;

exports.handler = async (event) => {
  const target = event.queryStringParameters && event.queryStringParameters.url;
  let url;
  try {
    url = new URL(target);
  } catch (e) {
    return { statusCode: 400, body: "Missing or invalid url" };
  }
  if (url.protocol !== "https:" || !ALLOWED_HOST.test(url.hostname)) {
    return { statusCode: 403, body: "Host not allowed" };
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      return { statusCode: response.status, body: "Upstream error" };
    }
    const type = response.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) {
      return { statusCode: 415, body: "Not an image" };
    }
    const body = Buffer.from(await response.arrayBuffer()).toString("base64");
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": type,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
      body,
    };
  } catch (error) {
    return { statusCode: 502, body: "Could not fetch image" };
  }
};
