import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import AppContext from "../../globalState";
import urlFor from "../functions/urlFor";

const PITCHES = [
  "HOT {title} IN YOUR AREA",
  "SINGLE {title} WANTS TO MEET YOU",
  "YOU WON'T BELIEVE {title}",
  "{title} — FULL HD — NO SIGNUP",
  "LOCAL ARTIST HATES THIS ONE TRICK: {title}",
  "CONGRATULATIONS! YOU ARE VISITOR #1000000. CLAIM {title}",
];
const MAX_OPEN = 3;

let nextId = 0;

// Tube skin: closable popup "ads" for your own projects. One appears on every
// page change and another every ~25s, up to MAX_OPEN at a time.
export default function PopupAds() {
  const { projectList } = useContext(AppContext);
  const location = useLocation();
  const [popups, setPopups] = useState([]);
  const projectsRef = useRef(projectList);
  projectsRef.current = projectList;

  const spawn = useCallback(() => {
    const projects = (projectsRef.current || []).filter(
      (post) => post.mainImage && post.mainImage.asset
    );
    if (projects.length === 0) return;
    const project = projects[Math.floor(Math.random() * projects.length)];
    const pitch = PITCHES[Math.floor(Math.random() * PITCHES.length)];
    setPopups((current) =>
      [
        ...current,
        {
          id: nextId++,
          project,
          text: pitch.replace("{title}", project.title.toUpperCase()),
          top: 10 + Math.random() * 55,
          left: 5 + Math.random() * 60,
        },
      ].slice(-MAX_OPEN)
    );
  }, []);

  const close = (id) => setPopups((current) => current.filter((p) => p.id !== id));

  useEffect(() => {
    const timeout = setTimeout(spawn, 1200);
    return () => clearTimeout(timeout);
  }, [location.pathname, spawn]);

  useEffect(() => {
    const timer = setInterval(spawn, 25000);
    const onKey = (e) => e.key === "Escape" && setPopups([]);
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [spawn]);

  return (
    <div className="popups" aria-live="polite">
      {popups.map((popup) => (
        <div
          className="popup"
          key={popup.id}
          style={{ top: `${popup.top}vh`, left: `${popup.left}vw` }}
          role="dialog"
          aria-label="Advertisement"
        >
          <div className="popup__bar">
            <span>⚠ SPECIAL OFFER</span>
            <button onClick={() => close(popup.id)} aria-label="Close ad">
              ×
            </button>
          </div>
          <Link
            to={"/projects/" + popup.project.slug.current}
            className="popup__body"
            onClick={() => close(popup.id)}
          >
            <img src={urlFor(popup.project.mainImage.asset).width(420).url()} alt="" />
            <span className="popup__text">{popup.text}</span>
            <span className="popup__cta">▶ WATCH NOW</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
