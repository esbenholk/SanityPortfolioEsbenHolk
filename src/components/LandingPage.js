import React, { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import AppContext from "../globalState";
import Catalog from "./retro/Catalog";
import BlockContent from "./blocks/BlockContent";
import Room3D from "./retro/Room3D";
import Marquee from "./retro/Marquee";
import HitCounter from "./retro/HitCounter";
import Window from "./retro/Window";
import FrameImage from "./retro/FrameImage";
import GifWall from "./retro/GifWall";
import ChaosWindow from "./retro/ChaosWindow";
import AsciiBox from "./retro/AsciiBox";
import { CommercialSlot, useCommercials } from "./retro/Commercial";
import { useTheme } from "./retro/theme";

const NONE = [];
const BADGE_ICONS = ["💿", "🌐", "👾", "⚡", "💾", "📼", "🛸", "🧿", "☎️", "🔮"];
const BADGE_COLORS = ["lime", "pink", "cyan", "red", "blue", "yellow"];

export default function LandingPage() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;
  const projectList = myContext.projectList || NONE;
  const categories = myContext.categories || NONE;
  const tags = myContext.tags || NONE;
  const { theme, copy } = useTheme();
  const centerCommercials = useCommercials("center");

  const [activeTags, setActiveTags] = useState([]);
  const toggleTag = (tag) =>
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );

  // Featured projects from site settings first, topped up with the newest work
  // so the showroom always has something to cycle through
  const featured = useMemo(() => {
    const picked =
      myContext.hasFeaturedPosts && info.featuredProjects
        ? projectList.filter((post) => info.featuredProjects.includes(post.title))
        : [];
    const rest = projectList.filter((post) => !picked.includes(post));
    return [...picked, ...rest].slice(0, Math.max(6, picked.length));
  }, [myContext.hasFeaturedPosts, info, projectList]);

  // One cover project per category for the "EQUIP" tiles
  const categoryTiles = useMemo(
    () =>
      categories.slice(0, 2).map((category) => ({
        category,
        cover: projectList.find((post) =>
          (post.categories || []).some((c) => c.title === category.title)
        ),
      })),
    [categories, projectList]
  );

  // Frames under the chaos window: site main images if set, otherwise projects after the featured ones
  const sideFrames = useMemo(() => {
    if (info.mainImages && info.mainImages.length > 0) {
      return info.mainImages.slice(0, 2).map((image) => ({ image, to: "/projects" }));
    }
    if (info.mainImage) return [{ image: info.mainImage, to: "/projects" }];
    return projectList.slice(6, 8).map((post) => ({
      image: post.productImage || post.mainImage,
      to: "/projects/" + post.slug.current,
      label: post.title,
    }));
  }, [info, projectList]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="storefront">
        {/* LEFT: equip */}
        <aside className="col col--left">
          <h2 className="box-label box-label--red">{copy.equip}</h2>
          {categoryTiles.map(({ category, cover }) => (
            <Link
              to={"/" + category.slug.current}
              className="frame-tile"
              key={category.slug.current}
            >
              {cover && <FrameImage image={cover.productImage || cover.mainImage} width={400} />}
              <span className="frame-tile__label">{category.title}</span>
            </Link>
          ))}

          <CommercialSlot slot="left" index={0} width={460} />

          <div className="webring-grid">
            {tags.slice(0, 10).map((tag, i) => (
              <button
                key={tag}
                className={`badge badge--${BADGE_COLORS[i % BADGE_COLORS.length]} ${
                  activeTags.includes(tag) ? "is-on" : ""
                }`}
                aria-pressed={activeTags.includes(tag)}
                onClick={() => {
                  toggleTag(tag);
                  const catalog = document.getElementById("catalog");
                  if (catalog) catalog.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span aria-hidden="true">{BADGE_ICONS[i % BADGE_ICONS.length]}</span>
                {tag}
              </button>
            ))}
          </div>

          <AsciiBox />

          <HitCounter />

          <CommercialSlot slot="left" index={1} width={460} />

          {/* <div className="construction">
            <span role="img" aria-label="construction">
              🚧
            </span>
            <span>
              UNDER
              <br />
              CONSTRUCTION
            </span>
          </div> */}
        </aside>

        {/* CENTER: live window into /chaos */}
        <section className="col col--center">
          <ChaosWindow />
          <Marquee
            className="marquee--ticker"
            items={projectList.map((post) => ({
              label: post.title.toUpperCase(),
              to: "/projects/" + post.slug.current,
            }))}
          />
          {centerCommercials.length > 0 ? (
            <div className="center-frames">
              <CommercialSlot slot="center" width={700} />
            </div>
          ) : (
            sideFrames.length > 0 && (
              <div className="center-frames">
                {sideFrames.map((frame, i) => (
                  <Link to={frame.to} className="frame-tile frame-tile--wide" key={i}>
                    <FrameImage image={frame.image} width={600} />
                    {frame.label && <span className="frame-tile__label">{frame.label}</span>}
                  </Link>
                ))}
              </div>
            )
          )}
        </section>

        {/* RIGHT: 3D showroom + enter */}
        <aside className="col col--right">
          <h2 className="box-label box-label--black">{copy.feature}</h2>
          <Room3D projects={featured} />

          <Link to="/chaos" className="enter-btn">
            {copy.enter}
          </Link>

          <CommercialSlot slot="right" index={0} width={580} />

          <div className="promo promo--purple">
            <strong>{projectList.length} WORKS</strong>
            <span>IN STOCK NOW</span>
          </div>
          <Link to="/projects" className="promo promo--red">
            ALL STOCK MUST GO
          </Link>
          <Marquee
            to="/instagram"
            className="marquee--insta"
            separator="✦"
            items={["INSTAGRAM.EXE ▶", "NOW WITH 3D SHOOTER", "NEW POSTS INSIDE"]}
          />

          <CommercialSlot slot="right" index={1} width={580} />
          <a href="#contact" className="promo promo--blue">
            SIGN MY GUESTBOOK{" "}
            <span role="img" aria-label="pen">
              ✍
            </span>
          </a>
        </aside>
      </div>

      {theme !== "storefront" && (
        <GifWall
          projects={projectList}
          title={copy.wall}
          interval={theme === "swamp" ? 4000 : 650}
        />
      )}

      {info.greeting && (
        <Window title="welcome.txt" className="welcome">
          <div className="headline">
            <BlockContent blocks={info.greeting} />
          </div>
        </Window>
      )}

      <div id="catalog">
        <Catalog
          show_categories={true}
          show_tags={true}
          activeTags={activeTags}
          onToggleTag={toggleTag}
        />
      </div>
    </motion.div>
  );
}
