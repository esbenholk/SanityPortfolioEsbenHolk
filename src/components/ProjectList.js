import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import urlFor, { hotspotStyle } from "./functions/urlFor";
import Window from "./retro/Window";

// The full archive as a "tech specs" table; hovering a row pops a preview window
export default function ProjectList({ projectList }) {
  const [preview, setPreview] = useState(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Window title="C:\ARCHIVE\*.* — tech specs" className="archive">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Project</th>
              <th className="hide-sm">Category</th>
              <th className="hide-sm">Rating</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {projectList &&
              projectList.map((project) => (
                <tr
                  key={project.slug.current}
                  onMouseEnter={() => setPreview(project)}
                  onMouseLeave={() => setPreview(null)}
                >
                  <td>
                    <Link to={"/projects/" + project.slug.current}>
                      {project.title || "untitled"}
                    </Link>
                  </td>
                  <td className="hide-sm">
                    {project.categories &&
                      project.categories.map((category, index) => (
                        <Link key={index} to={"/" + category.slug.current}>
                          {category.title}
                          {index + 1 !== project.categories.length ? ", " : null}
                        </Link>
                      ))}
                  </td>
                  <td className="hide-sm stars">{project.star_rating}</td>
                  <td>
                    {project.year}
                    {project.yearString ? <u> {project.yearString}</u> : null}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Window>

      {preview && preview.mainImage && preview.mainImage.asset && (
        <div className="hover-preview" aria-hidden="true">
          <Window title={`${preview.title}.jpg`}>
            <img
              src={urlFor(preview.mainImage.asset).width(600).url()}
              alt=""
              style={hotspotStyle(preview.mainImage)}
            />
          </Window>
        </div>
      )}
    </motion.div>
  );
}
