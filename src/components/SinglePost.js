import React, { useState, useEffect } from "react";
import sanityClient from "../client";
import { useParams } from "react-router-dom";
// import BlockContent from "@sanity/block-content-to-react";
import ProductCard from "./blocks/productCard";
import { motion } from "framer-motion";
import Image from "./blocks/image";
import CustomCarousel from "./blocks/Carousel";
import { Link } from "react-router-dom";

import BlockContent from "./blocks/BlockContent";

import Masonry from "react-masonry-css";

import useWindowDimensions from "./functions/useWindowDimensions";

const breakpointColumnsObj = {
  default: 2,
};
const minibreakpointColumnsObj = {
  default: 4,
};

export default function SinglePost({ updatebasket, basket }) {
  const [singlePost, setSinglePost] = useState();
  const [relatedPost, setRelatedPost] = useState();
  const { slug } = useParams();
  const { width } = useWindowDimensions();

  useEffect(() => {
    sanityClient
      .fetch(
        `*[slug.current == "${slug}"]{
          title,mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, body, year, abbreviated_year, imagesGallery, miniImagesGallery, star_rating ,slug, categories[]->{title, slug}, tags, color, recap, yearString, client
        }`
      )
      .then((data) => {
        setSinglePost(data[0]);
        sanityClient
          .fetch(
            '*[_type == "project"]{title,mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, year, abbreviated_year, star_rating ,slug, categories[]->{title, slug}, tags, color, recap, yearString}'
          )
          .then((relatedData) => {
            const relatedProjects = [];
            if (data[0].tags) {
              for (let index = 0; index < relatedData.length; index++) {
                const post = relatedData[index];
                if (post.title !== data[0].title) {
                  if (
                    post.tags &&
                    post.tags.some((r) => data[0].tags.includes(r))
                  ) {
                    relatedProjects.push(post);
                  }
                }
              }
              setRelatedPost(relatedProjects);
            }
          })
          .catch(console.error);
      })
      .catch(console.error);
  }, [slug]);

  function listenScrollEvent() {}

  window.addEventListener("scroll", listenScrollEvent);

  if (!singlePost) return <div>Loading...</div>;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fullWidthPadded"
      >
        <article>
          <div className="flex-row align-top project_directory_line">
            <a href="/projects">{"Project >"}</a>
            <div className="flex-row align-left">
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
          <div className="flex-column align-top justifyBetween">
            <div className="flex-column contentColumn">
              {width < 600 ? (
                <>
                  {singlePost.imagesGallery.length > 1 ? (
                    <CustomCarousel arrows={false} swipe={true} classsss={""}>
                      {singlePost.imagesGallery.map((image, index) => (
                        <div className="squareImage" key={index}>
                          <Image image={image} />
                        </div>
                      ))}
                    </CustomCarousel>
                  ) : (
                    <Image
                      image={singlePost.productImage}
                      class={"mainImage fullwidth"}
                    />
                  )}
                </>
              ) : (
                <>
                  {singlePost.imagesGallery &&
                  singlePost.imagesGallery.length > 1 ? (
                    <Masonry
                      breakpointCols={breakpointColumnsObj}
                      className="my-masonry-grid "
                      columnClassName="my-masonry-grid_column singleProjectMasonry"
                    >
                      {singlePost.imagesGallery.map((image, index) => (
                        <div key={index}>
                          <Image image={image} />
                        </div>
                      ))}
                    </Masonry>
                  ) : (
                    <>
                      {singlePost.productImage && (
                        <Image
                          image={singlePost.productImage}
                          class={"mainImage fullwidth"}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
            <div>
              <header className="flex-row align-top justifyBetween">
                <h2 className="projectTitle">{singlePost.title}</h2>
              </header>

              <div className="flex-row align-left project_tags">
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

              <div className="flex-row align-left project_tags">
                {singlePost.tags &&
                  singlePost.tags.map((tag, index) => (
                    <p className="tag project_tag" key={index}>
                      {tag}
                      {index + 1 !== singlePost.tags.length ? "," : null}
                    </p>
                  ))}
              </div>

              {singlePost.star_rating ? (
                <p className="stars">{singlePost.star_rating}</p>
              ) : null}

              <div className="flex-row project_details">
                {singlePost.client && (
                  <>
                    <p>Collaborator: </p>
                    <p className="project_tag">{singlePost.client}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="contentColumn">
            {singlePost.recap && (
              <div className="recap">
                <BlockContent blocks={singlePost.recap} />
              </div>
            )}

            {singlePost.body && (
              <div className="content">
                <div className="flex-row justifyBetween header">
                  <h2 className="projectTitle">{singlePost.title}</h2>

                  <img
                    src="../assets/Arrowright.svg"
                    className="arrow"
                    alt="down arrow button"
                    style={{
                      transform: "rotate(90deg)",
                    }}
                  />
                </div>
                <div className="contentBlock">
                  <BlockContent blocks={singlePost.body} />
                </div>
              </div>
            )}

            {singlePost.miniImagesGallery &&
            singlePost.miniImagesGallery.length > 0 ? (
              <Masonry
                breakpointCols={minibreakpointColumnsObj}
                className="my-masonry-grid "
                columnClassName="my-masonry-grid_column singleProjectMasonry"
              >
                {singlePost.miniImagesGallery.map((image, index) => (
                  <div key={index}>
                    <Image image={image} />
                  </div>
                ))}
              </Masonry>
            ) : null}
          </div>
        </article>
      </motion.div>
      <div className="regContainer">
        {relatedPost && relatedPost.length !== 0 ? (
          <>
            <motion.h1 className="flex-column fullWidthPadded">
              Related Projects
            </motion.h1>
            <div className="overscrollPadded horizontalScroll2">
              {relatedPost.map((post, index) => (
                <ProductCard post={post} key={index} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
