import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";

import AppContext from "../globalState";
import ThemeSwitcher from "./retro/ThemeSwitcher";
import { CommercialSlot, useCommercials } from "./retro/Commercial";
import { useTheme } from "./retro/theme";

export default function Header() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;
  const categories = myContext.categories || [];
  const { copy } = useTheme();
  const hasCommercial = useCommercials("header").length > 0;
  const firstHandle =
    info.socialMediaHandles && info.socialMediaHandles.length > 0
      ? info.socialMediaHandles[0]
      : null;

  return (
    <header className="site-header">
      <div className={`ad-row ${hasCommercial ? "ad-row--commercial" : ""}`}>
        {" "}
        <NavLink to="/" className="ad ad--checker ad--checker-grey">
          {info.logo && (
            <img className="logo-bar__sign" src={info.logo.asset.url} alt="" />
          )}
          {info.titleImage ? (
            <img
              src={info.titleImage.asset.url}
              alt=""
              className="logo-bar__img"
            />
          ) : (
            <span className="chrome-text">
              {info.title || "HOUSE OF KILLING"}
            </span>
          )}

          {info.logo && (
            <img className="logo-bar__sign" src={info.logo.asset.url} alt="" />
          )}
        </NavLink>
        <Link to="/projects" className="ad ad--red">
          {copy.ads[0]}
        </Link>
        <Link to="/chaos" className="ad ad--checker blink">
          <span>{copy.ads[2]}</span>
        </Link>
        <CommercialSlot
          slot="header"
          width={500}
          className="ad commercial--header"
        />
      </div>

      {/* <div className="logo-bar">
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
      </div> */}

      <nav className="nav-strip">
        <NavLink exact to="/">
          HOME
        </NavLink>
        <NavLink exact to="/projects">
          ARCHIVE
        </NavLink>
        {/* {categories.slice(0, 3).map((category) => (
          <NavLink to={"/" + category.slug.current} key={category.slug.current}>
            {category.title.toUpperCase()}
          </NavLink>
        ))} */}
        <NavLink to="/projects/esben-holk-house-of-killing">ABOUT</NavLink>
        <NavLink to="/instagram">INSTAGRAM</NavLink>
        <NavLink to="/chaos">CHAOS</NavLink>
        <a href="#contact">CONTACT</a>
      </nav>
      <ThemeSwitcher />
    </header>
  );
}
