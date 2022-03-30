import React, { useContext, useEffect, useState } from "react";

import { motion } from "framer-motion";

import Projects from "./blocks/Projects";

import AppContext from "../globalState";

import CustomCarousel from "./blocks/Carousel";
import Image from "./blocks/image";

import BlockContent from "./blocks/BlockContent";

export default function LandingPage() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;
  const projectList = myContext.projectList;
  console.log("background image", info.backgroundImage);

  const [featuredProjects, setFeaturedProjects] = useState([]);
  console.log(featuredProjects);

  useEffect(() => {
    if (myContext.hasFeaturedPosts === true && projectList) {
      const featuredProjects = [];
      for (let index = 0; index < projectList.length; index++) {
        const post = projectList[index];
        if (info.featuredProjects.includes(post.title)) {
          featuredProjects.push(post);
        }
      }
      setFeaturedProjects(featuredProjects);
    }

    const script = document.createElement("script");
  }, [myContext.hasFeaturedPosts, projectList, info]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // style={{ backgroundImage: `url(${info.backgroundImage.asset.url})` }}
    >
      <motion.div className="headline flex-column fullWidthPadded noshade">
        <BlockContent blocks={info.greeting} class="noshade" />
      </motion.div>

      <div className="flex-column contentColumn borderTop">
        <div className="flex-row align-center ">
          <>
            {info.mainImages ? (
              <CustomCarousel arrows={true} swipe={true} classsss={"circle"}>
                {info.mainImages.map((image, index) => (
                  <div key={index}>
                    <Image image={image} class={"mainImage fullwidth"} />
                  </div>
                ))}
              </CustomCarousel>
            ) : (
              <>
                {info.mainImage ? (
                  <Image image={info.mainImage} class={"mainImage fullwidth"} />
                ) : null}
              </>
            )}
          </>
        </div>
      </div>

      {projectList ? (
        <Projects
          projectList={projectList}
          show_categories={false}
          show_tags={false}
        />
      ) : null}
    </motion.div>
  );
}
