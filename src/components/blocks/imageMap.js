import React from "react";
import ImageMapper from "react-img-mapper";

const Mapper = props => {
  const URL = "https://c1.staticflickr.com/5/4052/4503898393_303cfbc9fd_b.jpg";
  const MAP = {
    name: "my-map",
    // GET JSON FROM BELOW URL AS AN EXAMPLE
    areas: [
      {
        name: "1",
        shape: "poly",
        coords: [25, 33, 27, 300, 128, 240, 128, 94],
        preFillColor: "green",
        fillColor: "blue"
      },
      {
        name: "2",
        shape: "poly",
        coords: [219, 118, 220, 210, 283, 210, 284, 119],
        preFillColor: "pink"
      },
      {
        name: "3",
        shape: "poly",
        coords: [381, 241, 383, 94, 462, 53, 457, 282],
        fillColor: "yellow"
      },
      {
        name: "4",
        shape: "poly",
        coords: [245, 285, 290, 285, 274, 239, 249, 238],
        preFillColor: "red"
      },
      { name: "5", shape: "circle", coords: [170, 100, 25] }
    ]
  };

  return (
    <ImageMapper
      src={URL}
      map={MAP}
      responsive={props.responsive} // dynamic responsive
      parentWidth={props.parentWidth} // dynamic parentWidth
    />
  );
};

export default Mapper;
