import React from "react";
import sanityClient from "../../client";

import imageUrlBuilder from "@sanity/image-url";
import useWindowDimensions from "../functions/useWindowDimensions";

// function urlFor(source) {
//   return builder.image(source);
// }
// Get a pre-configured url-builder from your sanity client
const ImageBuilder = imageUrlBuilder(sanityClient);


function getImageDimensions(image) {
  if (!image?.asset?._ref) {
    return
  }

  const dimensions = image.asset._ref.split('-')[2]
  const [width, height] = dimensions.split('x').map(Number)

  if (!width || !height || Number.isNaN(width) || Number.isNaN(height)) {
    return
  }

  return {
    width,
    height,
    aspectRatio: width / height,
  }
}

const LARGEST_VIEWPORT = 1920; // Retina sizes will take care of 4k (2560px) and other huge screens

const DEFAULT_MIN_STEP = 0.1; // 10%
const DEFAULT_WIDTH_STEPS = [400, 600, 850, 1000, 1150]; // arbitrary
// Based on statcounter's most common screen sizes: https://gs.statcounter.com/screen-resolution-stats
const DEFAULT_FULL_WIDTH_STEPS = [360, 414, 768, 1366, 1536, 1920];

function getImageProps({
  /**
   * The image's reference object.
   * Example: {asset: {_ref: string}, hotspot: {...}, crop: {...} }
   */
  image,

  // Number of the largest width it can assume in the design
  // or "100vw" if it occupies the whole width
  maxWidth: userMaxWidth,

  /**
   * The minimal width difference, in PERCENTAGE (decimal), between the image's srcSet variations.
   *
   * -> 0.10 (10%) by default.
   */
  minimumWidthStep = DEFAULT_MIN_STEP,

  // List of width sizes to use in the srcSet (NON-RETINA)
  customWidthSteps,

  // Custom <img> element's `sizes` attribute
  sizes,
}) {
  if (!image?.asset?._ref) {
    return {};
  }
  const maxWidth =
    typeof userMaxWidth === "number" ? userMaxWidth : LARGEST_VIEWPORT;

  // For all image variations, we'll use an auto format and prevent scaling it over its max dimensions
  const builder = ImageBuilder.image(image).fit("max").auto("format");

  const imageDimensions = getImageDimensions(image);

  // Width sizes the image could assume
  const baseSizes = [
    maxWidth,
    ...(customWidthSteps ||
      (typeof userMaxWidth === "number"
        ? DEFAULT_WIDTH_STEPS
        : DEFAULT_FULL_WIDTH_STEPS)),
  ];
  const retinaSizes = Array.from(
    // De-duplicate sizes with a Set
    new Set([
      ...baseSizes,
      ...baseSizes.map((size) => size * 2),
      ...baseSizes.map((size) => size * 3),
    ])
  )
    .sort((a, b) => a - b) // Lowest to highest
    .filter(
      (size) =>
        // Exclude sizes 10% or more larger than the image itself. Sizes slightly larger
        // than the image are included to ensure we always get closest to the highest
        // quality for an image. Sanity's CDN won't scale the image above its limits.
        size <= imageDimensions.width * 1.1 &&
        // Exclude those larger than maxWidth's retina (x3)
        size <= maxWidth * 3
    )

    // Exclude those with a value difference to their following size smaller than `minimumWidthStep`
    // This ensures we don't have too many srcSet variations, polluting the HTML
    .filter((size, i, arr) => {
      const nextSize = arr[i + 1];
      if (nextSize) {
        return nextSize / size > minimumWidthStep + 1;
      }

      return true;
    });

  return {
    // Use the original image as the `src` for the <img>
    src: builder.width(maxWidth).url(),

    // Build a `{URL} {SIZE}w, ...` string for the srcset
    srcSet: retinaSizes
      .map((size) => `${builder.width(size).url()} ${size}w`)
      .join(", "),
    sizes:
      maxWidth === "100vw"
        ? "100vw"
        : sizes || `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`,

    // Let's also tell the browser what's the size of the image so it can calculate aspect ratios
    width: retinaSizes[0],
    height: retinaSizes[0] / imageDimensions.aspectRatio,
  };
}

const SanityImage = ({ image, ccsclass, height }) => {
  const { width } = useWindowDimensions();

  return (
    <img     
      style={{height: "auto",
              objectPosition: `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`,maxHeight:height}}
      loading="lazy"
      className={ccsclass}
      alt={image.alt || " "}
      {// Pass src, srcset, width, height and sizes to the image element
        ...getImageProps({
          image,
          maxWidth: width
        })
      }
    />
  )
}
const SanityImageNoHotspot = ({ image, ccsclass, height }) => {
  const { width } = useWindowDimensions();

  return (
    <img     
      style={{height: "auto", maxHeight: height}}
      loading="lazy"
      className={ccsclass}
      alt={image.alt || " "}
      {// Pass src, srcset, width, height and sizes to the image element
        ...getImageProps({
          image,
          maxWidth: width
        })
      }
    />
  )
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

              <SanityImage image={this.state.image} ccsclass={this.state.class} height={this.state.height}/>

            ) : (
              <SanityImageNoHotspot image={this.state.image} ccsclass={this.state.class} height={this.state.height}/>

            )}
          </>
        )}
      </>
    );
  }
}

export default Image;
