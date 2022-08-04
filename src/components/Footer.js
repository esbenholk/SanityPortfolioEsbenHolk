import React from "react";
import { NavLink } from "react-router-dom";
import BlockContent from "./blocks/BlockContent";


class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      buttonText: "toggle chaos",
      info: this.props.info,
    };
  }

  render() {

    return (
      <>
        <footer className="flex-column">

        <nav class="footer-nav">
          <NavLink className="standard-button" to="/gallery">
            Gallery
          </NavLink>

          <NavLink className="standard-button" to="/gallery">
          Gallery
          </NavLink>
        </nav>
     
{/*     
          <div className="flex-row justifyBetween fullwidth">
            <div className="flex-row ">
              <NavLink to="/">
                {this.state.info.logo && (
                  <img
                    className="logo footerLogo"
                    src={this.state.info.footerlogo.asset.url}
                    alt=""
                  />
                )}
              </NavLink>
            </div>
            <div className="flex-row align-right">
              {this.state.info.socialMediaHandles &&
                this.state.info.socialMediaHandles
                  .slice(0, 4)
                  .map((handle, index) => (
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
          {this.state.info.contact ? (
            <div className="blockContent">
              <BlockContent blocks={this.state.info.contact} />
            </div>
          ) : null} */}

        </footer>
      </>
    );
  }
}

export default Footer;
