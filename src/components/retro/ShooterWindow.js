import React, { Suspense, lazy, useContext } from "react";
import { Link } from "react-router-dom";

import AppContext from "../../globalState";
import Window from "./Window";

const ShooterPreview = lazy(
  () => import("../instagram/shooter/ShooterPreview"),
);

const PLAY = "/instagram?play";

// A live look into the block-breaker game, like the chaos window. Clicking it starts the game.
export default function ShooterWindow() {
  const { projectList } = useContext(AppContext);

  return (
    <Window
      title="SHOOTER.EXE"
      className="shooter-window-frame"
      actions={
        <Link to={PLAY} className="win__action">
          PLAY ▶
        </Link>
      }
    >
      <Link
        to={PLAY}
        className="shooter-window"
        aria-label="Play the block breaker"
      >
        <Suspense
          fallback={
            <span className="chaos-window__loading blink">LOADING…</span>
          }
        >
          {projectList && <ShooterPreview projects={projectList} />}
        </Suspense>
        <span className="shooter-window__crosshair" aria-hidden="true" />
        <span className="shooter-window__hint">▶ CLICK TO PLAY</span>
      </Link>
    </Window>
  );
}
