import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";

const AsciiScene = lazy(() => import("../three/asciimodel.js"));

// The ascii 3D logo in a framed box like the feature presentation; links to the full-screen /ascii
export default function AsciiBox({ title = "ASCII.EXE" }) {
  return (
    <div className="ascii-box">
      <h2 className="box-label box-label--black">{title}</h2>
      <Link to="/ascii" className="ascii-box__screen" aria-label="Open the ascii scene">
        <Suspense fallback={<span className="ascii-box__loading blink">LOADING…</span>}>
          <AsciiScene modelUrl={process.env.PUBLIC_URL + "/assets/s2c_logo.glb"} fill />
        </Suspense>
      </Link>
    </div>
  );
}
