import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";

import AppContext from "../../globalState";
import BlockContent from "../blocks/BlockContent";
import ThemeSwitcher from "../retro/ThemeSwitcher";
import urlFor from "../functions/urlFor";
import OnlyHomeAndProjects from "../functions/OnlyHomeAndProjects";
import useProject, { projectMedia } from "../functions/useProject";

const ABOUT_SLUG = "esben-holk-house-of-killing";

const yearOf = (project) =>
  [project.year, project.yearString].filter(Boolean).join(" ") || "—";

// One image or video of a project, full width of the content column
function MinimalMedia({ item }) {
  if (item.youtube) {
    return (
      <a className="minimal-media minimal-media--link" href={item.youtube.url} target="_blank" rel="noreferrer">
        Video ↗
      </a>
    );
  }
  const dims = item.image.asset.metadata && item.image.asset.metadata.dimensions;
  return (
    <img
      className="minimal-media"
      src={urlFor(item.image.asset).width(1600).url()}
      alt={item.image.alt || ""}
      style={dims ? { aspectRatio: `${dims.width} / ${dims.height}` } : undefined}
      loading="lazy"
    />
  );
}

// Home: the greeting, and the image of whichever title the visitor points at
function MinimalHome({ preview }) {
  const { siteSettings } = useContext(AppContext);
  const image = preview && (preview.mainImage || preview.productImage);
  return (
    <div className="minimal-home">
      {image && image.asset ? (
        <figure className="minimal-preview" key={preview.slug.current}>
          <img src={urlFor(image.asset).width(1600).url()} alt={image.alt || preview.title} />
          <figcaption>
            {preview.title}, {yearOf(preview)}
          </figcaption>
        </figure>
      ) : null}
      {!preview && siteSettings.greeting && (
        <div className="minimal-text">
          <BlockContent blocks={siteSettings.greeting} />
        </div>
      )}
    </div>
  );
}

// A project: its text, then all its images one after another
function MinimalProject() {
  const { slug } = useParams();
  const project = useProject(slug);
  const { projectList = [] } = useContext(AppContext);

  if (project === undefined) return <p className="minimal-loading">…</p>;
  if (project === null) return <p className="minimal-loading">Not found.</p>;

  const position = projectList.findIndex((post) => post.slug.current === slug);
  const next = position >= 0 ? projectList[(position + 1) % projectList.length] : null;

  return (
    <article className="minimal-project">
      <header className="minimal-project__head">
        <h1>{project.title}</h1>
        <p className="minimal-meta">
          {yearOf(project)}
          {project.categories && project.categories.length > 0 && (
            <> · {project.categories.map((category) => category.title).join(", ")}</>
          )}
          {project.client && <> · with {project.client}</>}
        </p>
      </header>
      {project.recap && (
        <div className="minimal-text">
          <BlockContent blocks={project.recap} />
        </div>
      )}
      <div className="minimal-gallery">
        {projectMedia(project).map((item, index) => (
          <MinimalMedia item={item} key={index} />
        ))}
      </div>
      {project.body && (
        <div className="minimal-text">
          <BlockContent blocks={project.body} />
        </div>
      )}
      {next && slug !== ABOUT_SLUG && (
        <Link className="minimal-next" to={"/projects/" + next.slug.current}>
          Next: {next.title} →
        </Link>
      )}
    </article>
  );
}

// The "minimal" skin: a classic artist portfolio. Works listed by year on the left,
// images and text on the right. Only a home page and project pages.
export default function MinimalLayout() {
  const { siteSettings, projectList = [], settingsProject } = useContext(AppContext);
  const [preview, setPreview] = useState(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const { pathname } = useLocation();

  // newest first, as given; grouped under their year
  const byYear = useMemo(() => {
    const groups = [];
    projectList.forEach((project) => {
      const year = project.year || "Undated";
      const last = groups[groups.length - 1];
      if (last && last.year === year) last.projects.push(project);
      else groups.push({ year, projects: [project] });
    });
    return groups;
  }, [projectList]);

  useEffect(() => {
    setIndexOpen(false);
    setPreview(null);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="minimal">
      <aside className={`minimal-index ${indexOpen ? "is-open" : ""}`}>
        <div className="minimal-index__top">
          <Link to="/" className="minimal-name">
            {siteSettings.title || "Esben Holk"}
          </Link>
          <button className="minimal-toggle" onClick={() => setIndexOpen(!indexOpen)} aria-expanded={indexOpen}>
            {indexOpen ? "Close" : "Index"}
          </button>
        </div>

        <nav className="minimal-list" onMouseLeave={() => setPreview(null)}>
          {byYear.map((group) => (
            <div className="minimal-year" key={group.year}>
              <span className="minimal-year__label">{group.year}</span>
              <ul>
                {group.projects.map((project) => (
                  <li key={project.slug.current}>
                    <NavLink
                      to={"/projects/" + project.slug.current}
                      onMouseEnter={() => setPreview(project)}
                      onFocus={() => setPreview(project)}
                    >
                      {project.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="minimal-foot">
          {settingsProject && <NavLink to={"/projects/" + settingsProject.slug.current}>Info</NavLink>}
          {(siteSettings.socialMediaHandles || []).map((handle, index) => (
            <a href={handle.url} key={index} target="_blank" rel="noreferrer">
              {handle.URLName || "Link"}
            </a>
          ))}
          <ThemeSwitcher />
        </div>
      </aside>

      <main className="minimal-content">
        <OnlyHomeAndProjects home={<MinimalHome preview={preview} />} project={<MinimalProject />} />
      </main>
    </div>
  );
}
