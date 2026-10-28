import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import AppContext from "../../../globalState";
import BlockContent from "../../blocks/BlockContent";
import Window from "../../retro/Window";
import Game from "./Game";
import { BLOCK_ASPECT } from "./level";
import { SOURCES, mediaFor } from "./media";

// How much media the game uses:
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

// Loads the media a few at a time; `textures` grows as each one arrives (failures are skipped).
// Each texture keeps the post/project it came from in texture.userData, for inspect mode.
// `items` may keep growing (more Instagram pages arriving): new ones join the queue
// without restarting what's already loaded. Changing `resetKey` starts over.
// `ready` turns true once the first START_TEXTURES are in (or everything has been tried).
function useProgressiveTextures(items, resetKey) {
  const [state, setState] = useState({ textures: [], attempted: 0 });
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const pumpRef = useRef(() => {});

  useEffect(() => {
    let cancelled = false;
    let active = 0;
    let attempted = 0;
    const started = new Set();
    const created = [];
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    setState({ textures: [], attempted: 0 });

    const settle = (texture) => {
      active -= 1;
      attempted += 1;
      const count = attempted;
      if (!cancelled) {
        setState((s) =>
          texture ? { textures: [...s.textures, texture], attempted: count } : { ...s, attempted: count }
        );
      }
      pump();
    };

    const load = (item) => {
      started.add(item.url);
      active += 1;
      loader.load(
        item.url,
        (texture) => {
          created.push(texture);
          texture.userData = { meta: item.meta, preview: item.preview };
          settle(prepareTexture(texture));
        },
        undefined,
        () => settle(null)
      );
    };

    // start loading the next not-yet-started items, up to CONCURRENT_LOADS at once
    const pump = () => {
      if (cancelled) return;
      for (const item of itemsRef.current) {
        if (active >= CONCURRENT_LOADS) return;
        if (!started.has(item.url)) load(item);
      }
    };
    pumpRef.current = pump;
    pump();

    return () => {
      cancelled = true;
      pumpRef.current = () => {};
      created.forEach((texture) => texture.dispose());
    };
  }, [resetKey]);

  // more items arrived: queue them
  useEffect(() => {
    pumpRef.current();
  }, [items]);

  const done = state.attempted >= items.length;
  const ready = done || state.textures.length >= Math.min(START_TEXTURES, items.length);
  return { textures: state.textures, done, ready };
}

// Instagram dates are timestamps ("2025-07-12T10:00:00+0000"); project dates are text ("2023 -present")
const formatDate = (date) => {
  if (!date) return "";
  if (!/^\d{4}-\d{2}-\d{2}T/.test(date)) return date;
  // "+0000" → "+00:00", which every browser can parse
  const parsed = new Date(date.replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));
  return isNaN(parsed)
    ? date
    : parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

// The unfolded details of an inspected block
function InspectPanel({ info, onClose }) {
  const { meta, preview } = info;
  return (
    <div className="shooter-overlay shooter-overlay--inspect">
      <Window
        title={meta.kind === "project" ? "project.nfo" : "instagram_post.nfo"}
        className="shooter-inspect"
        actions={
          <button className="win__action" onClick={() => onClose(true)} aria-label="Close">
            ×
          </button>
        }
      >
        {preview && <img className="shooter-inspect__image" src={preview} alt="" />}
        <h3 className="shooter-inspect__title">{meta.title}</h3>
        {meta.date && <p className="shooter-inspect__date">{formatDate(meta.date)}</p>}
        {meta.categories && meta.categories.length > 0 && (
          <div className="tag-chips">
            {meta.categories.map((category) => (
              <span className="chip" key={category}>
                {category}
              </span>
            ))}
          </div>
        )}
        {meta.recap && (
          <div className="shooter-inspect__text blockContent">
            <BlockContent blocks={meta.recap} />
          </div>
        )}
        {meta.text && <p className="shooter-inspect__text">{meta.text}</p>}
        <div className="shooter-inspect__actions">
          {meta.kind === "project" ? (
            <Link className="btn95" to={meta.link}>
              OPEN PROJECT ▶
            </Link>
          ) : (
            meta.link && (
              <a className="btn95" href={meta.link} target="_blank" rel="noreferrer">
                VIEW ON INSTAGRAM ↗
              </a>
            )
          )}
          <button className="btn95" onClick={() => onClose(true)}>
            ▶ BACK TO GAME
          </button>
        </div>
      </Window>
    </div>
  );
}

// Full-screen 3D mode: a first-person level built from Instagram and/or project images
export default function ShooterStage({ posts, feedDone, onExit }) {
  const { projectList } = useContext(AppContext);
  const [source, setSource] = useState(posts && posts.length ? "instagram" : "projects");
  const items = useMemo(
    () => mediaFor(source, posts, projectList).slice(0, MAX_TEXTURES),
    [source, posts, projectList]
  );
  const { textures, done: texturesDone, ready } = useProgressiveTextures(items, source);
  // Instagram pages may still be arriving, which means more media to come
  const done = texturesDone && (source === "projects" || feedDone);
  const isTouch = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    []
  );
  const [locked, setLocked] = useState(false);
  const [stats, setStats] = useState({ left: 0, destroyed: 0, incoming: 0 });
  const [round, setRound] = useState(0);
  const [mode, setMode] = useState("shoot"); // "shoot" | "inspect"
  const [inspected, setInspected] = useState(null);
  const fpsRef = useRef(null);

  const handleStats = useCallback((next) => setStats(next), []);

  // Inspect mode: show the block's post/project and free the mouse so its link can be clicked
  const handleInspect = useCallback((info) => {
    setInspected(info);
    if (document.pointerLockElement) document.exitPointerLock();
  }, []);

  const closeInspect = useCallback(
    (resume) => {
      setInspected(null);
      if (resume && !isTouch) {
        const canvas = document.querySelector(".shooter-stage canvas");
        if (canvas) canvas.requestPointerLock();
      }
    },
    [isTouch]
  );

  const toggleMode = useCallback(() => setMode((m) => (m === "shoot" ? "inspect" : "shoot")), []);

  // Q switches mode; Esc closes the info panel
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "KeyQ") toggleMode();
      if (e.code === "Escape") setInspected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleMode]);

  const chooseSource = (id) => {
    if (id === source) return;
    setSource(id);
    setInspected(null);
    setStats({ left: 0, destroyed: 0, incoming: 0 });
  };

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
  const showStart = !isTouch && !locked && !cleared && !inspected;

  const sourcePicker = (
    <div className="shooter-picker" role="group" aria-label="Image source">
      <span>IMAGES:</span>
      {SOURCES.map((option) => (
        <button
          key={option.id}
          className={`btn95 ${source === option.id ? "is-pressed" : ""}`}
          aria-pressed={source === option.id}
          onClick={() => chooseSource(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return ReactDOM.createPortal(
    <div className={`shooter-stage shooter-stage--${mode} ${locked ? "is-locked" : ""}`}>
      {ready && (
        <Canvas
          key={source}
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          camera={{ fov: 75, near: 0.05, far: 200 }}
        >
          <Game
            key={round}
            textures={textures}
            mode={mode}
            inspectedId={inspected ? inspected.blockId : null}
            onStats={handleStats}
            onInspect={handleInspect}
            onLockChange={setLocked}
            fpsRef={fpsRef}
            isTouch={isTouch}
          />
        </Canvas>
      )}

      <div className="shooter-hud">
        <div className="shooter-hud__stats">
          <strong>
            {source === "projects" ? "PROJECTS.EXE" : "INSTAGRAM.EXE"}
            {" // BLOCK BREAKER"}
          </strong>
          <span>DESTROYED {stats.destroyed}</span>
          <span>BLOCKS LEFT {stats.left}</span>
          <span>
            MEDIA {textures.length}/{items.length}
            {!done && " · LOADING"}
          </span>
          {stats.incoming > 0 && <span className="blink">▼ NEW MEDIA INCOMING ({stats.incoming})</span>}
          <span>
            FPS <b ref={fpsRef}>–</b>
          </span>
        </div>
        <button className="btn95 shooter-mode" onClick={toggleMode}>
          {mode === "shoot" ? "✹ SHOOT" : "◎ INSPECT"} <small>[Q] switch</small>
        </button>
        <div className="shooter-crosshair" aria-hidden="true" />
        <button className="btn95 shooter-exit" onClick={onExit}>
          ◀ BACK TO GRID
        </button>
        {/* touch screens have no start screen, so the source picker lives in the HUD */}
        {isTouch && <div className="shooter-hud__picker">{sourcePicker}</div>}
        {isTouch && (
          <p className="shooter-hint">
            drag to look · tap a block to {mode === "shoot" ? "shoot it" : "inspect it"}
          </p>
        )}
      </div>

      {!ready && (
        <div className="shooter-overlay">
          <p className="blink">
            LOADING MEDIA {textures.length}/{Math.min(START_TEXTURES, items.length)}
          </p>
          {sourcePicker}
        </div>
      )}

      {/* stays mounted (just hidden) so the pointer-lock click handler keeps working */}
      <div className={`shooter-overlay ${showStart && ready ? "" : "is-hidden"}`}>
        <button id="shooter-start" className="shooter-start">
          ▶ CLICK TO PLAY
        </button>
        <p className="shooter-controls">
          WASD move · SHIFT run · SPACE jump · {mode === "shoot" ? "HOLD CLICK fire" : "CLICK inspect"} ·
          Q shoot/inspect · ESC pause
        </p>
        {sourcePicker}
      </div>

      {inspected && <InspectPanel info={inspected} onClose={closeInspect} />}

      {cleared && (
        <div className="shooter-overlay">
          <p className="shooter-cleared">LEVEL CLEARED</p>
          <button className="shooter-start" onClick={() => setRound((r) => r + 1)}>
            ↻ PLAY AGAIN
          </button>
          {sourcePicker}
        </div>
      )}
    </div>,
    document.body
  );
}
