// import React, { useState } from "react";
import React,{ useCallback} from "react";

import sanityClient from "../../client";

import { Link } from "react-router-dom";
// import BlockContent from "../blocks/BlockContent";

import imageUrlBuilder from "@sanity/image-url";
// import useWindowDimensions from "../functions/useWindowDimensions";

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(sanityClient);

function urlFor(source) {
  return builder.image(source);
}

export default function PostCard(props) {
  // const [isShown, setIsShown] = useState(false);

  // const { width } = useWindowDimensions();

  const onHover = useCallback(
    (e, value) => {
      e.stopPropagation();
      props.stateChanger(props.post);
    },
    [props]
  );


  return (
    <div
      className="post_card"
      onPointerOver={e => onHover(e, true)}
      onPointerOut={e => onHover(e, false)}
    >
      <Link
        to={"/projects/" + props.post.slug.current}
        key={props.post.slug.current}
        className="w-full teaser-link"
      >
        {/* {width > 700 && isShown ? (
          <div className="post_card_overlay seeOnHover">
            <div className="details">
              <h3>{post.title}</h3>
              <div className="flex-row">
                {post.tags &&
                  post.tags.map((tag, index) => (
                    <p className="tag" key={index}>
                      {tag}
                      {index + 1 !== post.tags.length ? "," : null}
                    </p>
                  ))}
              </div>
            </div>
            <BlockContent blocks={post.recap} />

            <div className="flex-row">
              {post.categories &&
                post.categories.map((category, index) => (
                  <p className="standard-button inverse" key={index}>
                    {" "}
                    {category.title}{" "}
                  </p>
                ))}
            </div>
          </div>
        ) : null} */}

        {props.post.mainImage.hotspot ? (
          <img
            src={urlFor(props.post.mainImage.asset.url)}
            alt={props.post.mainImage.alt}
            style={{
              objectPosition: `${props.post.mainImage.hotspot.x * 100}% ${
                props.post.mainImage.hotspot.y * 100
              }%`,
            }}
            className="post_card_image"
          />
        ) : (
          <img
            src={urlFor(props.post.mainImage.asset.url)}
            alt={props.post.mainImage.alt}
            className="post_card_image"
          />
        )}
      </Link>
    </div>
  );
}
