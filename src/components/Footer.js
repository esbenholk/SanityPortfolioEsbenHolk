import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import BlockContent from "./blocks/BlockContent";

import AppContext from "../globalState";

export default function Footer() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;

  console.log("FOOOOOTER", info);

  return (
    <div>
      <footer className="flex-column">
        <div className="flex-row justifyBetween fullwidth">
          <div className="flex-row ">
            <NavLink to="/">
              {info.logo && (
                <img
                  className="logo footerLogo"
                  src={info.footerlogo.asset.url}
                  alt=""
                />
              )}
            </NavLink>
          </div>
          <div className="flex-row align-right">
            {info.socialMediaHandles &&
              info.socialMediaHandles.slice(0, 4).map((handle, index) => (
                <a
                  href={handle.url}
                  key={index}
                  id={"category_" + handle.url + ""}
                >
                  <img
                    className="footer_social_media_icon"
                    src={handle.logo.asset.url}
                    alt=""
                    style={{ width: "50px", marginLeft: "5px" }}
                  />
                </a>
              ))}
          </div>
        </div>
        {info.contact ? (
          <div className="blockContent">
            <BlockContent blocks={info.contact} />
          </div>
        ) : null}
      </footer>
    </div>
  );
}
