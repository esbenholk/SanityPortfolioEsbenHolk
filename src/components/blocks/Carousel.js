import React from "react";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function CustomCarousel({ children, arrows, classsss }) {
  return (
    <Carousel
      swipeable={true}
      swipeScrollTolerance={20}
      stopOnHover={true}
      showIndicators={true}
      emulateTouch={true}
      showStatus={false}
      showThumbs={false}
      autoPlay={false}
      showArrows={arrows}
      className={classsss}
      renderArrowPrev={(clickHandler, hasPrev, labelPrev) =>
        hasPrev && (
          <button onClick={clickHandler} className="arrow prevArrow">
            {"<"}
          </button>
        )
      }
      renderArrowNext={(clickHandler, hasNext, labelNext) =>
        hasNext && (
          <button onClick={clickHandler} className="arrow nextArrow">
            {">"}
          </button>
        )
      }
    >
      {children}
    </Carousel>
  );
}
