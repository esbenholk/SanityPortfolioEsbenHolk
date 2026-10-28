import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";

import AppContext from "../globalState";
import ThemeSwitcher from "./retro/ThemeSwitcher";
import { useTheme } from "./retro/theme";

export default function Header() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;
  const categories = myContext.categories || [];
  const { copy } = useTheme();
  const firstHandle =
    info.socialMediaHandles && info.socialMediaHandles.length > 0
      ? info.socialMediaHandles[0]
      : null;

  return (
    <header className="site-header">
      <div className="ad-row">
        <Link to="/projects" className="ad ad--red">
          {copy.ads[0]}
        </Link>
        <Link to="/projects/esben-holk-house-of-killing" className="ad ad--blue">
          <span>{copy.ads[1]}</span>
          <small className="blink">{copy.adSub}</small>
        </Link>
        <Link to="/chaos" className="ad ad--checker">
          <span>{copy.ads[2]}</span>
          <span className="ad__icon" aria-hidden="true">
            ✉
          </span>
        </Link>
      </div>

      <div className="logo-bar">
        <span className="flames" aria-hidden="true">
          🔥🔥
        </span>
        <NavLink to="/" className="logo-bar__home">
          {info.logo && (
            <img className="logo-bar__img" src={info.logo.asset.url} alt="" />
          )}
          <span className="chrome-text">
            {info.title || "HOUSE OF KILLING"}
          </span>
        </NavLink>
        <span className="flames flames--flip" aria-hidden="true">
          🔥🔥
        </span>
        {firstHandle ? (
          <a className="subscribe" href={firstHandle.url}>
            FOLLOW NOW
            <small>— {firstHandle.URLName || "IT'S FREE"}</small>
            <span className="burst burst--small">NEW!</span>
          </a>
        ) : (
          <a className="subscribe" href="#contact">
            CONTACT NOW
            <small>— IT'S FREE</small>
            <span className="burst burst--small">NEW!</span>
          </a>
        )}
      </div>

      <nav className="nav-strip">
        <NavLink exact to="/">
          HOME
        </NavLink>
        <NavLink exact to="/projects">ARCHIVE</NavLink>
        {categories.slice(0, 3).map((category) => (
          <NavLink to={"/" + category.slug.current} key={category.slug.current}>
            {category.title.toUpperCase()}
          </NavLink>
        ))}
        <NavLink to="/projects/esben-holk-house-of-killing">ABOUT</NavLink>
        <NavLink to="/instagram">INSTAGRAM</NavLink>
        <NavLink to="/chaos">CHAOS</NavLink>
        <a href="#contact">CONTACT</a>
      </nav>
      <ThemeSwitcher />
    </header>
  );
}
