import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";

import PostCard from "./postCard.js";

export default function Projects({ projectList }) {
  const [allPosts, setAllPosts] = useState(null);

  const [sortedPosts, setSortedPosts] = useState(null);

  const [tags, setTags] = useState([]);

  const [currentTags, setCurrentTags] = useState([]);

  useEffect(() => {
    setAllPosts(projectList);
    setSortedPosts(projectList);
    var tags = [];
    for (let index = 0; index < projectList.length; index++) {
      const post = projectList[index];
      console.log(post.mainImage);
      post.value = 0;
      if (post.tags != null && Array.isArray(post.tags)) {
        for (let index = 0; index < post.tags.length; index++) {
          const tag = post.tags[index];
          tags.push(tag);
        }
      }
    }

    let sortedTags = [...new Set(tags)];
    setTags(sortedTags);
  }, [projectList]);

  useEffect(() => {
    if (currentTags.length > 0) {
      const tempSortedPosts = [];

      ///loop through all posts
      for (let index = 0; index < allPosts.length; index++) {
        const post = allPosts[index];
        let post_score = 0;

        ///check the posts tags
        for (let index = 0; index < post.tags.length; index++) {
          const tag = post.tags[index];

          ///compare post tags to currentTags
          if (currentTags.includes(tag)) {
            //set post_score depending on how many currentTags the post is matching
            post_score = post_score + 1;
          }
        }
        if (post_score > 0) {
          post.value = post_score;
          tempSortedPosts.push(post);
        }
      }
      tempSortedPosts.sort((a, b) => b.value - a.value);

      console.log("SORTED", tempSortedPosts);

      setSortedPosts(tempSortedPosts);
    } else {
      setSortedPosts(allPosts);
    }
  }, [currentTags, allPosts]);

  function setTag(tag) {
    if (!currentTags.includes(tag.tag)) {
      const tempTags = [...currentTags];
      tempTags.push(tag.tag);
      setCurrentTags(tempTags);
      document.getElementById("tag_" + tag.tag).classList.add("active");
    } else if (currentTags.includes(tag.tag)) {
      var tagIndex = currentTags.indexOf(tag.tag);
      currentTags.splice(tagIndex, 1);
      const tempTags = [...currentTags];
      document.getElementById("tag_" + tag.tag).classList.remove("active");

      setCurrentTags(tempTags);
    }
  }

  return (
    <div>
      <div className="tag_grid">
        {tags.map((tag, index) => (
          <button
            className="tag_button"
            key={index}
            id={"tag_" + tag + ""}
            onClick={() => {
              setTag({ tag });
            }}
          >
            {" "}
            {tag}{" "}
          </button>
        ))}
      </div>

      <motion.div layout className="post_grid">
        {sortedPosts &&
          sortedPosts.map((post, index) => (
            <PostCard post={post} key={index} />
          ))}
      </motion.div>
    </div>
  );
}
