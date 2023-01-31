import React from "react";
import sanityClient from "../../client";

import imageUrlBuilder from "@sanity/image-url";

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(sanityClient);

function urlFor(source) {
  return builder.image(source);
}

class Image extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      image: props.image,
      class: props.class,
      height: props.mainImageHeight
    };
  }

  render() {
    return (
      <>
        {this.state.image && (
          <>
            {this.state.image.hotspot ? (
              <img
                src={urlFor(this.state.image.asset)}
                alt={this.state.image.alt}
                style={{
                  objectPosition: `${this.state.image.hotspot.x * 100}% ${this
                    .state.image.hotspot.y * 100}%`,maxHeight: this.state.height

                  
                }}
                className={this.state.class}
              />
            ) : (
              <img
                src={urlFor(this.state.image.asset)}
                alt={this.state.image.alt}
                className={this.state.class}
                style={{
                  maxHeight: this.state.height
                }}
              />
            )}
          </>
        )}
      </>
    );
  }
}

export default Image;
