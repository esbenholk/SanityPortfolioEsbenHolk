import React, { useEffect, useRef, useState } from "react";
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

// A CSS-3D showroom box: walls, checkered floor, and the current project
// floating inside it. Tilts with the pointer and cycles through `projects`.
export default function Room3D({ projects }) {
  const [index, setIndex] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [paused, setPaused] = useState(false);
  const innerRef = useRef(null);

  const count = projects ? projects.length : 0;

  const go = (step) => {
    if (!count) return;
    setSwitching(true);
    setTimeout(() => {
      setIndex((current) => (current + step + count) % count);
      setSwitching(false);
    }, 220);
  };

  useEffect(() => {
    if (count < 2 || paused || prefersReducedMotion()) return;
    const timer = setInterval(() => go(1), 5500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, paused]);

  const onPointerMove = (e) => {
    if (!innerRef.current || prefersReducedMotion()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    innerRef.current.style.transform = `rotateY(${x * 10}deg) rotateX(${
      -y * 8
    }deg)`;
  };

  const onPointerLeave = () => {
    setPaused(false);
    if (innerRef.current) innerRef.current.style.transform = "";
  };

  if (!count) return null;
  const project = projects[index % count];
  const image = project.productImage || project.mainImage;
  const callouts = (project.tags || []).slice(0, CALLOUT_SPOTS.length);

  return (
    <div className="room-wrap">
      <div
        className={`room ${switching ? "is-switching" : ""}`}
        onMouseMove={onPointerMove}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={onPointerLeave}
      >
        <div className="room__inner" ref={innerRef}>
          <div className="room__face room__back" />
          <div className="room__face room__left" />
          <div className="room__face room__right" />
          <div className="room__face room__ceiling" />
          <div className="room__face room__floor" />

          <Link
            to={"/projects/" + project.slug.current}
            className="room__exhibit"
            aria-label={`Open ${project.title}`}
          >
            {image && image.asset && (
              <img
                src={urlFor(image.asset).width(700).url()}
                alt={image.alt || project.title}
                style={hotspotStyle(image)}
              />
            )}
            <span className="room__shadow" aria-hidden="true" />
          </Link>
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

      <div className="scrollbar" role="group" aria-label="Featured projects">
        <button className="scrollbar__btn" onClick={() => go(-1)} aria-label="Previous">
          ◀
        </button>
        <div className="scrollbar__track">
          <span
            className="scrollbar__thumb"
            style={{
              width: `${100 / count}%`,
              left: `${(100 / count) * (index % count)}%`,
            }}
          />
        </div>
        <button className="scrollbar__btn" onClick={() => go(1)} aria-label="Next">
          ▶
        </button>
      </div>
    </div>
  );
}
