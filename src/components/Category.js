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
        `*[_type == "post"&& (*[_type == "category"&&title=="${slug}"][0]._id in categories[]._ref)]{slug, categories[]->{title}, title, mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, year, abbreviated_year, star_rating, tags, color, recap, yearString}`
      )
      .then((data) => {
        setProjectList(data);
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
        {projectList ? (
          <Projects projectList={projectList} show_tags={true} />
        ) : null}
      </Suspense>
    </div>
  );
}
