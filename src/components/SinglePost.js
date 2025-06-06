import { useState, useEffect, useContext, useRef } from "react";

import AppContext from "../globalState";
import sanityClient from "../client";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Image from "./blocks/image";
import { Link } from "react-router-dom";

import BlockContent from "./blocks/BlockContent";

import useWindowDimensions from "./functions/useWindowDimensions";
import { Card } from "./horizontalScrollInfinite";
import { NavLink } from "react-router-dom";

export default function SinglePost({ updateSelectedProjectOnHover }) {
  const [singlePost, setSinglePost] = useState();
  const [nextPost, setnextPost] = useState();
  const [prevPost, setprevPost] = useState();
  const { slug } = useParams();
  const myContext = useContext(AppContext);
  const projectList = myContext.projectList;

  useEffect(() => {
    console.log("hej dont look at me");

    const el = document.getElementById("main");
    if (el) {
      el.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [slug]);

  // const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    // updateSelectedProjectOnHover(null);

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
  }, [slug, projectList, updateSelectedProjectOnHover]);

  if (!singlePost)
    return <p className="fixedMiddle standard-button"> content incoming... </p>;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-column align-center projectMedia fullWidthPadded"
    >
      <div className="postImage">
        <Image
          image={singlePost.mainImage}
          width={width - 20}
          height={height - 20}
          isFullHeight={true}
        />
      </div>

      {singlePost.imagesGallery &&
        singlePost.imagesGallery.map((image, index) => (
          <>
            <Card
              title={"card" + index}
              image={image}
              classes={""}
              width={width - 20}
              height={height}
            />
          </>
        ))}

      <div
        className="borderTop"
        style={{
          position: "relative",
          top: "5px",
          paddingTop: "10px",
          width: "100%",
        }}
      >
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
        <div className="standard-container background">
          {singlePost.recap && (
            // <div className="projectRecap">
            //   {singlePost.title && (
            //     <p className="standard-button">{singlePost.title}</p>
            //   )}

            //   <div>
            //     {singlePost.year && (
            //       <p className="standard-button">{singlePost.year}</p>
            //     )}

            //     {singlePost.recap && (
            //       <div className="standard-button">
            //         {" "}
            //         <BlockContent blocks={singlePost.recap} />
            //       </div>
            //     )}
            //   </div>
            // </div>
            <ProjectRecap singlePost={singlePost} />
          )}

          {singlePost.body && <BlockContent blocks={singlePost.body} />}

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
                    {index + 1 !== singlePost.categories.length ? "," : null}
                  </Link>
                ))}
              </div>
            </>
          )}

          {singlePost.tags && (
            <>
              <div className="flex-row align-left project_tags noshade">
                {singlePost.tags.map((tag, index) => (
                  <p className="tag project_tag" key={index}>
                    {tag}
                    {index + 1 !== singlePost.tags.length ? "," : null}
                  </p>
                ))}
              </div>
            </>
          )} */}
        </div>
      </div>

      {!window.location.pathname.includes("esben") ? (
        <>
          <nav className={"footer-nav"}>
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
          </nav>{" "}
        </>
      ) : (
        <>
          <nav className="footer-nav">
            <NavLink className="standard-button" to="/">
              Work
            </NavLink>
          </nav>
        </>
      )}
    </motion.div>
  );
}

const ProjectRecap = ({ singlePost }) => {
  const titleRef = useRef(null);
  const recapContainerRef = useRef(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!titleRef.current || !recapContainerRef.current) return;

    const titleBox = titleRef.current.getBoundingClientRect();
    const buttons =
      recapContainerRef.current.querySelectorAll(".standard-button");

    const newLines = Array.from(buttons).map((btn) => {
      const btnBox = btn.getBoundingClientRect();
      return {
        x1: titleBox.right,
        y1: titleBox.top + titleBox.height / 2,
        x2: btnBox.left,
        y2: btnBox.top + btnBox.height / 2,
      };
    });

    setLines(newLines);
  }, [singlePost]);

  return (
    <div
      className="projectRecap"
      style={{ position: "relative", zIndex: 9999999999 }}
    >
      {singlePost.title && (
        <p className="standard-button" ref={titleRef}>
          {singlePost.title}
        </p>
      )}

      <div
        ref={recapContainerRef}
        className="recap-buttons"
        style={{
          position: "absolute",
          top: "-130px",
          right: 0,
        }}
      >
        {singlePost.year && (
          <p className="standard-button offset-1">{singlePost.year}</p>
        )}

        {singlePost.recap && (
          <div className="standard-button offset-2">
            <BlockContent blocks={singlePost.recap} />
          </div>
        )}
      </div>

      {/* <svg
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      >
        {lines.map((line, i) => (
          <path
            key={i}
            d={`M${line.x1},${line.y1} C${line.x1 + 50},${line.y1} ${
              line.x2 - 50
            },${line.y2} ${line.x2},${line.y2}`}
            stroke="blue"
            fill="blue"
            strokeWidth="2"
          />
        ))}
      </svg> */}
    </div>
  );
};
