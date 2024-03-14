import React, { useState, useEffect, useContext } from "react";

import AppContext from "../globalState";
import sanityClient from "../client";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Image from "./blocks/image";
import Projects from "./projectList2022";
import { Link } from "react-router-dom";

import BlockContent from "./blocks/BlockContent";

import useWindowDimensions from "./functions/useWindowDimensions";
import HorizontalScrollComp from "./horizontalScroll";
import { NavLink } from "react-router-dom";

import EmptyBoids from "./three/emptyBoids";

import YoutubeVideo from "./blocks/youtube";

export default function SinglePost({updateSelectedProjectOnHover, listIsActive, threedIsActive, galleryIsActive}) {
  const [singlePost, setSinglePost] = useState();
  const [nextPost, setnextPost] = useState();
  const [prevPost, setprevPost] = useState();
  const { slug } = useParams();
  const myContext = useContext(AppContext);
  const projectList = myContext.projectList;

 
  const { width, height } = useWindowDimensions();

  console.log("oh its u bitch. figured you'd sneak a peak at the code", singlePost);

  useEffect(() => {
    updateSelectedProjectOnHover(null);

    sanityClient
      .fetch(
        `*[slug.current == "${slug}"]{
          id,
          title,mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, body, year, abbreviated_year, imagesGallery, miniImagesGallery, star_rating ,slug, categories[]->{title, slug}, tags, color, recap, yearString, client, videos[]
        }`
      )
      .then((data) => {
        setSinglePost(data[0]);
  


        for (let index = 0; index < projectList.length; index++) {
    
          if (
            projectList[index].title === data[0].title &&
            index + 1 <= projectList.length
          ) {
            setnextPost(projectList[index + 1]);
          }
          if (projectList[index].title === data[0].title && !index - 1 <= 0) {
            setprevPost(projectList[index - 1]);
          }
        }
      })
      .catch(console.error);
  }, [slug, projectList,updateSelectedProjectOnHover]);

  if (!singlePost) return <p className="fixedMiddle standard-button"> content incoming... </p>;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fullWidthPadded"
      >
 

        <div className="singlePost post_details">
            <div className="borderTop" style={{zIndex: "9999999999",position: width>600?"absolute":"relative", top: width>600?"50px": "100px", width: "100%"}}>
              <div className="flex-row align-top project_directory_line noshade">
                <a href="/projects">{"Project >"}</a>
                <div className="flex-row align-left noshade">
                  {singlePost.categories &&
                    singlePost.categories.map((category, index) => (
                      <Link
                        to={"../" + category.slug.current}
                        className=""
                        key={index}
                      >
                        {category.title}
                        {index + 1 !== singlePost.categories.length ? "," : null}
                      </Link>
                    ))}
                  <p>{" > "}</p>
                </div>
              </div>
              <div className="standard-container projectnamecontainer projectDetails background" >
                  {singlePost.title && (
                    <p className="projectTitle">{singlePost.title}</p>
                  )}

                  {singlePost.recap && ( 
                    <div className="projectRecap">
                      <BlockContent blocks={singlePost.recap} />
                    </div>
                  )}

                  {listIsActive && singlePost.body ? 
                  <div className="authorInfo">
                    <BlockContent blocks={singlePost.body} />
                  </div> 
                  : window.location.pathname.includes("esben") && singlePost.body ?  
                  <div className="authorInfo">
                    <BlockContent blocks={singlePost.body} />
                  </div> 
                  : null}
                 
                  {/* {singlePost.categories && (
                    <>
                      <div className="flex-row align-left">
                        {singlePost.categories.map((category, index) => (
                          <Link
                            to={"../" + category.slug.current}
                            className="tag project_tag"
                            key={index}
                          >
                            {category.title}
                            {index + 1 !== singlePost.categories.length
                              ? ","
                              : null}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}

                {singlePost.tags && (
                  <>
                    <div className="flex-row align-left project_tags noshade">
                        {
                          singlePost.tags.map((tag, index) => (
                            <p className="tag project_tag" key={index}>
                              {tag}
                              {index + 1 !== singlePost.tags.length ? "," : null}
                            </p>
                          ))}
                        
                    </div>
                  
                  </>
                )} */}

   
             
          


              </div>
              {singlePost.year && (
                <p className="standard-container projectYear background" style={{zIndex: "20"}}>{singlePost.year}</p>
              )}
            </div>
        </div>

        {(singlePost.mainImage && listIsActive && width > 600) || window.location.pathname.includes("esben") ? <div className="mainImage"><Image image={singlePost.mainImage} height={height} width={width}/></div> : null}
        {singlePost.imagesGallery && galleryIsActive && width > 600 ? 
            <HorizontalScrollComp images={singlePost.imagesGallery} height={height}/> 
            : singlePost.imagesGallery && galleryIsActive  && 
              <div className="flex-column align-center projectMedia">
                {singlePost.imagesGallery.map((image, index)=>(
                  <>     
                  {image.youtube ? <YoutubeVideo url={image.youtube.url}/> : <Image image={image.image} width={width-20}/>}
                  </>
                ))}
              </div>
          }

          {singlePost.imagesGallery && threedIsActive && <EmptyBoids media={singlePost.imagesGallery}></EmptyBoids>}
          

          {!window.location.pathname.includes("esben") ? 
          <>           
            <nav
             className={
               "footer-nav"
             }
            >
            {prevPost && (
              <NavLink to={prevPost.slug.current} className="standard-button">
                Prev
              </NavLink>
            )}
            {nextPost && (
              <NavLink to={nextPost.slug.current} className="standard-button">
                Next
              </NavLink>
            )}
            </nav> </>: 
            <>
              {width < 600 && <Projects projectList={projectList} />}
              <nav className="footer-nav">
                  <NavLink className="standard-button" to="/">
                    Work
                  </NavLink>
            </nav>
            </>
        }
      
      </motion.div>
    </>
  );
}
