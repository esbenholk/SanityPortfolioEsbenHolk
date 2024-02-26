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
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  const onHover = useCallback(
    (e, value) => {
      e.stopPropagation();

      if(value){
        props.stateChanger(props.post);
      } else {
        props.stateChanger(null);
      }
    
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
        {props.post.productImage ? <>
          {props.post.productImage.hotspot ? (
          <img
            src={urlFor(props.post.productImage.asset.url)}
            alt={props.post.productImage.alt}
            style={{
              objectPosition: `${props.post.productImage.hotspot.x * 100}% ${
                props.post.productImage.hotspot.y * 100
              }%`, zIndex: getRandomInt(200)
            }}
            className="post_card_image"
          />
        ) : (
          <img
            src={urlFor(props.post.productImage.asset.url)}
            alt={props.post.productImage.alt}
            className="post_card_image"
            style={{ zIndex: getRandomInt(200)}}
          />
        )}
        </> : <>
          {props.post.mainImage.hotspot ? (
          <img
            src={urlFor(props.post.mainImage.asset.url)}
            alt={props.post.mainImage.alt}
            style={{
              objectPosition: `${props.post.mainImage.hotspot.x * 100}% ${
                props.post.mainImage.hotspot.y * 100
              }%`, zIndex: getRandomInt(200)
            }}
            className="post_card_image"
          />
        ) : (
          <img
            src={urlFor(props.post.mainImage.asset.url)}
            alt={props.post.mainImage.alt}
            className="post_card_image"
            style={{ zIndex: getRandomInt(200)}}

          />
        )}
        </>}

      </Link>
    </div>
  );
}
