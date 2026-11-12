import React, {
  Suspense,
  lazy,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";

import AppContext from "../../globalState";
import BlockContent from "../blocks/BlockContent";
import ThemeSwitcher from "../retro/ThemeSwitcher";
import MediaCarousel from "../retro/MediaCarousel";
import urlFor from "../functions/urlFor";
import OnlyHomeAndProjects from "../functions/OnlyHomeAndProjects";
import useProject, { projectMedia } from "../functions/useProject";
import { randomSlogan } from "../retro/theme";

const OceanScene = lazy(() => import("./OceanScene"));

const yearOf = (project) =>
  [project.year, project.yearString].filter(Boolean).join(" ");
const categoriesOf = (project) =>
  (project.categories || []).map((category) => category.title).join(", ");

const MAX_BREEZES = 4;
let breezeId = 0;

// What a cube unfolds into when it's explored
// A click anywhere closes it and you sail on, except on "view the work".
function ExplorePanel({ project, onClose }) {
  const image = project.mainImage || project.productImage;
  // ignore the click that opened it
  const openedAt = useRef(performance.now());
  const close = () => {
    if (performance.now() - openedAt.current > 400) onClose();
  };
  return (
    <div
      className="ocean-explore"
      role="dialog"
      aria-label={project.title}
      onClick={close}
    >
      <div className="ocean-explore__card">
        {image && image.asset && (
          <img
            src={urlFor(image.asset).width(900).url()}
            alt={image.alt || project.title}
          />
        )}
        <div className="ocean-explore__text">
          <h2>{project.title}</h2>
          <p className="ocean-meta">
            {[yearOf(project), categoriesOf(project)]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {project.recap && (
            <div className="ocean-prose">
              <BlockContent blocks={project.recap} />
            </div>
          )}
          <div className="ocean-explore__actions">
            <Link
              className="ocean-button ocean-button--solid"
              to={"/projects/" + project.slug.current}
              onClick={(e) => e.stopPropagation()}
            >
              view the work
            </Link>
            <span className="ocean-explore__hint">
              click anywhere to keep sailing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Home: the open sea with a cube for every project
function OceanHome() {
  const { projectList = [] } = useContext(AppContext);
  const [explored, setExplored] = useState(null);
  const [sailing, setSailing] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 1 });
  const [slogan] = useState(() => randomSlogan("ocean"));

  const [breezes, setBreezes] = useState([]);

  const onMove = useCallback(() => setSailing(true), []);
  // pointing at a cube sends its title across the screen
  const onHoverStart = useCallback((project) => {
    setBreezes((current) => [
      ...current.slice(-(MAX_BREEZES - 1)),
      {
        id: ++breezeId,
        title: project.title,
        top: 18 + Math.random() * 50,
        duration: 7 + Math.random() * 3,
      },
    ]);
  }, []);
  const removeBreeze = useCallback(
    (id) =>
      setBreezes((current) => current.filter((breeze) => breeze.id !== id)),
    [],
  );
  const onReady = useCallback(
    (loaded, total) => setProgress({ loaded, total }),
    [],
  );

  useEffect(() => {
    const onKey = (e) => e.code === "Escape" && setExplored(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="ocean-home">
      <Suspense
        fallback={<p className="ocean-loading">the tide is coming in…</p>}
      >
        <OceanScene
          projects={projectList}
          paused={Boolean(explored)}
          onExplore={setExplored}
          onMove={onMove}
          onReady={onReady}
          onHoverStart={explored ? undefined : onHoverStart}
          breezes={breezes}
          onBreezeDone={removeBreeze}
        />
      </Suspense>

      <p className={`ocean-hint ${sailing ? "is-hidden" : ""}`}>
        <span className="ocean-hint__slogan">{slogan}</span>W A S D or arrows to
        sail · drag to look around · click a cube to explore
      </p>
      {progress.loaded < progress.total && (
        <p className="ocean-progress">
          {progress.loaded} / {progress.total} works surfacing
        </p>
      )}

      {explored && (
        <ExplorePanel project={explored} onClose={() => setExplored(null)} />
      )}
    </div>
  );
}

// A project page in the ocean skin: calm, centred, nothing but the work
function OceanPost() {
  const { slug } = useParams();
  const project = useProject(slug);
  const { projectList = [] } = useContext(AppContext);
  const carouselRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (project === undefined) return <p className="ocean-loading">surfacing…</p>;
  if (project === null)
    return <p className="ocean-loading">This work has drifted away.</p>;

  const position = projectList.findIndex((post) => post.slug.current === slug);
  const next =
    position >= 0 && projectList.length > 1
      ? projectList[(position + 1) % projectList.length]
      : null;
  const media = projectMedia(project);

  return (
    <article className="ocean-post">
      <header className="ocean-post__head">
        <p className="ocean-meta">{yearOf(project)}</p>
        <h1>{project.title}</h1>
        {categoriesOf(project) && (
          <p className="ocean-meta">{categoriesOf(project)}</p>
        )}
      </header>

      {media.length > 0 && (
        <MediaCarousel
          key={slug}
          ref={carouselRef}
          items={media}
          className="ocean-carousel"
        />
      )}

      <div className="ocean-post__text">
        {project.recap && (
          <div className="ocean-prose ocean-prose--lead">
            <BlockContent blocks={project.recap} />
          </div>
        )}
        {project.body && (
          <div className="ocean-prose">
            <BlockContent blocks={project.body} />
          </div>
        )}
      </div>

      <nav className="ocean-post__foot">
        <Link to="/">← back to the ocean</Link>
        {next && (
          <Link to={"/projects/" + next.slug.current}>
            drift on to {next.title} →
          </Link>
        )}
      </nav>
    </article>
  );
}

// The "ocean" skin (desktop only): the home page is a sea to sail on, and project pages
// are quiet and minimal. There are no archive or category pages; those addresses lead home.
export default function OceanLayout() {
  const { siteSettings } = useContext(AppContext);
  return (
    <div className="ocean">
      {/* the glass panels' refraction: noise that bends whatever is seen through them
          (used by backdrop-filter in skins.css) */}
      <svg className="ocean-filters" aria-hidden="true" width="0" height="0">
        <filter
          id="ocean-refraction"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.014"
            numOctaves="2"
            seed="7"
            result="lens"
          />
          <feGaussianBlur in="lens" stdDeviation="2" result="smoothLens" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothLens"
            scale="42"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <header className="ocean-bar">
        <Link to="/" className="ocean-name">
          {siteSettings.title || "Esben Holk"}
        </Link>
        <ThemeSwitcher />
      </header>
      <OnlyHomeAndProjects home={<OceanHome />} project={<OceanPost />} />
    </div>
  );
}
