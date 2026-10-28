import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import Game from "./Game";
import { BLOCK_ASPECT } from "./level";
import { imagesOf, textureUrl } from "../useInstagramFeed";

// How much Instagram media the game uses:
const START_TEXTURES = 12; // images to wait for before the level starts
const MAX_TEXTURES = 120; // total images to load; the rest drop in as new blocks while you play
const CONCURRENT_LOADS = 3;

// Centre-crop each image to the block face shape (BLOCK_ASPECT) so it isn't stretched
function prepareTexture(texture) {
  const { width, height } = texture.image;
  const imageAspect = width / height;
  if (imageAspect > BLOCK_ASPECT) {
    // image is wider than the face: trim the sides
    const visible = BLOCK_ASPECT / imageAspect;
    texture.repeat.set(visible, 1);
    texture.offset.set((1 - visible) / 2, 0);
  } else if (imageAspect < BLOCK_ASPECT) {
    // image is taller than the face: trim top and bottom
    const visible = imageAspect / BLOCK_ASPECT;
    texture.repeat.set(1, visible);
    texture.offset.set(0, (1 - visible) / 2);
  }
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Loads the images a few at a time; `textures` grows as each one arrives (failures are skipped).
// `ready` turns true once the first START_TEXTURES are in (or everything has been tried).
function useProgressiveTextures(urls) {
  const [state, setState] = useState({ textures: [], attempted: 0 });
  const key = urls.join("|");

  useEffect(() => {
    let cancelled = false;
    let next = 0;
    let attempted = 0;
    const created = [];
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    setState({ textures: [], attempted: 0 });

    const loadNext = () => {
      if (cancelled || next >= urls.length) return;
      const url = urls[next++];
      loader.load(
        url,
        (texture) => {
          created.push(texture);
          attempted += 1;
          if (!cancelled) {
            setState((s) => ({ textures: [...s.textures, prepareTexture(texture)], attempted }));
          }
          loadNext();
        },
        undefined,
        () => {
          attempted += 1;
          if (!cancelled) setState((s) => ({ ...s, attempted }));
          loadNext();
        }
      );
    };
    for (let i = 0; i < CONCURRENT_LOADS; i++) loadNext();

    return () => {
      cancelled = true;
      created.forEach((texture) => texture.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const done = state.attempted >= urls.length;
  const ready = done || state.textures.length >= Math.min(START_TEXTURES, urls.length);
  return { textures: state.textures, attempted: state.attempted, done, ready };
}

// Full-screen 3D mode: a first-person shooter level built from the Instagram images
export default function ShooterStage({ posts, onExit }) {
  const urls = useMemo(
    () => [...new Set(imagesOf(posts))].slice(0, MAX_TEXTURES).map(textureUrl),
    [posts]
  );
  const { textures, done, ready } = useProgressiveTextures(urls);
  const isTouch = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    []
  );
  const [locked, setLocked] = useState(false);
  const [stats, setStats] = useState({ left: 0, destroyed: 0, incoming: 0 });
  const [round, setRound] = useState(0);
  const fpsRef = useRef(null);

  const handleStats = useCallback((next) => setStats(next), []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      if (document.pointerLockElement) document.exitPointerLock();
    };
  }, []);

  // cleared only once nothing else is still loading or waiting to drop in
  const cleared = ready && done && stats.destroyed > 0 && stats.left === 0 && stats.incoming === 0;
  const showStart = !isTouch && !locked && !cleared;

  return ReactDOM.createPortal(
    <div className={`shooter-stage ${locked ? "is-locked" : ""}`}>
      {ready && (
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          camera={{ fov: 75, near: 0.05, far: 200 }}
        >
          <Game
            key={round}
            textures={textures}
            onStats={handleStats}
            onLockChange={setLocked}
            fpsRef={fpsRef}
            isTouch={isTouch}
          />
        </Canvas>
      )}

      <div className="shooter-hud">
        <div className="shooter-hud__stats">
          <strong>INSTAGRAM.EXE // BLOCK BREAKER</strong>
          <span>DESTROYED {stats.destroyed}</span>
          <span>BLOCKS LEFT {stats.left}</span>
          <span>
            MEDIA {textures.length}/{urls.length}
            {!done && " · LOADING"}
          </span>
          {stats.incoming > 0 && <span className="blink">▼ NEW MEDIA INCOMING ({stats.incoming})</span>}
          <span>
            FPS <b ref={fpsRef}>–</b>
          </span>
        </div>
        <div className="shooter-crosshair" aria-hidden="true" />
        <button className="btn95 shooter-exit" onClick={onExit}>
          ◀ BACK TO GRID
        </button>
        {isTouch && <p className="shooter-hint">drag to look · tap a block to shoot it</p>}
      </div>

      {!ready && (
        <div className="shooter-overlay">
          <p className="blink">
            LOADING MEDIA {textures.length}/{Math.min(START_TEXTURES, urls.length)}
          </p>
        </div>
      )}

      {/* stays mounted (just hidden) so the pointer-lock click handler keeps working */}
      <div className={`shooter-overlay ${showStart && ready ? "" : "is-hidden"}`}>
        <button id="shooter-start" className="shooter-start">
          ▶ CLICK TO PLAY
        </button>
        <p className="shooter-controls">
          WASD move · SHIFT run · SPACE jump · HOLD CLICK fire · ESC pause
        </p>
      </div>

      {cleared && (
        <div className="shooter-overlay">
          <p className="shooter-cleared">LEVEL CLEARED</p>
          <button className="shooter-start" onClick={() => setRound((r) => r + 1)}>
            ↻ PLAY AGAIN
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
