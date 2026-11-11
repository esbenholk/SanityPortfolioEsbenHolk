import React from "react";
import { Link } from "react-router-dom";

import FrameImage from "./FrameImage";
import { hashOf } from "./theme";

const STRIPES = ["red", "blue", "magenta", "lime", "cyan", "orange"];

// The card's shape in the store skin's mosaic, from its image's proportions:
// wide images span two columns, tall ones two rows, and some square ones are big (2×2)
function shapeOf(image, seed) {
  const dims =
    image &&
    image.asset &&
    image.asset.metadata &&
    image.asset.metadata.dimensions;
  if (!dims) return "square";
  const ratio = dims.width / dims.height;
  if (ratio >= 1.35) return "wide";
  if (ratio <= 0.8) return "tall";
  return seed % 4 === 0 ? "big" : "square";
}

// A project shown as a storefront product card
export default function ProductCard({ post, index = 0 }) {
  // const price =
  //   post.abbreviated_year != null
  //     ? String(post.abbreviated_year).padStart(2, "0")
  //     : post.year
  //       ? String(post.year).slice(-2)
  //       : "00";
  const stripe = STRIPES[index % STRIPES.length];
  const image = post.productImage || post.mainImage;

  // Fake video stats for the tube skin (hidden in the other skins)
  const seed = hashOf(post.title);
  const duration = `${8 + (seed % 50)}:${String(seed % 60).padStart(2, "0")}`;
  const views = `${((seed % 9000) / 10 + 1).toFixed(1)}K views`;
  const rating = `${80 + (seed % 20)}%`;
  const shape = shapeOf(image, seed);

  return (
    <Link
      to={"/projects/" + post.slug.current}
      className={`product-card product-card--${stripe} product-card--${shape}`}
      style={post.color ? { "--card-accent": post.color } : undefined}
    >
      <div className="product-card__head tube-meta">
        <span>
          {post.categories && post.categories[0]
            ? post.categories[0].title
            : "ITEM"}
        </span>
        <span>#{String(index + 1).padStart(3, "0")}</span>
      </div>

      <div className="product-card__frame">
        <FrameImage
          image={image}
          hoverImage={post.productImage ? post.mainImage : null}
          width={600}
        />
        {index < 3 && (
          <span className="burst burst--small product-card__new">HOT!</span>
        )}
        <span className="tube-meta tube-meta--hd">HD</span>
        <span className="tube-meta tube-meta--duration">{duration}</span>
        <span className="tube-meta tube-meta--progress" />
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title">{post.title}</h3>
        {post.star_rating && <p className="stars">{post.star_rating}</p>}
        <p className="tube-stats">
          {views} · <span>👍 {rating}</span>
        </p>
        {post.tags && post.tags.length > 0 && (
          <p className="product-card__tags tube-meta">
            {post.tags.slice(0, 4).join(" / ")}
          </p>
        )}
        <div className="product-card__foot">
          {/* <span className="price">
            {price}
            <sup>99</sup>
          </span> */}
          <span className="buy-btn">VIEW ▶</span>
        </div>
      </div>
    </Link>
  );
}
