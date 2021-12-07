import React from "react";

import sanityClient from "../client";

import imageUrlBuilder from "@sanity/image-url";

import { motion } from "framer-motion";

import { toggleHover } from "./functions/toggleHover";

import useWindowDimensions from "./functions/useWindowDimensions";

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(sanityClient);

function urlFor(source) {
  return builder.image(source);
}
function hover(e) {
  toggleHover({ e });
}

export default function Projects({ projectList }) {
  const { width } = useWindowDimensions();

  return (
    <motion.div
      className="projectList fullWidthPadded"
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="projectList-item">
        {width > 900 ? (
          <div className="categories">
            <h2>Category</h2>
          </div>
        ) : null}
        <div>
          <h2>Project</h2>
        </div>
        <h2>Year</h2>
      </div>
      {projectList &&
        projectList.map((project, index) => (
          <div key={index} className="projectList-item">
            {width > 900 ? (
              <div className="categories">
                {project.categories &&
                  project.categories.map((category, index) => (
                    <a
                      key={index}
                      id={"category_" + category.title + ""}
                      href={category.slug.current}
                    >
                      {category.title}
                      {index + 1 !== project.categories.length ? ", " : null}
                    </a>
                  ))}
              </div>
            ) : null}
            <div onMouseEnter={hover} onMouseLeave={hover}>
              {" "}
              <a href={"/projects/" + project.slug.current}>
                {project.title ? project.title : "undefined"}
              </a>
              {project.mainImage.hotspot ? (
                <img
                  src={urlFor(project.mainImage.asset.url).url()}
                  alt={project.mainImage.alt}
                  style={{
                    objectPosition: `${project.mainImage.hotspot.x * 100}% ${
                      project.mainImage.hotspot.y * 100
                    }%`,
                  }}
                  className="thumbnail seeOnHover hidden"
                />
              ) : (
                <img
                  src={urlFor(project.mainImage.asset.url).url()}
                  alt={project.mainImage.alt}
                  className="thumbnail seeOnHover hidden"
                />
              )}
            </div>
            <p className="flex-row align-left">
              {project.year ? project.year : "undefined"}{" "}
              {project.yearString ? <u>{project.yearString}</u> : null}
            </p>
          </div>
        ))}
    </motion.div>
  );
}
