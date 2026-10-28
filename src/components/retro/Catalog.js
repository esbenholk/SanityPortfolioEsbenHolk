import React, { useContext, useMemo, useState } from "react";

import ProductCard from "./ProductCard";
import AppContext from "../../globalState";
import Window from "./Window";

const NONE = [];

const toggle = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

// Product-card catalog with category/tag filters. Pass `projectList` to show a
// subset (e.g. a category page); otherwise all projects from context are shown.
// `activeTags`/`onToggleTag` let a parent (the landing page webring) drive the tag filter.
export default function Catalog({
  projectList,
  show_categories,
  show_tags,
  activeTags,
  onToggleTag,
  title = "catalog.exe",
}) {
  const myContext = useContext(AppContext);
  const allPosts = projectList || myContext.projectList || NONE;

  const [localTags, setLocalTags] = useState([]);
  const [currentCategories, setCurrentCategories] = useState([]);
  const currentTags = activeTags || localTags;
  const toggleTag = onToggleTag || ((tag) => setLocalTags(toggle(localTags, tag)));

  const tags = useMemo(
    () => [...new Set(allPosts.flatMap((post) => post.tags || []))],
    [allPosts]
  );
  const categories = useMemo(() => {
    const seen = new Map();
    allPosts.forEach((post) =>
      (post.categories || []).forEach((category) =>
        seen.set(category.title, category)
      )
    );
    return [...seen.values()];
  }, [allPosts]);

  // Rank posts by how many active filters they match
  const sortedPosts = useMemo(() => {
    if (currentTags.length === 0 && currentCategories.length === 0) {
      return allPosts;
    }
    return allPosts
      .map((post) => {
        const tagScore = (post.tags || []).filter((tag) =>
          currentTags.includes(tag)
        ).length;
        const categoryScore = (post.categories || []).filter((category) =>
          currentCategories.includes(category.title)
        ).length;
        return { post, score: tagScore + categoryScore };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.post);
  }, [allPosts, currentTags, currentCategories]);

  const hasFilters = currentTags.length > 0 || currentCategories.length > 0;

  return (
    <Window title={title} className="catalog">
      {(show_categories || show_tags) && (
        <div className="filter-bar">
          {show_categories &&
            categories.map((category) => (
              <button
                key={category.title}
                className={`btn95 ${
                  currentCategories.includes(category.title) ? "is-pressed" : ""
                }`}
                aria-pressed={currentCategories.includes(category.title)}
                onClick={() =>
                  setCurrentCategories(toggle(currentCategories, category.title))
                }
              >
                {category.title}
              </button>
            ))}
          {show_tags &&
            tags.map((tag) => (
              <button
                key={tag}
                className={`btn95 btn95--tag ${
                  currentTags.includes(tag) ? "is-pressed" : ""
                }`}
                aria-pressed={currentTags.includes(tag)}
                onClick={() => toggleTag(tag)}
              >
                #{tag}
              </button>
            ))}
          {hasFilters && (
            <button
              className="btn95 btn95--clear"
              onClick={() => {
                setCurrentCategories([]);
                if (onToggleTag) currentTags.forEach((tag) => onToggleTag(tag));
                else setLocalTags([]);
              }}
            >
              ✕ clear
            </button>
          )}
        </div>
      )}

      <p className="status-line">
        {sortedPosts.length} item{sortedPosts.length === 1 ? "" : "s"} in stock
        {hasFilters ? " matching your search" : ""}
      </p>

      <div className="catalog-grid">
        {sortedPosts.map((post, index) => (
          <ProductCard post={post} index={index} key={post.slug.current} />
        ))}
      </div>
    </Window>
  );
}
