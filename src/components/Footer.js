import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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

// skins where the ENTROPY button is in the footer
const ENTROPY_SKINS = ["storefront", "tube", "texture"];

const randomColor = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;

export default function Footer({ info }) {
  const myContext = useContext(AppContext);
  const projectList = myContext.projectList || [];
  // chaos mode is off (its button is commented out below)
  const [chaos] = useState(false);
  const { theme } = useTheme();
  const { pathname } = useLocation();
  // five new slogans on every page (pathname is listed so they change when the page does)
  const [slogan1, slogan2, slogan3, slogan4, slogan5] = useMemo(
    () => Array.from({ length: 5 }, () => randomSlogan(theme)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, pathname],
  );

  // ENTROPY: the whole page collapses under gravity (retro/entropy.js, loaded on demand)
  const stopEntropy = useRef(null);
  const [entropy, setEntropy] = useState(false);
  const startEntropy = async () => {
    if (stopEntropy.current) return;
    const { default: start } = await import("./retro/entropy");
    const site = document.querySelector(".site");
    if (!site) return;
    const stop = start(site);
    stopEntropy.current = () => {
      stop();
      stopEntropy.current = null;
      setEntropy(false);
    };
    // its own "restore order" button calls stop too
    document
      .querySelector(".entropy-restore")
      .addEventListener(
        "click",
        () => stopEntropy.current && stopEntropy.current(),
      );
    setEntropy(true);
  };
  // leaving the page or changing skin puts everything back first
  useEffect(
    () => () => {
      if (stopEntropy.current) stopEntropy.current();
    },
    [pathname, theme],
  );

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
        color="red"
        items={projectList.map((post) => ({
          label: post.title.toUpperCase(),
          to: "/projects/" + post.slug.current,
        }))}
      />
      <Marquee
        speed={60}
        reverse={true}
        className="marquee--ticker headline--ticker topchip--checker topchip--checker-grey"
        items={[slogan5, slogan5, slogan5]}
      />
      <Marquee
        color="blue"
        speed={300}
        className="marquee--ticker"
        items={[slogan2, slogan2, slogan2]}
      />
      <Marquee
        className="marquee--ticker"
        speed={120}
        items={[slogan3, slogan3, slogan3]}
      />
      <Marquee
        color="black"
        speed={40}
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

          {ENTROPY_SKINS.includes(theme) && (
            <button
              className={`chaos-btn entropy-btn ${entropy ? "is-on" : ""}`}
              onClick={startEntropy}
              disabled={entropy}
            >
              ☢ ENTROPY
            </button>
          )}

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
