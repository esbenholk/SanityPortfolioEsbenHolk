import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import AppContext from "../globalState";

import useWindowDimensions from "./functions/useWindowDimensions";

export default function Header() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;

  const { width } = useWindowDimensions();

  return (
    <>
      {width > 500 ? (
        <nav>
          <NavLink className="standard-button" to="/projects">
            Projects
          </NavLink>
          <NavLink to="/">
            <div className="logo_container">
              {info.title && <p className="standard-button">{info.title}</p>}
              {/* {info.logo && (
                <img className="logo" src={info.logo.asset.url} alt="" />
              )} */}
            </div>
          </NavLink>
          <NavLink className="standard-button" to="/projects/esben-holk-house-of-killing">
            About us
          </NavLink>
        </nav>
      ) : (
        <nav>
          <NavLink className="standard-button" to="/projects">
            Projects
          </NavLink>

          <NavLink className="standard-button" to="/projects/esben-holk-house-of-killing">
            About us
          </NavLink>

          <NavLink className="fullwidth" to="/">
            <div className="logo_container">
              {info.title && <p className="standard-button">{info.title}</p>}
            </div>
          </NavLink>
        </nav>
      )}
    </>
  );
}
