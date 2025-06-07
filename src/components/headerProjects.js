import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { NavLink } from "react-router-dom";

export default function ProjectMenu({ projects }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickAnywhere(event) {
      const isMenuButton = event.target.closest(".x");
      if (!isMenuButton) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickAnywhere);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAnywhere);
    };
  }, [open]);

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.1, // Slower open
        delayChildren: 0.1,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.05, // Faster close
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 30 },
    },
    closed: {
      opacity: 0,
      y: -20,
      scale: 0.5,
      transition: { duration: 0.01 },
    },
  };

  return (
    <div>
      <button
        className="standard-button"
        style={{ animation: "all 2s" }}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        {open ? "Works" : "Works"}
      </button>

      <AnimatePresence>
        {open && (
          <div className="menu-scroll-wrapper">
            <motion.div
              className="projectList"
              initial="closed"
              animate="open"
              exit="closed"
              variants={containerVariants}
            >
              {projects.map((project, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <NavLink
                    to={"/projects/" + project.slug.current}
                    className={({ isActive }) =>
                      isActive
                        ? "active standard-button x"
                        : "standard-button x"
                    }
                  >
                    {project.title}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
