import Image from "./blocks/image";
import YoutubeVideo from "./blocks/youtube";
import React, { useRef, useEffect } from "react";

export class Card extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  render() {
    return (
      <div className={"card " + this.props.classes}>
        <div className="card-img-container">
          {this.props.image.youtube ? (
            <YoutubeVideo url={this.props.image.youtube.url} />
          ) : (
            <Image
              image={this.props.image.image}
              height={this.props.height - 20}
              width={this.props.width}
            />
          )}
        </div>
      </div>
    );
  }
}

export const InfiniteHorizontalScroll = ({ images, height }) => {
  const scrollRef = useRef(null);
  const cloneCount = 2; // how many times to clone the image list for the illusion

  // Handle wheel events to scroll horizontally
  const handleWheel = (e) => {
    if (!scrollRef.current) return;

    // Ignore if user is trying to scroll horizontally on touchpad
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY * 30;
  };
  // Create a long list of images for the loop illusion
  const extendedImages = [];
  for (let i = 0; i < cloneCount; i++) {
    extendedImages.push(...images);
  }

  const totalImages = [...extendedImages, ...images, ...extendedImages];

  // Reset scroll position if near the start or end
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const midpoint = container.scrollWidth / 2;
    const buffer = container.clientWidth;

    if (container.scrollLeft < buffer) {
      // reset closer to center
      container.scrollLeft = midpoint;
    } else if (container.scrollLeft + buffer >= container.scrollWidth) {
      container.scrollLeft = midpoint - buffer;
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("scroll", handleScroll);

    // Scroll to center on mount
    container.scrollLeft = container.scrollWidth / 2;

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      style={{
        display: "flex",
        overflowX: "scroll",
        overflowY: "hidden",
        height: height || "200px",
        scrollBehavior: "smooth",
        whiteSpace: "nowrap",
      }}
    >
      {totalImages.map((image, index) => (
        <Card
          key={index}
          title={`card${index}`}
          image={image}
          height={height}
          classes=""
        />
      ))}
    </div>
  );
};
