import React, { Suspense, lazy, useContext, useState } from "react";
import { motion } from "framer-motion";

import AppContext from "../../globalState";
import Window from "../retro/Window";
import InstagramGrid from "./InstagramGrid";
import { useInstagramFeed } from "./useInstagramFeed";

const ShooterStage = lazy(() => import("./shooter/ShooterStage"));

// /instagram: the feed as a media grid, or as a 3D shooter level built from the images
export default function InstagramPage() {
  const { posts, error, done: feedDone } = useInstagramFeed();
  const [mode, setMode] = useState("grid");
  const { projectList } = useContext(AppContext);
  // the 3D mode can also run on project images, so it doesn't need Instagram to be online
  const has3dMedia = Boolean((posts && posts.length) || (projectList && projectList.length));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Window
        title="instagram.exe"
        className="insta"
        actions={
          <>
            <button
              className={`win__action ${mode === "grid" ? "is-on" : ""}`}
              onClick={() => setMode("grid")}
            >
              ▦ GRID
            </button>
            <button
              className={`win__action ${mode === "3d" ? "is-on" : ""}`}
              onClick={() => setMode("3d")}
              disabled={!has3dMedia}
            >
              ◈ 3D
            </button>
          </>
        }
      >
        {error && (
          <p className="insta__status">
            ⚠ Instagram feed offline. Try again later.
            {process.env.NODE_ENV === "development" && <small> ({error})</small>}
          </p>
        )}
        {!posts && !error && <p className="insta__status blink">CONNECTING TO INSTAGRAM… (56k)</p>}
        {posts && <InstagramGrid posts={posts} />}
      </Window>

      {mode === "3d" && has3dMedia && (
        <Suspense fallback={null}>
          <ShooterStage posts={posts} feedDone={feedDone || Boolean(error)} onExit={() => setMode("grid")} />
        </Suspense>
      )}
    </motion.div>
  );
}
