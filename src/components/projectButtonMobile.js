import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlockContent from "./blocks/BlockContent";

const generateRandomOffset = () => ({
  x: Math.random() * 40 - 20,
  y: Math.random() * 20 - 10,
});

const MobileUnfoldingMenu = ({ clickedProject }) => {
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);
  const [triggerPos, setTriggerPos] = useState(null);
  const [itemRects, setItemRects] = useState([]);
  const [offsets, setOffsets] = useState([]);
  const [pathsVisible, setPathsVisible] = useState(false);
  const [pathKey, setPathKey] = useState(0); // to force SVG re-render

  const isVisible = !!clickedProject;

  const items = useMemo(() => {
    return clickedProject
      ? [
          clickedProject.title,
          clickedProject.year,
          (clickedProject.tags || []).join(" • "),
        ]
      : [];
  }, [clickedProject]);

  useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current) return;
    setTriggerPos(triggerRef.current.getBoundingClientRect());
    setOffsets(items.map(() => generateRandomOffset()));
    setItemRects([]); // reset item rects to ensure SVG updates on new project
    setPathKey((prev) => prev + 1); // trigger re-animation of SVG paths
  }, [isVisible, clickedProject, items]);

  useLayoutEffect(() => {
    if (pathsVisible) {
      const rects = itemRefs.current.map((ref) =>
        ref ? ref.getBoundingClientRect() : null
      );

      setItemRects(rects);
    }
  }, [pathsVisible, clickedProject]);

  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => setPathsVisible(true), 300);
      return () => clearTimeout(timeout);
    } else {
      setPathsVisible(false);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && clickedProject && (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            bottom: "0px",
            padding: "10px",
            width: "100%",
          }}
        >
          {/* Fixed trigger */}
          <div
            ref={triggerRef}
            className="standard-button neonGreen"
            style={{ width: "100%" }}
          >
            {clickedProject.title}
          </div>

          {/* SVG Paths */}
          {triggerPos && itemRects.length === items.length && (
            <svg
              key={pathKey} // key to force remount and re-animation
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none",
              }}
            >
              {items.map((_, idx) => {
                const itemRect = itemRects[idx];
                // const offset = offsets[idx] || { x: 0, y: 0 };
                if (!itemRect) return null;

                const fromX = triggerPos.left + triggerPos.width / 2;
                const fromY = triggerPos.top;
                const toX = itemRect.left + itemRect.width / 2;
                const toY = itemRect.top + itemRect.height / 2;

                const path = `M${fromX},${fromY} C${fromX},${
                  fromY - 60
                } ${toX},${toY + 60} ${toX},${toY}`;

                return (
                  <motion.path
                    key={idx}
                    d={path}
                    stroke="blue"
                    strokeWidth="1.5"
                    fill="transparent"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  />
                );
              })}
            </svg>
          )}

          {/* Jumbled list above the trigger */}
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            {items.map((text, idx) => {
              const offset = offsets[idx] || { x: 0, y: 0 };
              return (
                <motion.div
                  key={text}
                  ref={(el) => (itemRefs.current[idx] = el)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: pathsVisible ? 1 : 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  style={{
                    transform: `translate(${-offset.x}px, ${offset.y}px)`,
                  }}
                  className="standard-button neonGreen mobilebuttondescription"
                >
                  {idx === 0 ? (
                    <a
                      className="visitproject"
                      href={"/projects/" + clickedProject.slug.current}
                    >
                      see more
                    </a>
                  ) : idx === 2 ? (
                    <BlockContent blocks={clickedProject.recap} />
                  ) : (
                    text
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileUnfoldingMenu;
