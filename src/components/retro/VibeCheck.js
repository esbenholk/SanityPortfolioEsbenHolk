import React, { useEffect, useMemo, useState } from "react";

import urlFor from "../functions/urlFor";
import { THEMES } from "./theme";

// How many tiles each skin gets in the 3 × 3 grid (9 in total)
const MIX = {
  computer: 1,
  texture: 1,
  ocean: 1,
  storefront: 2,
  minimal: 2,
  tube: 2,
};

// Drawn stand-ins for skins that have no vibe image in Sanity yet
const STAND_INS = {
  computer: { emoji: "💻", word: "online" },
  ocean: { emoji: "🌊", word: "drift" },
  texture: { emoji: "🧶", word: "texture" },
  storefront: { emoji: "💾", word: "y2k" },
  tube: { emoji: "💋", word: "hot" },
  minimal: { emoji: "🖼", word: "serious" },
};

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const imageUrl = (image) => {
  const { asset } = image;
  const isGif =
    asset.mimeType === "image/gif" || /\.gif$/i.test(asset.url || "");
  // tiles are ~130px: 260px covers sharp screens; small, compressed, WebP where possible
  return isGif
    ? asset.url
    : urlFor(asset)
        .width(260)
        .height(260)
        .fit("crop")
        .quality(70)
        .auto("format")
        .url();
};

// The nine tiles: for each skin, its number of Sanity vibe images (random ones if there
// are more), topped up with drawn stand-ins; then shuffled
function pickTiles(vibeImages) {
  const tiles = [];
  Object.entries(MIX).forEach(([skin, count]) => {
    const own = shuffle(
      (vibeImages || []).filter(
        (item) => item && item.skin === skin && item.image && item.image.asset,
      ),
    );
    for (let i = 0; i < count; i++) {
      tiles.push(
        // every tile has a drawn stand-in, shown until (or instead of) its picture
        {
          skin,
          standIn: STAND_INS[skin],
          variant: i,
          src: own[i] ? imageUrl(own[i].image) : null,
        },
      );
    }
  });
  return shuffle(tiles).map((tile, id) => ({ ...tile, id }));
}

// The chosen skin: each skin scores the share of its tiles that were picked (so the one
// computer tile counts as much as both ocean tiles); best score wins, ties at random.
// Skins this device can't show are passed over.
function skinFor(tiles, picked, allowed) {
  const score = {};
  tiles.forEach((tile) => {
    if (!picked.has(tile.id)) return;
    score[tile.skin] = (score[tile.skin] || 0) + 1 / MIX[tile.skin];
  });
  const ranked = shuffle(
    Object.keys(score).filter((skin) => allowed(skin)),
  ).sort((a, b) => score[b] - score[a]);
  return ranked[0] || "storefront";
}

// vibeCAPTCHA: on a first visit, "select all images that match your vibe" picks the
// visitor's starting skin. (An homage to the famous robot test, not the real thing.)
export default function VibeCheck({ vibeImages, isDesktop, onDone }) {
  const [step, setStep] = useState("checkbox"); // checkbox → grid → verified
  const [tiles, setTiles] = useState(() => pickTiles(vibeImages));
  const [loaded, setLoaded] = useState(() => new Set());
  const markLoaded = (src) => setLoaded((current) => new Set(current).add(src));

  // start loading the pictures right away, while the "I'm not a robot" box is showing
  useEffect(() => {
    tiles.forEach((tile) => {
      if (!tile.src) return;
      const image = new Image();
      image.onload = () => markLoaded(tile.src);
      image.src = tile.src;
    });
  }, [tiles]);
  const [picked, setPicked] = useState(() => new Set());
  const [nudge, setNudge] = useState(false);
  const [result, setResult] = useState(null);

  const allowed = useMemo(() => {
    const desktopOnly = new Set(
      THEMES.filter((option) => option.desktopOnly).map((option) => option.id),
    );
    return (skin) => isDesktop || !desktopOnly.has(skin);
  }, [isDesktop]);

  const toggle = (id) => {
    setNudge(false);
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const finish = (skin) => {
    setResult(THEMES.find((option) => option.id === skin) || THEMES[0]);
    setStep("verified");
    setTimeout(() => onDone(skin), 1400);
  };

  const verify = () => {
    if (!picked.size) {
      setNudge(true);
      return;
    }
    finish(skinFor(tiles, picked, allowed));
  };

  const reshuffle = () => {
    setTiles(pickTiles(vibeImages));
    setPicked(new Set());
    setNudge(false);
  };

  return (
    <div className="vibe" role="dialog" aria-label="vibeCAPTCHA">
      {step === "checkbox" && (
        <div className="vibe-box vibe-box--checkbox">
          <button className="vibe-check" onClick={() => setStep("grid")}>
            <span className="vibe-check__box" aria-hidden="true" />
            I'm not a robot
          </button>
          <span className="vibe-logo">
            <span className="vibe-logo__mark" aria-hidden="true">
              ◐
            </span>
            vibeCAPTCHA
            <small>Privacy · Vibes</small>
          </span>
        </div>
      )}

      {step === "grid" && (
        <div className="vibe-box vibe-box--grid">
          <div className="vibe-head">
            <span>Select all images that match</span>
            <strong>your vibe</strong>
            <span>Click verify once there are none left.</span>
          </div>
          <div className="vibe-grid">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                className={`vibe-tile ${picked.has(tile.id) ? "is-picked" : ""}`}
                aria-pressed={picked.has(tile.id)}
                onClick={() => toggle(tile.id)}
              >
                <span
                  className={`vibe-stand-in vibe-stand-in--${tile.skin} vibe-stand-in--v${tile.variant}`}
                >
                  <span className="vibe-stand-in__emoji">
                    {tile.standIn.emoji}
                  </span>
                  <span className="vibe-stand-in__word">
                    {tile.standIn.word}
                  </span>
                </span>
                {tile.src && (
                  <img
                    src={tile.src}
                    alt=""
                    draggable={false}
                    className={loaded.has(tile.src) ? "is-loaded" : ""}
                    onLoad={() => markLoaded(tile.src)}
                  />
                )}
              </button>
            ))}
          </div>
          {nudge && (
            <p className="vibe-nudge">Please select all matching images.</p>
          )}
          <div className="vibe-foot">
            <span className="vibe-tools">
              <button
                onClick={reshuffle}
                aria-label="New images"
                title="New images"
              >
                ↻
              </button>
              <button onClick={() => finish("storefront")} title="Skip">
                skip
              </button>
            </span>
            <button className="vibe-verify" onClick={verify}>
              VERIFY
            </button>
          </div>
        </div>
      )}

      {step === "verified" && result && (
        <div className="vibe-box vibe-box--checkbox">
          <span className="vibe-check is-done">
            <span className="vibe-check__box" aria-hidden="true">
              ✓
            </span>
            Vibe verified: {result.label.toLowerCase()}
          </span>
          <span className="vibe-logo">
            <span className="vibe-logo__mark" aria-hidden="true">
              ◐
            </span>
            vibeCAPTCHA
          </span>
        </div>
      )}
    </div>
  );
}
