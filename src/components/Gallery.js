import React, { useContext, useEffect, useState, useCallback } from "react";

import { motion } from "framer-motion";

import Projects from "./blocks/Projects";

import AppContext from "../globalState";

import Cross from "./cross";


export default function Gallery() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;
  const projectList = myContext.projectList;

  const [selectedProject, setSelectedProject] = useState({});

  const updateSelectedProjectOnHover = useCallback((project) => {
    setSelectedProject(project);
  }, []);

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
  }, [myContext.hasFeaturedPosts, projectList, info]);

  return (
        <>
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="projectContainer"
            // style={{ backgroundImage: `url(${info.backgroundImage.asset.url})` }}
          >
            {projectList ? (
              <Projects
                projectList={projectList}
                show_categories={true}
                show_tags={true}
                stateChanger={updateSelectedProjectOnHover}
              />
            ) : null}
          </motion.div>
          <Cross selectedProject={selectedProject}/>

          </>
        );
       
}