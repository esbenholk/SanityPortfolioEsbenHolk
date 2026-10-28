import React, { Suspense, lazy, useCallback, useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";

import AppContext from "../globalState";
import useWindowDimensions from "./functions/useWindowDimensions";
import HeaderOriginal from "./HeaderOriginal";

const Boids = lazy(() => import("./three/boids"));
const Gallery = lazy(() => import("./Gallery"));
const ThreeCanvas = lazy(() => import("./threeCanvas.js"));
const AsciiScene = lazy(() => import("./three/asciimodel.js"));
const Cross = lazy(() => import("./cross.js"));

const noop = () => {};

// The original new3dgallery2004 site (boids homepage, gallery, mapping, ascii)
// full-screen on top of the storefront. Its styles live in chaos.css, scoped to .chaos-stage.
export default function ChaosPage({ mode = "boids" }) {
  const { siteSettings, projectList, allProjects, settingsProject } = useContext(AppContext);
  const { width } = useWindowDimensions();
  const [selectedProject, setSelectedProject] = useState({});
  const [isActive, setIsActive] = useState();

  const updateSelectedProjectOnHover = useCallback((project) => {
    if (project) {
      setSelectedProject(project);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!siteSettings || !projectList) return null;

  return ReactDOM.createPortal(
    <div className="chaos-stage">
      <div className="mainbackground"></div>
      <Suspense fallback={<p className="standard-button fixedMiddle">content incoming...</p>}>
        {mode === "boids" && (
          <Boids
            projects={projectList}
            info={siteSettings}
            settingsProject={settingsProject}
            updateSelectedProjectOnHover={updateSelectedProjectOnHover}
          />
        )}
        {mode === "gallery" && (
          <Gallery
            info={siteSettings}
            projectList={allProjects}
            updateSelectedProjectOnHover={updateSelectedProjectOnHover}
          />
        )}
        {mode === "mapping" && <ThreeCanvas />}
        {mode === "ascii" && (
          <AsciiScene modelUrl={process.env.PUBLIC_URL + "/assets/s2c_logo.glb"} />
        )}

        {width > 600 && (
          <Cross selectedProject={selectedProject} shouldHaveBackground={true} isActive={isActive} />
        )}
      </Suspense>
      <HeaderOriginal updateSlug={noop} />

      <Link to="/" className="standard-button chaos-exit">
        ◀ EXIT CHAOS
      </Link>
    </div>,
    document.body
  );
}
