import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import AppContext from "../globalState";
import BlockContent from "./blocks/BlockContent";
import Window from "./retro/Window";
import { randomSlogan, useTheme } from "./retro/theme";
import Marquee from "./retro/Marquee";

const CHAOS_VARS = [
  "--c-red",
  "--c-yellow",
  "--c-blue",
  "--c-magenta",
  "--c-lime",
  "--c-cyan",
];

const randomColor = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;

export default function Footer({ info }) {
  const myContext = useContext(AppContext);
  const projectList = myContext.projectList || [];
  const [chaos, setChaos] = useState(false);
  const { theme } = useTheme();
  const { pathname } = useLocation();
  // a new slogan on every page
  const slogan1 = useMemo(() => randomSlogan(theme), [theme, pathname]);
  const slogan2 = useMemo(() => randomSlogan(theme), [theme, pathname]);
  const slogan3 = useMemo(() => randomSlogan(theme), [theme, pathname]);
  const slogan4 = useMemo(() => randomSlogan(theme), [theme, pathname]);
  const slogan5 = useMemo(() => randomSlogan(theme), [theme, pathname]);

  // Chaos mode: every scroll repaints the palette
  useEffect(() => {
    const root = document.documentElement;
    if (!chaos) {
      CHAOS_VARS.forEach((name) => root.style.removeProperty(name));
      return;
    }
    let ticking = false;
    const repaint = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        CHAOS_VARS.forEach((name) =>
          root.style.setProperty(name, randomColor()),
        );
        ticking = false;
      });
    };
    repaint();
    window.addEventListener("scroll", repaint);
    return () => window.removeEventListener("scroll", repaint);
  }, [chaos]);

  const randomProject =
    projectList.length > 0
      ? projectList[Math.floor(Math.random() * projectList.length)]
      : null;

  return (
    <footer className="site-footer">
      <div className="mega-strip">
        <span className="mega-strip__text">{slogan1}</span>
        {/* <span className="mega-strip__price">
          {String(projectList.length || 39).padStart(2, "0")}
          <sup>99</sup>
        </span> */}
        <span className="burst">your attention matters</span>
      </div>
      <Marquee
        className="marquee--ticker"
        items={projectList.map((post) => ({
          label: post.title.toUpperCase(),
          to: "/projects/" + post.slug.current,
        }))}
      />
      <Marquee
        className="marquee--ticker headline--ticker ad--checker ad--checker-grey"
        items={[slogan5, slogan5, slogan5]}
      />
      <Marquee
        className="marquee--ticker"
        items={[slogan2, slogan2, slogan2]}
      />
      <Marquee
        className="marquee--ticker"
        items={[slogan3, slogan3, slogan3]}
      />
      <Marquee
        className="marquee--ticker"
        items={[slogan4, slogan4, slogan4]}
      />

      <div className="footer-grid">
        <Window title="contact.txt" id="contact" className="footer-contact">
          {info.contact ? (
            <div className="blockContent">
              <BlockContent blocks={info.contact} />
            </div>
          ) : (
            <p>Nobody home. Try again later.</p>
          )}
          {info.socialMediaHandles && info.socialMediaHandles.length > 0 && (
            <div className="social-row">
              {info.socialMediaHandles.slice(0, 6).map((handle, index) => (
                <a href={handle.url} key={index} className="social-chip">
                  {handle.logo && handle.logo.asset && (
                    <img src={handle.logo.asset.url} alt="" />
                  )}
                  <span>{handle.URLName || "link"}</span>
                </a>
              ))}
            </div>
          )}
        </Window>

        <div className="footer-side">
          <div className="webring">
            <p className="webring__title">★ HOUSE OF KILLING loves you ★</p>
            <div className="webring__links">
              <NavLink to="/projects">« archive</NavLink>
              {randomProject && (
                <Link to={"/projects/" + randomProject.slug.current}>
                  random
                </Link>
              )}
              <NavLink to="/projects/esben-holk-house-of-killing">
                about »
              </NavLink>
            </div>
          </div>

          {/* <button
            onClick={() => setChaos(!chaos)}
            className={`chaos-btn ${chaos ? "is-on" : ""}`}
            aria-pressed={chaos}
          >
            {chaos ? "■ UNTOGGLE CHAOS" : "▶ TOGGLE CHAOS"}
          </button> */}

          <div className="footer-logo-row">
            <p className="netscape">
              Best viewed watched over by machines of loving grace
              <br />© {new Date().getFullYear()} {info.title}. All rights
              reversed.
            </p>
            {info.footerlogo && info.footerlogo.asset && (
              <NavLink to="/">
                <img
                  className="footer-logo"
                  src={info.footerlogo.asset.url}
                  alt=""
                />
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
