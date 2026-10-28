import React, { useEffect, useState } from "react";
import sanityClient from "../client";
import { useParams } from "react-router-dom";

import BlockContent from "./blocks/BlockContent";
import Catalog from "./retro/Catalog";

export default function Category() {
  const { slug } = useParams();
  const [category, setCategory] = useState();

  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "category" && slug.current == $slug]{
          _id,
          title,
          slug,
          description,
          "posts": *[_type == "project" && references(^._id)]
          {title,mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, year, abbreviated_year, star_rating ,slug, categories[]->{title, slug}, tags, color, recap, yearString}
        }`,
        { slug }
      )
      .then((data) => setCategory(data[0]))
      .catch(console.error);
  }, [slug]);

  if (!category) return null;

  return (
    <div className="content-container">
      <div className="category_details">
        <h1 className="page-title">{category.title}</h1>
        {category.description && (
          <div className="blockContent">
            <BlockContent blocks={category.description} />
          </div>
        )}
      </div>

      {category.posts && category.posts.length > 0 && (
        <Catalog
          projectList={category.posts.filter((post) => post.slug)}
          show_tags={true}
          title={`${category.title}.exe`}
        />
      )}
    </div>
  );
}
