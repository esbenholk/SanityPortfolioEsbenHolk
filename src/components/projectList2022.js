import { useState } from "react";

import sanityClient from "../client";
import imageUrlBuilder from "@sanity/image-url";

import { motion } from "framer-motion";

import { toggleHover } from "./functions/toggleHover";
import useWindowDimensions from "./functions/useWindowDimensions";
import Gallery from "./Gallery";

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(sanityClient);

function urlFor(source) {
  return builder.image(source);
}

export default function Projects({
  projectList,
  updateSelectedProjectOnHover,
}) {
  const { width } = useWindowDimensions();
  const [isGallery, setIsGallery] = useState();

  function hover(e) {
    if (width > 600) {
      toggleHover({ e });
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fullWidthPadded padding-top"
    >
      {!isGallery ? (
        <div className="borderTop singlePost">
          {projectList &&
            projectList.map((project, index) => (
              <div key={index} className="projectList-item noshade">
                <div
                  onMouseEnter={hover}
                  onMouseLeave={hover}
                  className="noshade"
                >
                  {" "}
                  <a href={"/projects/" + project.slug.current}>
                    {project.title ? project.title : "undefined"}
                  </a>
                  {project.productImage ? (
                    <>
                      {project.productImage.hotspot ? (
                        <img
                          src={urlFor(project.productImage.asset.url)
                            .width(600)
                            .url()}
                          alt={project.productImage.alt}
                          style={{
                            objectPosition: `${
                              project.productImage.hotspot.x * 100
                            }% ${project.productImage.hotspot.y * 100}%`,
                          }}
                          className="thumbnail seeOnHover hidden"
                        />
                      ) : (
                        <img
                          src={urlFor(project.productImage.asset.url)
                            .width(600)
                            .url()}
                          alt={project.productImage.alt}
                          className="thumbnail seeOnHover hidden"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {project.mainImage.hotspot ? (
                        <img
                          src={urlFor(project.mainImage.asset.url)
                            .width(600)
                            .url()}
                          alt={project.mainImage.alt}
                          style={{
                            objectPosition: `${
                              project.mainImage.hotspot.x * 100
                            }% ${project.mainImage.hotspot.y * 100}%`,
                          }}
                          className="thumbnail seeOnHover hidden"
                        />
                      ) : (
                        <img
                          src={urlFor(project.mainImage.asset.url)
                            .width(600)
                            .url()}
                          alt={project.mainImage.alt}
                          className="thumbnail seeOnHover hidden"
                        />
                      )}
                    </>
                  )}
                </div>
                <p className="flex-row align-left">
                  {project.year ? project.year : "undefined"}{" "}
                  {project.yearString ? <u>{project.yearString}</u> : null}
                </p>
              </div>
            ))}
        </div>
      ) : (
        <div className="borderTop fullwidth">
          <Gallery
            updateSelectedProjectOnHover={updateSelectedProjectOnHover}
          />
        </div>
      )}
      <button
        style={{
          position: "fixed",
          bottom: "0px",
          right: "0px",
          margin: "10px",
        }}
        className="standard-button"
        onClick={() => {
          setIsGallery(!isGallery);
        }}
      >
        {isGallery ? "list" : "gallery"}
      </button>
    </motion.div>
  );
}
