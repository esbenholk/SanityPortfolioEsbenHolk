import React, { useState, useEffect, useContext } from "react";

import AppContext from "../globalState";
import sanityClient from "../client";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Image from "./blocks/image";
// import CustomCarousel from "./blocks/Carousel";
import { Link } from "react-router-dom";

import BlockContent from "./blocks/BlockContent";

import Masonry from "react-masonry-css";

import useWindowDimensions from "./functions/useWindowDimensions";

import { NavLink } from "react-router-dom";


const minibreakpointColumnsObj = {
  default: 2,
};

export default function SinglePost() {
  const [singlePost, setSinglePost] = useState();
  const [nextPost, setnextPost] = useState();
  const [prevPost, setprevPost] = useState();
  const { slug } = useParams();
  const [mainImageHeight, setMainImageHeight] = useState();
  const myContext = useContext(AppContext);
  const projectList = myContext.projectList;

 
  const { width } = useWindowDimensions();

  console.log("oh its u bitch. figured you'd sneak a peak at the code");

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const scrollToBottom = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if(window.location.pathname.includes("esben")){
      setMainImageHeight(500);

    }else{
      setMainImageHeight(1000000);

    }
    sanityClient
      .fetch(
        `*[slug.current == "${slug}"]{
          id,
          title,mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, body, year, abbreviated_year, imagesGallery, miniImagesGallery, star_rating ,slug, categories[]->{title, slug}, tags, color, recap, yearString, client
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
  }, [slug, projectList]);



  if (!singlePost) return <p className="fixedMiddle standard-button"> content incoming... </p>;


  return (
    <>

    <div style={{height: "110px"}}></div>
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fullWidthPadded"
      >

     
          {!window.location.pathname.includes("esben") ? 
            <nav
             className={
               "footer-nav"
             }
            >
            {prevPost && (
              <a href={prevPost.slug.current} className="standard-button">
                Prev
              </a>
            )}
            {nextPost && (
              <a href={nextPost.slug.current} className="standard-button">
                Next
              </a>
            )}
            </nav> : 
              <nav className="footer-nav">
                  <NavLink className="standard-button" to="/gallery">
                    Gallery
                  </NavLink>

                  <NavLink className="standard-button" to="/gallery">
                    Gallery
                  </NavLink>
            </nav>
        }
      
      
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
        
          
        <article className="borderTop singlePost">

  
            <div className="standard-container projectnamecontainer projectDetails background">
                  {singlePost.title && (
                    <p className="projectTitle">{singlePost.title}</p>
                  )}
                  {singlePost.categories && (
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
                )}

                <div className="flex-row project_details noshade">
                    {singlePost.client && (
                      <>
                        <p>Collaborator(s): </p>
                        <p className="project_tag">{singlePost.client}</p>
                      </>
                    )}
                </div>
             
                {singlePost.recap && ( 
                    <div className="projectRecap">
                      <BlockContent blocks={singlePost.recap} />
                    </div>
                  )}
            </div>


     
            {singlePost.year && (
                    <p className="standard-container projectYear background">{singlePost.year}</p>
              )}
          
        
        
      

    
   

          <div className="flex-column contentColumn" style={{position: width>600 ? "absolute" : "relative", top: width>600 ? "-170px" : "0", overflow: "scroll", zIndex: "-10"}}>
            <div className="flex-row align-center" style={{maxHeight: window.location.pathname.includes("esben") ?  "600px" : null}} >
              {singlePost.imagesGallery &&
                singlePost.imagesGallery.length > 1 ? (
                // <CustomCarousel arrows={true} swipe={true} classsss={""}>
                //   {singlePost.imagesGallery.map((image, index) => (
                //     <div className="project_main_image" key={index}>
                //       <Image image={image} mainImageHeight={mainImageHeight} />
                //     </div>
                //   ))}
                // </CustomCarousel>
          
                  singlePost.imagesGallery.map((image, index) => (
                    <div className="project_main_image" key={index}>
                      <Image image={image} mainImageHeight={mainImageHeight} />
                    </div>
                  ))

              ) : (
                <div className="project_main_image">
                  <Image
                    image={singlePost.mainImage}
                    mainImageHeight={mainImageHeight}
                  />
                </div>
              )}
            </div>



            <div className="contentColumn">
   

   {singlePost.body && (
     <div className="standard-container projectnamecontainer ">
       <div className="flex-row justifyBetween header noshade projectRecap">
         <h2 className="projectTitle">{singlePost.title}</h2>

         <button
           onClick={scrollToBottom}
           className="arrow"
           style={{ transform: "rotate(90deg)" }}
         >
           {">"}
         </button>
       </div>
         <BlockContent blocks={singlePost.body} class="noshade" />
         <div className="projectHeader"></div>

         <div className="flex-row align-right header projectRecap">
         <button
           onClick={scrollToTop}
           className="arrow"
           style={{ transform: "rotate(-90deg)" }}
         >
           {">"}
         </button>
       </div>
     </div>
   )}

        {singlePost.miniImagesGallery &&
        singlePost.miniImagesGallery.length > 0 ? (
          <Masonry
            breakpointCols={minibreakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column singleProjectMasonry"
          >
            {singlePost.miniImagesGallery.map((image, index) => (
              <div key={index}>
                <Image image={image} />
              </div>
            ))}
          </Masonry>
        ) : null}


        <div className="borderTop"></div>
        <div className="projectHeader"></div>
      </div>
          </div>



      
        </article>
      </motion.div>
    </>
  );
}
