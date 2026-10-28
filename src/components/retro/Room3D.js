import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import urlFor, { hotspotStyle } from "../functions/urlFor";
import { prefersReducedMotion } from "./Glitch";

// Where the spec callouts sit around the exhibit, as % of the room
const CALLOUT_SPOTS = [
  { top: "18%", left: "58%" },
  { top: "34%", left: "16%" },
  { top: "48%", left: "62%" },
  { top: "64%", left: "20%" },
  { top: "76%", left: "56%" },
];

// A CSS-3D showroom box: walls, checkered floor, and the current project floating inside it.
// Cycles through `projects` on its own; the whole box links to the project on show.
export default function Room3D({ projects }) {
  const [index, setIndex] = useState(0);
  const [switching, setSwitching] = useState(false);

  const count = projects ? projects.length : 0;

  useEffect(() => {
    if (count < 2 || prefersReducedMotion()) return;
    let switchTimer;
    const timer = setInterval(() => {
      setSwitching(true);
      switchTimer = setTimeout(() => {
        setIndex((current) => (current + 1) % count);
        setSwitching(false);
      }, 220);
    }, 5500);
    return () => {
      clearInterval(timer);
      clearTimeout(switchTimer);
    };
  }, [count]);

  if (!count) return null;
  const project = projects[index % count];
  const image = project.productImage || project.mainImage;
  const callouts = (project.tags || []).slice(0, CALLOUT_SPOTS.length);

  return (
    <Link
      to={"/projects/" + project.slug.current}
      className="room-wrap"
      aria-label={`Open ${project.title}`}
    >
      <div className={`room ${switching ? "is-switching" : ""}`}>
        <div className="room__inner">
          <div className="room__face room__back" />
          <div className="room__face room__left" />
          <div className="room__face room__right" />
          <div className="room__face room__ceiling" />
          <div className="room__face room__floor" />

          <span className="room__exhibit">
            {image && image.asset && (
              <img
                src={urlFor(image.asset).width(700).url()}
                alt={image.alt || project.title}
                style={hotspotStyle(image)}
              />
            )}
            <span className="room__shadow" aria-hidden="true" />
          </span>
        </div>

        {callouts.map((tag, i) => (
          <span className="callout" style={CALLOUT_SPOTS[i]} key={tag + i}>
            <span className="callout__dot" />
            {tag}
          </span>
        ))}

        <div className="room__label">
          <span className="room__title">{project.title}</span>
          {project.year && <span className="room__year">{project.year}</span>}
        </div>
      </div>

      {/* shows which of the featured projects is on display */}
      <div className="scrollbar" aria-hidden="true">
        <div className="scrollbar__track">
          <span
            className="scrollbar__thumb"
            style={{
              width: `${100 / count}%`,
              left: `${(100 / count) * (index % count)}%`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
