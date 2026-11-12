import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import AppContext from "../globalState";
import BlockContent from "./blocks/BlockContent";
import Window from "./retro/Window";
import FrameImage from "./retro/FrameImage";
import MediaCarousel from "./retro/MediaCarousel";
import useFitToScreen from "./functions/useFitToScreen";
import useProject, { projectMedia } from "./functions/useProject";

const ABOUT_SLUG = "esben-holk-house-of-killing";

export default function SinglePost() {
  const [slide, setSlide] = useState(0);
  const { slug } = useParams();
  const singlePost = useProject(slug);
  const { projectList = [] } = useContext(AppContext);
  const carouselRef = useRef(null);

  // crumbs + media window fill the screen below the header (on phones the header moves below)
  const viewportRef = useRef(null);
  const mediaRef = useRef(null);
  const mediaHeight = useFitToScreen(viewportRef, mediaRef, {
    min: 220,
    enabled: Boolean(singlePost),
  });

  useEffect(() => {
    setSlide(0);
  }, [slug]);

  if (!singlePost) {
    return <p className="loading blink">LOADING… PLEASE WAIT (56k)</p>;
  }

  const isAbout = slug === ABOUT_SLUG;
  const media = projectMedia(singlePost);

  const position = projectList.findIndex((post) => post.slug.current === slug);
  const prevPost = position > 0 ? projectList[position - 1] : null;
  const nextPost =
    position >= 0 && position < projectList.length - 1
      ? projectList[position + 1]
      : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="crumbs">
        <Link to="/projects">ARCHIVE</Link>
        {singlePost.categories &&
          singlePost.categories.map((category, index) => (
            <React.Fragment key={index}>
              <span>›</span>
              <Link to={"/" + category.slug.current}>{category.title}</Link>
            </React.Fragment>
          ))}
        <span>›</span>
        <span>{singlePost.title}</span>
      </div>

      <div className="product-detail">
        <div className="product-detail__media-wrap fit-zone" ref={mediaRef}>
          <Window
            title={isAbout ? "me.bmp" : `${singlePost.title}.exe`}
            className="product-detail__media"
          >
            <MediaCarousel
              key={slug}
              className="fit-target"
              ref={carouselRef}
              items={media}
              height={mediaHeight}
              viewportRef={viewportRef}
              onIndexChange={setSlide}
            />

            {media.length > 1 && (
              <div className="media-nav">
                <button
                  className="btn95"
                  onClick={() => carouselRef.current.step(-1)}
                >
                  ◀
                </button>
                <span className="media-nav__count">
                  {slide + 1} / {media.length}
                </span>
                <button
                  className="btn95"
                  onClick={() => carouselRef.current.step(1)}
                >
                  ▶
                </button>
              </div>
            )}
          </Window>
        </div>

        <aside className="product-detail__info">
          <h1 className="page-title">{singlePost.title}</h1>
          {singlePost.star_rating && (
            <p className="stars">{singlePost.star_rating}</p>
          )}

          {!isAbout && (
            <dl className="spec-list">
              {singlePost.year && (
                <>
                  <dt>Year</dt>
                  <dd>
                    {singlePost.year}
                    {singlePost.yearString ? ` ${singlePost.yearString}` : ""}
                  </dd>
                </>
              )}
              {singlePost.client && (
                <>
                  <dt>Collaborator(s)</dt>
                  <dd>{singlePost.client}</dd>
                </>
              )}
              {singlePost.categories && (
                <>
                  <dt>Category</dt>
                  <dd>
                    {singlePost.categories.map((category, index) => (
                      <Link to={"/" + category.slug.current} key={index}>
                        {category.title}
                        {index + 1 !== singlePost.categories.length ? ", " : ""}
                      </Link>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          )}

          {singlePost.tags && (
            <div className="tag-chips">
              {singlePost.tags.map((tag, index) => (
                <span className="chip" key={index}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* {price && !isAbout && (
            <div className="price-box">
              <span className="price">
                {price}
                <sup>99</sup>
              </span>
              <span className="burst burst--small">SALE</span>
            </div>
          )} */}

          {singlePost.recap && (
            <div className="recap blockContent">
              <BlockContent blocks={singlePost.recap} />
            </div>
          )}

          {!isAbout && (
            <div className="prev-next">
              {prevPost ? (
                <Link
                  to={"/projects/" + prevPost.slug.current}
                  className="btn95"
                >
                  ◀ PREV
                </Link>
              ) : (
                <span />
              )}
              {nextPost && (
                <Link
                  to={"/projects/" + nextPost.slug.current}
                  className="btn95"
                >
                  NEXT ▶
                </Link>
              )}
            </div>
          )}
        </aside>
      </div>

      {singlePost.body && (
        <Window
          title={isAbout ? "about_me.txt" : "readme.txt"}
          className="product-body"
        >
          <div className="blockContent">
            <BlockContent blocks={singlePost.body} />
          </div>
        </Window>
      )}

      {media.length > 1 && (
        <Window title="gallery" className="product-gallery">
          <div className="thumb-strip">
            {media.map((item, index) => (
              <button
                key={index}
                className={`thumb ${index === slide ? "is-on" : ""}`}
                onClick={() => carouselRef.current.goTo(index)}
                aria-label={`Show item ${index + 1}`}
              >
                {item.youtube ? (
                  <span className="thumb__video">▶ VIDEO</span>
                ) : (
                  <FrameImage image={item.image} width={300} />
                )}
              </button>
            ))}
          </div>
        </Window>
      )}
    </motion.div>
  );
}
