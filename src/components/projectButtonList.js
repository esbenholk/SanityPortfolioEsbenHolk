import BlockContent from "./blocks/BlockContent";

import { motion, AnimatePresence } from "framer-motion";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";

const generateRandomOffset = () => ({
  x: Math.floor(Math.random() * 40 - 20), // -20 to +20px
  y: Math.floor(Math.random() * 40 - 20),
});

const UnfoldingButtonMenu = forwardRef(
  ({ project, openProjectId, hoverProjectId, onRequestOpen, isLast }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pathsVisible, setPathsVisible] = useState(false);
    const itemRefs = useRef([]);
    const [buttonRect, setButtonRect] = useState(null);
    const [itemRects, setItemRects] = useState([]);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);

    const items = [project.year, project.title, "recap", "button"];
    const [offsets] = useState(items.map(generateRandomOffset));

    // Sync open/close with openProjectId (controlled from parent)
    // useEffect(() => {
    //   if (openProjectId === project.title) {
    //     buttonRef.current.classList.add("active");
    //   } else {
    //     buttonRef.current.classList.remove("active");
    //   }
    // }, [openProjectId]);

    useEffect(() => {
      if (openProjectId === project.title) {
        openButton();
      } else {
        closeButton();
      }
    });

    // Expose functions via ref
    useImperativeHandle(ref, () => ({
      openButton,
      closeButton,
      hoverButton,
      unhoverButton,
    }));

    async function hoverButton() {
      buttonRef.current.classList.add("active");
    }
    async function unhoverButton() {
      if (!isOpen) buttonRef.current.classList.remove("active");
    }

    async function openButton() {
      const rect = buttonRef.current.getBoundingClientRect();
      const isBelow = rect.bottom > window.innerHeight - 100;
      const isAbove = rect.top < 100;

      if (isBelow || isAbove) {
        await new Promise((resolve) => {
          const onScroll = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
              window.removeEventListener("scroll", onScroll);
              resolve();
            }, 100);
          };

          let timer = setTimeout(() => {
            window.removeEventListener("scroll", onScroll);
            resolve();
          }, 400);

          window.addEventListener("scroll", onScroll);

          buttonRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });

        buttonRef.current.classList.add("active");
        setIsOpen(true);
        onRequestOpen?.(project.title);
      } else {
        buttonRef.current.classList.add("active");
        setIsOpen(true);
        onRequestOpen?.(project.title);
      }
    }

    function closeButton() {
      setPathsVisible(false);
      setIsOpen(false);
      buttonRef.current?.classList.remove("active");
    }

    // Close on scroll
    useEffect(() => {
      if (!isOpen) return;

      const handleScroll = () => {
        closeButton();
        onRequestOpen?.(null);
      };

      window.addEventListener("scroll", handleScroll, { once: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, [isOpen, onRequestOpen]);

    // Positioning logic
    useLayoutEffect(() => {
      if (isOpen && buttonRef.current) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
    }, [isOpen]);

    useLayoutEffect(() => {
      if (isOpen && pathsVisible) {
        const rects = itemRefs.current.map((ref) =>
          ref ? ref.getBoundingClientRect() : null
        );
        setItemRects(rects);
      }
    }, [pathsVisible, isOpen]);

    // Control path visibility delay
    useEffect(() => {
      if (isOpen) {
        const timeout = setTimeout(() => setPathsVisible(true), 600);
        return () => clearTimeout(timeout);
      } else {
        setPathsVisible(false);
      }
    }, [isOpen]);

    useEffect(() => {
      const updatePositions = () => {
        if (buttonRef.current) {
          setButtonRect(buttonRef.current.getBoundingClientRect());
        }

        const rects = itemRefs.current.map((ref) =>
          ref ? ref.getBoundingClientRect() : null
        );
        setItemRects(rects);
      };

      if (isOpen && pathsVisible) {
        updatePositions();
      }

      if (isOpen) {
        window.addEventListener("scroll", updatePositions);
        window.addEventListener("resize", updatePositions);
        return () => {
          window.removeEventListener("scroll", updatePositions);
          window.removeEventListener("resize", updatePositions);
        };
      }
    }, [isOpen, pathsVisible]);

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button
          ref={buttonRef}
          onClick={() => {
            window.closeAllExceptOpen();
            openButton();
            window.setCurrentProjectFromButtons(project);
            window.focusProject(project.slug.current);
          }}
          className="project-button standard-button"
        >
          {project.title}
        </button>

        <AnimatePresence>
          {isOpen && buttonRect && (
            <>
              <svg
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                {items &&
                  items.map((_, idx) => {
                    const target = itemRects[idx];
                    const offset = offsets[idx];
                    if (!target) return null;

                    const fromX = buttonRect.right;
                    const fromY = buttonRect.top + buttonRect.height / 2;
                    const toX = target.left + offset.x + 150;
                    const toY = target.top + offset.y + target.height / 2;

                    const path = `M${fromX},${fromY} C${fromX + 120},${fromY} ${
                      toX - 120
                    },${toY} ${toX},${toY}`;

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
                        transition={{ duration: 0.01 }}
                      />
                    );
                  })}
              </svg>

              <div
                ref={containerRef}
                style={{
                  position: "absolute",
                  top: !isLast
                    ? buttonRect.top + window.scrollY - buttonRect.height / 2
                    : buttonRect.top +
                      window.scrollY -
                      buttonRect.height / 2 -
                      window.innerHeight / 2,
                  left: buttonRect.right + 200,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  zIndex: 2,
                }}
              >
                {items.map((text, idx) => {
                  const offset = offsets[idx];
                  return (
                    <motion.div
                      key={text}
                      ref={(el) => (itemRefs.current[idx] = el)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={
                        pathsVisible
                          ? { opacity: 1, x: offset.x, y: offset.y }
                          : { opacity: 0 }
                      }
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15, delay: idx * 0.05 }}
                      className="standard-button neonGreen"
                    >
                      {idx === 3 ? (
                        <a
                          className="visitproject"
                          href={"/projects/" + project.slug.current}
                        >
                          see more
                        </a>
                      ) : idx === 2 ? (
                        <BlockContent blocks={project.recap} />
                      ) : (
                        text
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

const ProjectList = ({ projects }) => {
  // const containerRef = useRef(null);
  // const buttonRefs = useRef({});
  // const activeSlug = useRef(null);
  // const { width } = useWindowDimensions();

  const [openProjectId, setOpenProjectId] = useState(null);
  const [hoverProjectId] = useState(null);
  const buttonRefs = useRef({});
  const focusProject = (project) => {
    openProjectById(project.title);
    // openProject(project.title);
  };

  const openProjectById = (id) => {
    buttonRefs.current[id]?.openButton();
  };

  const hoverProject = (project) => {
    hoverProjectById(project.title, true);
    // openProject(project.title);
  };

  const unhoverProject = (project) => {
    hoverProjectById(project.title, false);
    // openProject(project.title);
  };

  const hoverProjectById = (id, bool) => {
    if (bool && openProjectId == null) {
      buttonRefs.current[id]?.hoverButton();
    } else {
      buttonRefs.current[id]?.unhoverButton();
    }
  };

  const closeAll = () => {
    Object.values(buttonRefs.current).forEach((ref) => ref?.closeButton());
    setOpenProjectId(null);
  };
  const closeAllExceptOpen = () => {
    Object.values(buttonRefs.current).forEach((ref) => {
      if (ref?.current !== openProjectId) {
        ref?.closeButton();
      }
    });
  };

  window.closeAllButtons = closeAll;
  window.focusProject = focusProject;
  window.hoverProject = hoverProject;
  window.unhoverProject = unhoverProject;
  window.closeAllExceptOpen = closeAllExceptOpen;

  return (
    <>
      <div className="projectList">
        {projects.map((project, index) => (
          <UnfoldingButtonMenu
            key={project.title}
            ref={(ref) => (buttonRefs.current[project.title] = ref)}
            project={project}
            openProjectId={openProjectId}
            hoverProjectId={hoverProjectId}
            onRequestOpen={(id) => setOpenProjectId(id)}
            isLast={index >= projects.length - 5}
          />
        ))}
      </div>
    </>
  );
};

export default ProjectList;
