import React, { useState, useEffect, useContext } from "react";

import AppContext from "../globalState";
import sanityClient from "../client";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Image from "./blocks/image";
import CustomCarousel from "./blocks/Carousel";
import { Link } from "react-router-dom";

import BlockContent from "./blocks/BlockContent";

import Masonry from "react-masonry-css";

import useWindowDimensions from "./functions/useWindowDimensions";

const minibreakpointColumnsObj = {
  default: 4,
};

export default function SinglePost() {
  const [singlePost, setSinglePost] = useState();
  const [nextPost, setnextPost] = useState();
  const [prevPost, setprevPost] = useState();
  const { slug } = useParams();
  const { height } = useWindowDimensions();
  const [mainImageHeight, setMainImageHeight] = useState();
  const myContext = useContext(AppContext);
  const projectList = myContext.projectList;

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
    sanityClient
      .fetch(
        `*[slug.current == "${slug}"]{
          id,
          title,mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, body, year, abbreviated_year, imagesGallery, miniImagesGallery, star_rating ,slug, categories[]->{title, slug}, tags, color, recap, yearString, client
        }`
      )
      .then((data) => {
        setSinglePost(data[0]);
        console.log("singlepost:", data[0], projectList);

        for (let index = 0; index < projectList.length; index++) {
          console.log(
            "in the loop",
            index,
            projectList[index].title,
            data[0].title
          );
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

  useEffect(() => {
    setMainImageHeight(height - 300);
  }, [height]);

  if (!singlePost) return <div>Loading...</div>;

  return (
    <>
    <div style={{height: "100px"}}></div>
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fullWidthPadded"
      >
        <div
          className={
            prevPost
              ? " fixedUnderHeader noshade"
              : " fixedUnderHeader align-right noshade"
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
        </div>

        <article className="borderTop singlePost">
          <div className="flex-row align-top project_directory_line noshade">
            <a href="/projects">{"Project >"}</a>
            <div className="flex-row align-left noshade">
              {singlePost.categories &&
                singlePost.categories.map((category, index) => (
                  <Link
                    to={"../" + category.slug.current}
                    className="tag project_tag"
                    key={index}
                  >
                    {category.title}
                    {index + 1 !== singlePost.categories.length ? "," : null}
                  </Link>
                ))}
              <p>{" > "}</p>
            </div>
            <p>{singlePost.title}</p>
          </div>

          <div className="flex-column contentColumn">
            <div className="flex-row align-center">
              {singlePost.imagesGallery &&
              singlePost.imagesGallery.length > 1 ? (
                <CustomCarousel arrows={true} swipe={true} classsss={""}>
                  {singlePost.imagesGallery.map((image, index) => (
                    <div className="project_main_image" key={index}>
                      <Image image={image} mainImageHeight={mainImageHeight} />
                    </div>
                  ))}
                </CustomCarousel>
              ) : (
                <div className="project_main_image">
                  <Image
                    image={singlePost.mainImage}
                    mainImageHeight={mainImageHeight}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <header className="flex-row align-top justifyBetween noshade">
              <h2 className="projectTitle">{singlePost.title}</h2>
            </header>

            <div className="flex-row align-left project_tags noshade">
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
              {singlePost.year && (
                <>
                  <p className="flex-row align-left project_tag">
                    {singlePost.year ? singlePost.year : "undefined"}{" "}
                    {singlePost.yearString ? (
                      <u>{singlePost.yearString}</u>
                    ) : null}
                  </p>
                </>
              )}
            </div>

            <div className="flex-row align-left project_tags noshade">
              {singlePost.tags &&
                singlePost.tags.map((tag, index) => (
                  <p className="tag project_tag" key={index}>
                    {tag}
                    {index + 1 !== singlePost.tags.length ? "," : null}
                  </p>
                ))}
            </div>

            <div className="flex-row project_details noshade">
              {singlePost.client && (
                <>
                  <p>Collaborator(s): </p>
                  <p className="project_tag">{singlePost.client}</p>
                </>
              )}
            </div>
          </div>

          <div className="contentColumn ">
            {singlePost.recap && (
              <div className="recap noshade">
                <BlockContent blocks={singlePost.recap} />
              </div>
            )}

            {singlePost.body && (
              <div className="content">
                <div className="flex-row justifyBetween header noshade">
                  <h2 className="projectTitle">{singlePost.title}</h2>

                  <button
                    onClick={scrollToBottom}
                    className="arrow"
                    style={{ transform: "rotate(90deg)" }}
                  >
                    {">"}
                  </button>
                </div>
                <div className="contentBlock noshade">
                  <BlockContent blocks={singlePost.body} class="noshade" />
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

            <div className="flex-row align-right header">
              <button
                onClick={scrollToTop}
                className="arrow"
                style={{ transform: "rotate(-90deg)" }}
              >
                {">"}
              </button>
            </div>
            <div className="borderTop"></div>
          </div>
        </article>
      </motion.div>
    </>
  );
}
