import React, { useState } from "react";
import sanityClient from "../../client";

import { Link } from "react-router-dom";
import BlockContent from "../blocks/BlockContent";

import imageUrlBuilder from "@sanity/image-url";
import useWindowDimensions from "../functions/useWindowDimensions";

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(sanityClient);

function urlFor(source) {
  return builder.image(source);
}

export default function PostCard({ post }) {
  const [isShown, setIsShown] = useState(false);

  const { width } = useWindowDimensions();

  var color;
  if (post.color) {
    color = post.color;
  } else {
    color = "#2eff00";
  }

  return (
    <div
      className="post_card"
      onMouseEnter={() => setIsShown(true)}
      onMouseLeave={() => setIsShown(false)}
    >
      {width > 700 && isShown ? (
        <div
          className="post_card_overlay seeOnHover"
          style={{ backgroundColor: color }}
        >
          <div className="details">
            <Link
              to={"/projects/" + post.slug.current}
              key={post.slug.current}
              className="w-full teaser-link"
            >
              <h3>{post.title}</h3>
            </Link>

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
                <p className="standardTransparent-button" key={index}>
                  {" "}
                  {category.title}{" "}
                </p>
              ))}
          </div>
          <Link
            to={"/projects/" + post.slug.current}
            key={post.slug.current}
            className="w-full teaser-link"
          >
            <img
              src="assets/Arrowright.svg"
              className="arrow"
              alt="right arrow button"
            />
          </Link>
        </div>
      ) : null}

      {post.mainImage.hotspot ? (
        <img
          src={urlFor(post.mainImage.asset.url)}
          alt={post.mainImage.alt}
          style={{
            objectPosition: `${post.mainImage.hotspot.x * 100}% ${
              post.mainImage.hotspot.y * 100
            }%`,
          }}
          className="post_card_image"
        />
      ) : (
        <img
          src={urlFor(post.mainImage.asset.url)}
          alt={post.mainImage.alt}
          className="post_card_image"
        />
      )}
    </div>
  );
}
