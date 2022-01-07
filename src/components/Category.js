import React, { useEffect, useState } from "react";
import { Suspense } from "react";
import sanityClient from "../client";
import { useParams } from "react-router-dom";
import Projects from "./blocks/Projects";

import BlockContent from "@sanity/block-content-to-react";

export default function Category() {
  const { slug } = useParams();
  const [projectList, setProjectList] = useState();
  const [category, setCategory] = useState();

  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "category" && slug.current=="${slug}"]{ title, slug, description}`
      )
      .then((data) => {
        setCategory(data[0]);
      })
      .catch(console.error);
    sanityClient
      .fetch(
        `*[_type == "category" && slug.current=="${slug}"]{
          _id,
          _type,
          title, 
          slug, 
          description,
          "posts": *[_type == "project" && references(^._id)]
          {title,mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, year, abbreviated_year, star_rating ,slug, categories[]->{title, slug}, tags, color, recap, yearString}
        }`
      )
      .then((data) => {
        console.log(data);
        setProjectList(data[0].posts);
      })
      .catch(console.error);
  }, [slug]);

  return (
    <div className="content-container ">
      <div className="fullWidthPadded category_details">
        {category && category.title ? <h2>{category.title}</h2> : null}
        {category && category.description ? (
          <div className="blockContent">
            <BlockContent
              blocks={category.description}
              projectId="swdt1dj3"
              dataset="production"
            />
          </div>
        ) : null}
      </div>

      <Suspense fallback={null}>
        {projectList && projectList.length > 0 ? (
          <Projects projectList={projectList} show_tags={true} />
        ) : null}
      </Suspense>
    </div>
  );
}
