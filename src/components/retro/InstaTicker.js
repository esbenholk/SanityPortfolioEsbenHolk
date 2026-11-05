import React, { useMemo } from "react";

import Marquee from "./Marquee";
import { mediaOf, useInstagramFeed } from "../instagram/useInstagramFeed";

const PREVIEW_COUNT = 14;
const WORDS = ["INSTAGRAM.EXE ▶", "NOW WITH 3D SHOOTER", "NEW POSTS INSIDE"];

// The landing page's Instagram link: a ticker of the latest posts' pictures.
// Only the first page of the feed is loaded; until it arrives (or if Instagram is offline) it's text only.
export default function InstaTicker() {
  const { posts } = useInstagramFeed({ all: false });

  const items = useMemo(() => {
    const pictures = (posts || []).slice(0, PREVIEW_COUNT).map((post) => {
      const first = mediaOf(post)[0];
      return first.media_type === "VIDEO" ? first.thumbnail_url : first.media_url;
    });
    if (!pictures.filter(Boolean).length) return WORDS;
    // a word after every few pictures
    const mixed = [];
    pictures.filter(Boolean).forEach((image, i) => {
      if (i % 5 === 0) mixed.push(WORDS[(i / 5) % WORDS.length]);
      mixed.push({ image });
    });
    return mixed;
  }, [posts]);

  return <Marquee to="/instagram" className="marquee--insta" separator="✦" items={items} />;
}
