import React, { Suspense, lazy, useContext } from "react";
import { Link } from "react-router-dom";

import AppContext from "../../globalState";
import Window from "./Window";

const Boids = lazy(() => import("../three/boids"));

const noop = () => {};

// A live, non-interactive preview of the /chaos boids scene inside a window.
// Clicking anywhere on it enters the full-screen version.
export default function ChaosWindow() {
  const { siteSettings, projectList, settingsProject } = useContext(AppContext);

  return (
    <Window
      title="C:\CHAOS-nav.mode\boids.exe — LIVE"
      className="chaos-window-frame"
      actions={
        <Link to="/chaos" className="win__action">
          ENTER ▶
        </Link>
      }
    >
      <Link to="/chaos" className="chaos-window chaos-stage" aria-label="Enter the chaos">
      <div className="mainbackground"></div>
        <Suspense fallback={<span className="chaos-window__loading blink">LOADING CHAOS…</span>}>
          {projectList && (
            <Boids
              projects={projectList}
              info={siteSettings}
              settingsProject={settingsProject}
              updateSelectedProjectOnHover={noop}
              autoRotate={2}
            />
          )}
        </Suspense>
        {/* <span className="chaos-window__hint">▶ CLICK TO ENTER FULL SCREEN</span> */}
      </Link>
    </Window>
  );
}
