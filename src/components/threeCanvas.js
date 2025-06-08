import { useRef, useEffect, useState, useContext } from "react";
import * as d3 from "d3";

import AppContext from "../globalState";
import sanityClient from "../client";
import imageUrlBuilder from "@sanity/image-url";
import useWindowDimensions from "./functions/useWindowDimensions";

const builder = imageUrlBuilder(sanityClient);
function urlFor(source) {
  return builder.image(source);
}

function Canvas() {
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const [centers, setCenters] = useState([]);
  const [globalItems, setGlobalItems] = useState([]);
  const [globalConnections, setGlobalConnections] = useState([]);
  const [hasMeasured, setHasMeasured] = useState(false);
  const { width, height } = useWindowDimensions();

  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;

  useEffect(() => {
    const svg = d3.select(zoomRef.current);
    const zoomBehavior = d3.zoom().on("zoom", (event) => {
      d3.select(containerRef.current).attr("transform", event.transform);
    });
    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);
  }, []);

  const resetZoom = () => {
    const svg = d3.select(zoomRef.current);
    svg
      .transition()
      .duration(500)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  useEffect(() => {
    setCenters([
      {
        id: "startingcenter",
        x: width / 2,
        y: height / 2,
        elements: [
          {
            id: "img1",
            type: "image",
            x: 500,
            y: -300,
            width: null,
            height: null,
            src: urlFor(info.mainImage).width(1000).url(),
            text: "r u also lost?",
            color: "blue",
          },
          {
            id: "logo",
            type: "image",
            x: 0,
            y: 0,
            width: 300,
            height: null,
            src: "https://cdn.sanity.io/images/swdt1dj3/production/8f21d972094e0af93939387033731ccc1515cfbb-500x500.gif?h=610",
            text: "",
            color: "blue",
          },
          {
            id: "_title",
            type: "title",
            x: 0,
            y: 0,
            text: "mapping confusion",
            width: null,
            height: null,
            color: "blue",
          },
          {
            id: "btn1",
            type: "button",
            x: 100,
            y: 200,
            href: "https://example.com",
            label: "Go to Example",
            width: null,
            height: null,
            color: "blue",
          },
          {
            id: "btn2",
            type: "button",
            x: 250,
            y: 200,
            href: "https://example.com",
            label: "see more",
            width: null,
            height: null,
            color: "blue",
          },
          {
            id: "desc",
            type: "description",
            x: -500,
            y: 200,
            width: null,
            height: null,
            color: "blue",
            text: "\u201cWhen change keeps changing, and narratives keep collapsing, it leads to: <Reality Lag>: The gnawing and exhausting impression that our understanding of what is real lags behind where actual reality is heading.\u201d\u2013 ",
          },
          {
            id: "credit",
            type: "button",
            href: "https://example.com",
            label: "(Shumon Basar, We\u2019re in the Endcore now). ",
            x: -500,
            y: 300,
            width: 300,
            height: 50,
            color: "blue",
            text: "(Shumon Basar, We\u2019re in the Endcore now). ",
          },
        ],
        connections: [
          { ids: ["img1", "_title"] },
          { ids: ["btn1", "_title"] },
          { ids: ["desc", "_title"] },
          { ids: ["desc", "credit"] },
          { ids: ["btn1", "btn2"] },
        ],
      },
      {
        id: "realitylag",
        x: width / 2 + window.innerWidth,
        y: height / 2 + window.innerWidth,
        elements: [
          {
            id: "img1",
            type: "image",
            x: 500,
            y: -300,
            width: null,
            height: null,
            src: urlFor(info.mainImage).width(1000).url(),
            text: "r u also lost?",
            color: "blue",
          },
          {
            id: "logo",
            type: "image",
            x: 0,
            y: 0,
            width: 300,
            height: null,
            src: "https://cdn.sanity.io/images/swdt1dj3/production/8f21d972094e0af93939387033731ccc1515cfbb-500x500.gif?h=610",
            text: "",
            color: "blue",
          },
          {
            id: "_title",
            type: "title",
            x: 0,
            y: 0,
            text: "mapping confusion",
            width: null,
            height: null,
            color: "blue",
          },
          {
            id: "btn1",
            type: "button",
            x: 100,
            y: 200,
            href: "https://example.com",
            label: "Go to Example",
            width: null,
            height: null,
            color: "blue",
          },
          {
            id: "btn2",
            type: "button",
            x: 250,
            y: 200,
            href: "https://example.com",
            label: "see more",
            width: null,
            height: null,
            color: "blue",
          },
          {
            id: "desc",
            type: "description",
            x: -500,
            y: 200,
            width: null,
            height: null,
            color: "blue",
            text: "\u201cWhen change keeps changing, and narratives keep collapsing, it leads to: <Reality Lag>: The gnawing and exhausting impression that our understanding of what is real lags behind where actual reality is heading.\u201d\u2013 ",
          },
          {
            id: "credit",
            type: "button",
            href: "https://example.com",
            label: "(Shumon Basar, We\u2019re in the Endcore now). ",
            x: -500,
            y: 300,
            width: 300,
            height: 50,
            color: "blue",
            text: "(Shumon Basar, We\u2019re in the Endcore now). ",
          },
        ],
        connections: [
          { ids: ["img1", "_title"] },
          { ids: ["btn1", "_title"] },
          { ids: ["desc", "_title"] },
          { ids: ["desc", "credit"] },
          { ids: ["btn1", "btn2"] },
        ],
      },
    ]);

    setGlobalItems([
      {
        id: "legend",
        type: "description",
        x: 200,
        y: 200,
        text: "This is a global floating node",
        color: "green",
        width: null,
        height: null,
      },
      {
        id: "realitylagcenter",
        type: "description",
        x: width / 2 + window.innerWidth + 500,
        y: height / 2 + window.innerWidth,
        text: "x",
        color: "green",
        width: null,
        height: null,
      },
    ]);

    setGlobalConnections([{ ids: ["legend", "realitylagcenter"] }]);
  }, [info, width, height]);

  useEffect(() => {
    const handleResize = () => setHasMeasured(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (centers.length === 0 || hasMeasured === true) return;

    setTimeout(() => {
      const updatedCenters = centers.map((center) => {
        const updatedElements = center.elements.map((el) => {
          const node = document.getElementById(el.id);
          if (node) {
            const bbox = node.getBoundingClientRect();
            return {
              ...el,
              width: bbox.width,
              height: bbox.height,
            };
          }
          return el;
        });
        return {
          ...center,
          elements: updatedElements,
        };
      });

      setCenters(updatedCenters);
      setHasMeasured(true);
    }, 100);
  }, [centers, hasMeasured]);

  const flattenedElements = [
    ...centers.flatMap((center) =>
      center.elements.map((el) => ({
        ...el,
        absX: center.x + el.x,
        absY: center.y + el.y,
        relX: el.x,
        relY: el.y,
        centerId: center.id,
      }))
    ),
    ...globalItems.map((el) => ({
      ...el,
      absX: el.x,
      absY: el.y,
      relX: 0,
      relY: 0,
      centerId: null,
    })),
  ];

  const drawPipePath = (elements, ids) => {
    if (ids.length < 2) return "";

    const RADIUS = 50;
    const path = d3.path();

    const points = ids
      .map((id) => {
        const el = elements.find((el) => el.id === id);
        return el ? [el.absX, el.absY] : null;
      })
      .filter(Boolean);

    const [start, end] = points;
    if (!start || !end) return "";

    const [x1, y1] = start;
    const [x2, y2] = end;
    path.moveTo(x1, y1);

    const horizontalFirst = Math.abs(x2 - x1) > Math.abs(y2 - y1);
    const midX = horizontalFirst ? x2 : x1;
    const midY = horizontalFirst ? y1 : y2;

    const segments = [
      [x1, y1],
      [midX, midY],
      [x2, y2],
    ];

    for (let i = 1; i < segments.length - 1; i++) {
      const [xPrev, yPrev] = segments[i - 1];
      const [xCurr, yCurr] = segments[i];
      const [xNext, yNext] = segments[i + 1];

      const dx1 = xCurr - xPrev;
      const dy1 = yCurr - yPrev;
      const dx2 = xNext - xCurr;
      const dy2 = yNext - yCurr;

      const len1 = Math.hypot(dx1, dy1);
      const len2 = Math.hypot(dx2, dy2);
      const r = Math.min(RADIUS, len1 / 2, len2 / 2);

      const xEntry = xCurr - (dx1 / len1) * r;
      const yEntry = yCurr - (dy1 / len1) * r;
      const xExit = xCurr + (dx2 / len2) * r;
      const yExit = yCurr + (dy2 / len2) * r;

      path.lineTo(xEntry, yEntry);
      path.arcTo(xCurr, yCurr, xExit, yExit, r);
    }

    path.lineTo(x2, y2);
    return path.toString();
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          display: "flex",
          gap: "10px",
          padding: "10px",
          background: "rgba(255,255,255,0.9)",
          zIndex: 3,
        }}
      >
        {centers.map((center, idx) => (
          <button
            key={center.id}
            className="standard-button"
            onClick={() => {
              const svg = d3.select(zoomRef.current);
              const transform = d3.zoomIdentity.translate(
                width / 2 - center.x,
                height / 2 - center.y
              );
              svg
                .transition()
                .duration(750)
                .call(zoomBehaviorRef.current.transform, transform);
            }}
          >
            {center.id}
          </button>
        ))}
      </div>
      <button
        onClick={resetZoom}
        style={{ position: "absolute", bottom: 10, right: 10 }}
        className="standard-button"
      >
        Reset View
      </button>
      <svg
        ref={zoomRef}
        style={{ width: "100vw", height: "100vh", touchAction: "none" }}
      >
        <g ref={containerRef}>
          {centers.flatMap((center) =>
            (center.connections || []).map((conn, i) => (
              <path
                key={center.id + "_conn_" + i}
                d={drawPipePath(
                  center.elements.map((el) => ({
                    ...el,
                    absX: center.x + el.x,
                    absY: center.y + el.y,
                    relX: el.x,
                    relY: el.y,
                  })),
                  conn.ids
                )}
                fill="none"
                stroke="blue"
                strokeWidth={1.5}
              />
            ))
          )}

          {flattenedElements.map((el) => {
            const x = el.absX - (el.width || 0) / 2;
            const y = el.absY - (el.height || 0) / 2;

            if (el.type === "image") {
              return (
                <foreignObject
                  key={el.id}
                  id={el.id}
                  x={x}
                  y={y}
                  width={el.width || 300}
                  height={el.height || 300}
                >
                  <div xmlns="http://www.w3.org/1999/xhtml">
                    <p style={{ color: el.color, textAlign: "left" }}>
                      {el.text}
                    </p>
                    <img
                      src={el.src}
                      alt="img"
                      style={{
                        display: "block",
                        margin: "0 auto",
                        maxWidth: "300px",
                        height: "auto",
                      }}
                    />
                  </div>
                </foreignObject>
              );
            } else if (el.type === "button") {
              return (
                <foreignObject
                  key={el.id}
                  id={el.id}
                  x={x}
                  y={y}
                  width={el.width || 120}
                  height={el.height || 50}
                >
                  <div xmlns="http://www.w3.org/1999/xhtml">
                    <a href={el.href} target="_blank" rel="noopener noreferrer">
                      <button className="standard-button">{el.label}</button>
                    </a>
                  </div>
                </foreignObject>
              );
            } else if (el.type === "title") {
              return (
                <foreignObject
                  key={el.id}
                  id={el.id}
                  x={x}
                  y={y}
                  width={el.width || 300}
                  height={el.height || 100}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: el.color,
                      borderRadius: "40px",
                      color: "lightgrey",
                      border: `2px solid ${el.color}`,
                    }}
                    xmlns="http://www.w3.org/1999/xhtml"
                  >
                    <h2 style={{ color: "inherit", padding: "10px" }}>
                      {el.text}
                    </h2>
                  </div>
                </foreignObject>
              );
            } else if (el.type === "description") {
              return (
                <foreignObject
                  key={el.id}
                  id={el.id}
                  x={x}
                  y={y}
                  width={el.width || 300}
                  height={el.height || 200}
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      padding: "10px",
                      background: "#fff",
                      border: "1px solid" + el.color,
                      fontSize: "14px",
                    }}
                  >
                    {el.text}
                  </div>
                </foreignObject>
              );
            }
            return null;
          })}
          {globalConnections.map((conn, i) => (
            <path
              key={"global_conn_" + i}
              d={drawPipePath(
                [
                  ...centers.flatMap((center) =>
                    center.elements.map((el) => ({
                      ...el,
                      absX: center.x + el.x,
                      absY: center.y + el.y,
                      relX: el.x,
                      relY: el.y,
                    }))
                  ),
                  ...globalItems.map((el) => ({
                    ...el,
                    absX: el.x,
                    absY: el.y,
                    relX: 0,
                    relY: 0,
                  })),
                ],
                conn.ids
              )}
              fill="none"
              stroke="red"
              strokeWidth={1.5}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function CanvasWrapper() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        zIndex: 2,
      }}
    >
      <Canvas />
    </div>
  );
}
