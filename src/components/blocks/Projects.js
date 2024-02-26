import React, { useContext } from "react";

import Masonry from "react-masonry-css";

import PostCard from "./postCard.js";

import AppContext from "../../globalState";


const breakpointColumnsObj = {
  default: 3,
  1300: 2,
  600: 1,
};

export default function Projects({ stateChanger }) {
  const myContext = useContext(AppContext);
  const projectList = myContext.projectList;

  // const [allPosts, setAllPosts] = useState(projectList);

  // const [sortedPosts, setSortedPosts] = useState(null);

  // const [tags, setTags] = useState(myContext.tags);
  // const [currentTags, setCurrentTags] = useState([]);

  // const [categories] = useState(myContext.categories);
  // const [currentCategories, setCurrentCategories] = useState([]);

  // const { width } = useWindowDimensions();

  // useEffect(() => {
  //   setAllPosts(projectList);
  //   setSortedPosts(projectList);
  //   var tags = [];

  //   for (let index = 0; index < projectList.length; index++) {
  //     const post = projectList[index];
  //     post.value = 0;

  //     if (post.tags != null && Array.isArray(post.tags)) {
  //       for (let index = 0; index < post.tags.length; index++) {
  //         const tag = post.tags[index];

  //         tags.push(tag);
  //       }
  //     }
  //   }

  //   let sortedTags = [...new Set(tags)];
  //   setTags(sortedTags);
  // }, [projectList]);

  // useEffect(() => {
  //   if (currentTags.length > 0 || currentCategories.length > 0) {
  //     const tempSortedPosts = [];


  //     ///loop through all posts
  //     for (let index = 0; index < allPosts.length; index++) {
  //       const post = allPosts[index];
  //       let post_score = 0;

  //       ///check the posts tags
  //       if (post.tags) {
  //         for (let index = 0; index < post.tags.length; index++) {
  //           const tag = post.tags[index];

  //           ///compare post tags to currentTags
  //           if (currentTags.includes(tag)) {
  //             //set post_score depending on how many currentTags the post is matching
  //             post_score = post_score + 1;
  //           }
  //         }
  //       }

  //       if (post.categories) {
  //         for (let index = 0; index < post.categories.length; index++) {
  //           const category = post.categories[index];

            
  //           ///compare post tags to currentTags
  //           if (currentCategories.includes(category.title)) {
  //             //set post_score depending on how many currentTags the post is matching
  //             post_score = post_score + 1;
  //             // console.log("post matches a category");
  //           }
  //         }
  //       }
  //       if (post_score > 0) {
  //         post.value = post_score;
  //         tempSortedPosts.push(post);
  //       }
  //     }
  //     tempSortedPosts.sort((a, b) => b.value - a.value);

  //     setSortedPosts(tempSortedPosts);
  //   } else {
  //     setSortedPosts(allPosts);
  //   }
  // }, [currentTags, allPosts, currentCategories]);

  // function setTag(tag) {
  //   if (!currentTags.includes(tag.tag)) {
  //     const tempTags = [...currentTags];
  //     tempTags.push(tag.tag);
  //     setCurrentTags(tempTags);
  //     document.getElementById("tag_" + tag.tag).classList.add("active");

  //   } else if (currentTags.includes(tag.tag)) {
  //     var tagIndex = currentTags.indexOf(tag.tag);
  //     currentTags.splice(tagIndex, 1);
  //     const tempTags = [...currentTags];
  //     document.getElementById("tag_" + tag.tag).classList.remove("active");

  //     setCurrentTags(tempTags);
  //   }
  // }

  // function setCategory(category) {
  //   if (!currentCategories.includes(category.category.title)) {
  //     const tempCategories = [...currentCategories];
  //     tempCategories.push(category.category.title);
  //     setCurrentCategories(tempCategories);
  //     console.log(
  //       "should make category active",
  //       document.getElementById("category_" + category.category.title)
  //     );
  //     document
  //       .getElementById("category_" + category.category.title)
  //       .classList.add("active");
  //   } else if (currentCategories.includes(category.category.title)) {
  //     var categoryIndex = currentCategories.indexOf(category.category.title);
  //     currentCategories.splice(categoryIndex, 1);
  //     const tempCategories = [...currentCategories];
  //     document
  //       .getElementById("category_" + category.category.title)
  //       .classList.remove("active");

  //     setCurrentCategories(tempCategories);
  //   }
  // }

  return (
    <div className="projects gallery">

     <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid fullWidthPadded"
        columnClassName="my-masonry-grid_column"
      >
        {projectList &&
          projectList.map((post, index) => (
            <PostCard post={post} key={index} stateChanger={stateChanger}/>
          ))}
      </Masonry>
    </div>
  );
}