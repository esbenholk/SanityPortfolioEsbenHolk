import React, { useState, useCallback, useEffect } from "react";
import sanityClient from "../../client";
import { motion } from "framer-motion";
import imageUrlBuilder from "@sanity/image-url";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(sanityClient);

function urlFor(source) {
  return builder.image(source);
}

export default function Image(props) {
  const image = props.image;
  const classs = props.class;
  const width = props.width;
  const maxHeight = props.height;

  return (
    <>
      {image && (
        <>
          {image.hotspot ? (
            <LazyLoadImage
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={urlFor(image.asset).width(width).url()}
              placeholdersrc={urlFor(image.asset).height(2).url()}
              key={image.asset._ref}
              alt={image.alt}
              style={{
                objectPosition: `${image.hotspot.x * 100}% ${
                  image.hotspot.y * 100
                }%`,
                maxHeight: maxHeight,
              }}
              className={classs}
              effect="blur"
            />
          ) : (
            <LazyLoadImage
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={urlFor(image.asset).width(width).url()}
              placeholdersrc={urlFor(image.asset).height(2).url()}
              key={image.asset._ref}
              alt={image.alt}
              className={classs}
              effect="blur"
              style={{ maxHeight: maxHeight }}
            />
          )}
        </>
      )}
    </>
  );
}
