import React, {
  Suspense,
  lazy,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
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
import ShooterWindow from "./retro/ShooterWindow";
import AsciiBox from "./retro/AsciiBox";
import InstaTicker from "./retro/InstaTicker";
import { CommercialSlot, useCommercials } from "./retro/Commercial";
import { useMediaQuery, useTheme } from "./retro/theme";
import useFitToScreen from "./functions/useFitToScreen";

const FireStrip = lazy(() => import("./retro/FireStrip"));

const NONE = [];
const BADGE_ICONS = [
  "💿",
  "🌐",
  "👾",
  "⚡",
  "💾",
  "📼",
  "🛸",
  "🧿",
  "☎️",
  "🔮",
];
const BADGE_COLORS = ["lime", "pink", "cyan", "red", "blue", "yellow"];

export default function LandingPage() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;
  const projectList = myContext.projectList || NONE;
  const tags = myContext.tags || NONE;
  const { theme, copy } = useTheme();
  const centerCommercials = useCommercials("center");

  // Fit to the window. Wide screens: the top band (.storefront--top) ends at the bottom of
  // the window, minus its CSS margin-bottom; inside it the windows, the room and the
  // commercials share the height (CSS: .storefront--fitted).
  // Narrower: only the chaos window (+ ticker) is fitted, 40px above the window's bottom.
  const topRef = useRef(null);
  const screenRef = useRef(null);
  const mainRef = useRef(null);
  const coreRef = useRef(null);
  const isPhone = useMediaQuery("(max-width: 760px)");
  const threeColumns = useMediaQuery("(min-width: 1061px)");
  const topHeight = useFitToScreen(topRef, topRef, {
    min: 420,
    enabled: threeColumns,
  });
  const screenHeight = useFitToScreen(screenRef, isPhone ? coreRef : mainRef, {
    min: 180,
    gap: 40,
    enabled: !threeColumns,
  });

  const [activeTags, setActiveTags] = useState([]);
  const toggleTag = (tag) =>
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );

  // Featured projects from site settings first, topped up with the newest work
  // so the showroom always has something to cycle through
  const featured = useMemo(() => {
    const picked =
      myContext.hasFeaturedPosts && info.featuredProjects
        ? projectList.filter((post) =>
            info.featuredProjects.includes(post.title),
          )
        : [];
    const rest = projectList.filter((post) => !picked.includes(post));
    return [...picked, ...rest].slice(0, Math.max(6, picked.length));
  }, [myContext.hasFeaturedPosts, info, projectList]);

  // Frames under the chaos window: site main images if set, otherwise projects after the featured ones
  const sideFrames = useMemo(() => {
    if (info.mainImages && info.mainImages.length > 0) {
      return info.mainImages
        .slice(0, 2)
        .map((image) => ({ image, to: "/projects" }));
    }
    if (info.mainImage) return [{ image: info.mainImage, to: "/projects" }];
    return projectList.slice(6, 8).map((post) => ({
      image: post.productImage || post.mainImage,
      to: "/projects/" + post.slug.current,
      label: post.title,
    }));
  }, [info, projectList]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Everything you see on load: the top of the left column, the chaos window with
          ticker and commercials, and the feature room. On wide screens this band gets its
          height from the window; the space below it is its margin-bottom (.storefront--top in App.css). */}
      <div
        className={`storefront storefront--top ${threeColumns ? "storefront--fitted fit-zone" : ""}`}
        ref={topRef}
        style={topHeight ? { height: topHeight } : undefined}
      >
        <div className="col col--left">
          {/* <h2 className="box-label box-label--red">{copy.equip}</h2> */}
          <CommercialSlot slot="left" index={0} width={460} />
          <ShooterWindow />
        </div>

        {/* CENTER: live window into /chaos */}
        <section className="col col--center">
          <div
            className={`fit-main ${!isPhone && !threeColumns ? "fit-zone" : ""}`}
            ref={mainRef}
          >
            <div
              className={`fit-core ${isPhone ? "fit-zone" : ""}`}
              ref={coreRef}
            >
              <ChaosWindow screenRef={screenRef} height={screenHeight} />
              <Marquee
                className="marquee--ticker ad--checker ad--checker-grey"
                items={projectList.map((post) => ({
                  label: post.title.toUpperCase(),
                  to: "/projects/" + post.slug.current,
                }))}
              />
            </div>
            {centerCommercials.length > 0 ? (
              <div className="center-frames">
                <CommercialSlot slot="center" width={700} />
              </div>
            ) : (
              sideFrames.length > 0 && (
                <div className="center-frames">
                  {sideFrames.map((frame, i) => (
                    <Link
                      to={frame.to}
                      className="frame-tile frame-tile--wide"
                      key={i}
                    >
                      <FrameImage image={frame.image} width={600} />
                      {frame.label && (
                        <span className="frame-tile__label">{frame.label}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        </section>

        {/* RIGHT: 3D showroom + enter */}
        <div className="col col--right">
          <h2 className="box-label box-label--black">{copy.feature}</h2>
          <Room3D projects={featured} />
          <Link to="/chaos" className="enter-btn">
            {copy.enter}
          </Link>
        </div>
      </div>
      {/* tube only: a strip of fire that flares up under the mouse */}
      {theme === "tube" && (
        <Suspense fallback={null}>
          <FireStrip />
        </Suspense>
      )}
      <GifWall projects={projectList} title={copy.wall} interval={100} />
      <Marquee
        reverse={true}
        className="marquee--ticker ad--checker ad--checker-grey"
        items={projectList.map((post) => ({
          label: post.title.toUpperCase(),
          to: "/projects/" + post.slug.current,
        }))}
      />
      <div className="flex">
        {" "}
        <InstaTicker />
        {/* <CommercialSlot slot="right" index={0} width={580} /> */}
      </div>
      {/* the greeting with a commercial on either side, one full-width row */}
      <div className="greeting-row">
        <CommercialSlot slot="greeting" index={0} width={600} />
        {info.greeting && (
          <Window title="welcome.txt" className="welcome">
            <div className="headline">
              <BlockContent blocks={info.greeting} />
            </div>
          </Window>
        )}
        <CommercialSlot slot="greeting" index={1} width={600} />
      </div>
      <div id="catalog">
        <Catalog
          show_categories={true}
          show_tags={true}
          activeTags={activeTags}
          onToggleTag={toggleTag}
        />
      </div>
      <CommercialSlot slot="right" index={1} width={580} />{" "}
      <GifWall projects={projectList} title={copy.wall} interval={100} />
    </motion.div>
  );
}
