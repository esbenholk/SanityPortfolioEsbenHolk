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
    // const colors = [
    //   "#00ff2e",
    //   "#0061ff",
    //   "white",
    //   "grey",
    //   "black",
    //   "#00ffe9",
    //   "33bff00",
    //   "#8cfffb",
    //   "#00ff55",
    //   "#8cfffb",
    //   "#ff9100",
    //   "#ff4d00",
    //   "#f6ff00",
    //   "#ff00f7",
    //   "#0800ff",
    //   "#908cff",
    //   "#8cffc8",
    //   "#1cbd6f",
    //   "#ff006a",
    //   "#a14d70",
    //   "#FFFFFF",
    //   "#000000",
    //   "#00e397",
    // ];

    const changeColors = () => {
      if (this.state.buttonText === "untoggle chaos") {
        // document.documentElement.style.setProperty(
        //   "--normalColor",
        //   colors[Math.floor(Math.random() * colors.length)]
        // );
        // document.documentElement.style.setProperty(
        //   "--detailColor",
        //   colors[Math.floor(Math.random() * colors.length)]
        // );
        document.documentElement.style.setProperty(
          "--normalColor",
          `#${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padEnd(6, "0")}`
        );
        document.documentElement.style.setProperty(
          "--detailColor",
          `#${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padEnd(6, "0")}`
        );
      }
    };

    const toggleChaos = () => {
      if (this.state.buttonText === "toggle chaos") {
        this.setState({ buttonText: "untoggle chaos" });
      } else {
        this.setState({ buttonText: "toggle chaos" });
      }
    };

    window.addEventListener("scroll", changeColors);

    return (
      <div>
        <footer className="flex-column">
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
          ) : null}
          <button
            onClick={toggleChaos}
            className={
              this.state.buttonText === "toggle chaos"
                ? "tag_button standard-button inverse"
                : "tag_button standard-button inverse active"
            }
          >
            {this.state.buttonText}
          </button>
        </footer>
      </div>
    );
  }
}

export default Footer;
