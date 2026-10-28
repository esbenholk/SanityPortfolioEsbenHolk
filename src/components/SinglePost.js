import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import AppContext from "../globalState";
import sanityClient from "../client";
import BlockContent from "./blocks/BlockContent";
import YoutubeVideo from "./blocks/youtube";
import Window from "./retro/Window";
import FrameImage from "./retro/FrameImage";

const ABOUT_SLUG = "esben-holk-house-of-killing";

// Gallery entries are either { image } or { youtube: { url } }; skip empty slots
const mediaOf = (gallery) =>
  (gallery || []).filter(
    (item) => item && ((item.image && item.image.asset) || (item.youtube && item.youtube.url))
  );

export default function SinglePost() {
  const [singlePost, setSinglePost] = useState();
  const [slide, setSlide] = useState(0);
  const { slug } = useParams();
  const { projectList = [] } = useContext(AppContext);

  useEffect(() => {
    setSlide(0);
    sanityClient
      .fetch(
        `*[slug.current == $slug]{
          id,
          title,mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, body, year, abbreviated_year, imagesGallery, miniImagesGallery, star_rating ,slug, categories[]->{title, slug}, tags, color, recap, yearString, client, videos[]
        }`,
        { slug }
      )
      .then((data) => setSinglePost(data[0]))
      .catch(console.error);
  }, [slug]);

  if (!singlePost) {
    return <p className="loading blink">LOADING… PLEASE WAIT (56k)</p>;
  }

  const isAbout = slug === ABOUT_SLUG;
  const media = mediaOf(singlePost.imagesGallery);
  const current = media[slide % (media.length || 1)];

  const position = projectList.findIndex((post) => post.slug.current === slug);
  const prevPost = position > 0 ? projectList[position - 1] : null;
  const nextPost =
    position >= 0 && position < projectList.length - 1 ? projectList[position + 1] : null;

  const price =
    singlePost.abbreviated_year != null
      ? String(singlePost.abbreviated_year).padStart(2, "0")
      : singlePost.year
      ? String(singlePost.year).slice(-2)
      : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
        <Window
          title={isAbout ? "me.bmp" : `${singlePost.title}.exe`}
          className="product-detail__media"
        >
          {current ? (
            current.youtube ? (
              <div className="video-frame">
                <YoutubeVideo url={current.youtube.url} />
              </div>
            ) : (
              <FrameImage image={current.image} width={1400} className="frame-img--contain" />
            )
          ) : (
            <FrameImage image={singlePost.mainImage} width={1400} className="frame-img--contain" />
          )}

          {media.length > 1 && (
            <div className="media-nav">
              <button className="btn95" onClick={() => setSlide(slide - 1 + media.length)}>
                ◀
              </button>
              <span className="media-nav__count">
                {(slide % media.length) + 1} / {media.length}
              </span>
              <button className="btn95" onClick={() => setSlide(slide + 1)}>
                ▶
              </button>
            </div>
          )}
        </Window>

        <aside className="product-detail__info">
          <h1 className="page-title">{singlePost.title}</h1>
          {singlePost.star_rating && <p className="stars">{singlePost.star_rating}</p>}

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

          {price && !isAbout && (
            <div className="price-box">
              <span className="price">
                {price}
                <sup>99</sup>
              </span>
              <span className="burst burst--small">SALE</span>
            </div>
          )}

          {singlePost.recap && (
            <div className="recap blockContent">
              <BlockContent blocks={singlePost.recap} />
            </div>
          )}

          {!isAbout && (
            <div className="prev-next">
              {prevPost ? (
                <Link to={"/projects/" + prevPost.slug.current} className="btn95">
                  ◀ PREV
                </Link>
              ) : (
                <span />
              )}
              {nextPost && (
                <Link to={"/projects/" + nextPost.slug.current} className="btn95">
                  NEXT ▶
                </Link>
              )}
            </div>
          )}
        </aside>
      </div>

      {singlePost.body && (
        <Window title={isAbout ? "about_me.txt" : "readme.txt"} className="product-body">
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
                className={`thumb ${index === slide % media.length ? "is-on" : ""}`}
                onClick={() => setSlide(index)}
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
