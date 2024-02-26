import React, { useContext,useEffect } from "react";
import { NavLink,useLocation } from "react-router-dom";

import AppContext from "../globalState";

import useWindowDimensions from "./functions/useWindowDimensions";



export default function Header({updateSlug }) {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;
  const loc = useLocation()

  useEffect(()=>{
    updateSlug(loc.pathname);
  })

 

  const { width } = useWindowDimensions();

  return (
    <>
      {width > 500 ? (
        <nav className="headerNav">
          <NavLink to="/">
            <div className="logo_container">
              {info.title && <p className="standard-button">{info.title}</p>}
            </div>
          </NavLink>
          <NavLink className="standard-button" to="/projects/esben-holk-house-of-killing">
            About us
          </NavLink>
        </nav>
      ) : (
        <nav className="headerNav">
          <NavLink className="standard-button right" to="/projects/esben-holk-house-of-killing">
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
