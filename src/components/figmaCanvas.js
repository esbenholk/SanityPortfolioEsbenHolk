import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useContext,
} from "react";
import { useGesture } from "@use-gesture/react";
import { useSpring, animated } from "@react-spring/web";
import AppContext from "../globalState";
import sanityClient from "../client";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(sanityClient);
function urlFor(source) {
  return builder.image(source);
}

const CanvasElementTypes = {
  IMAGE: "image",
  BUTTON: "button",
};

const Canvas = forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);
  const elementRefs = useRef({});

  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: { tension: 300, friction: 30 },
  }));

  const zoomRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });

  const updateLines = () => {
    // force re-render
    setConnections((prev) => [...prev]);
  };

  const bind = useGesture(
    {
      onDrag: ({ offset: [dx, dy] }) => {
        positionRef.current = { x: dx, y: dy };
        api.start({ x: dx, y: dy });
      },
      onPinch: ({ offset: [d] }) => {
        zoomRef.current = d;
        api.start({ scale: d });
      },
      onWheel: ({ event, delta: [, dy] }) => {
        event.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;

        const oldScale = zoomRef.current;
        const newScale = Math.max(0.1, oldScale - dy * 0.001);

        const deltaScale = newScale - oldScale;
        const newX = positionRef.current.x - cursorX * deltaScale;
        const newY = positionRef.current.y - cursorY * deltaScale;

        positionRef.current = { x: newX, y: newY };
        zoomRef.current = newScale;

        api.start({ x: newX, y: newY, scale: newScale });
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
      drag: { from: () => [positionRef.current.x, positionRef.current.y] },
      pinch: { scaleBounds: { min: 0.1, max: 4 }, rubberband: true },
    }
  );

  const addImage = (id, imageUrl, x, y, width, label = "") => {
    setElements((prev) => [
      ...prev,
      { id, type: CanvasElementTypes.IMAGE, imageUrl, x, y, width, label },
    ]);
  };

  const addButton = (id, title, url, x, y) => {
    setElements((prev) => [
      ...prev,
      { id, type: CanvasElementTypes.BUTTON, title, url, x, y },
    ]);
  };

  const connectElements = (...ids) => {
    setConnections((prev) => [...prev, ids]);
  };

  const handleRecenter = () => {
    zoomRef.current = 1;
    positionRef.current = { x: 0, y: 0 };
    api.start({ x: 0, y: 0, scale: 1 });
  };

  useImperativeHandle(ref, () => ({
    addImage,
    addButton,
    connectElements,
  }));

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", top: 0, bottom: 0, right: 0, left: 0 }}
    >
      <animated.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          willChange: "transform",
          x,
          y,
          scale,
        }}
      >
        {elements.map((el) => {
          if (el.type === CanvasElementTypes.IMAGE) {
            return (
              <div
                key={el.id}
                ref={(ref) => (elementRefs.current[el.id] = ref)}
                style={{
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  width: el.width,
                }}
              >
                <img src={el.imageUrl} style={{ width: "100%" }} />
                {el.label && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "0.75rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {el.label}
                  </div>
                )}
              </div>
            );
          } else if (el.type === CanvasElementTypes.BUTTON) {
            return (
              <a
                key={el.id}
                href={el.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                }}
              >
                {el.title}
              </a>
            );
          }
          return null;
        })}
      </animated.div>

      <button
        onClick={handleRecenter}
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#16a34a",
          color: "white",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          border: "none",
          cursor: "pointer",
        }}
      >
        Recenter
      </button>
    </div>
  );
});

export default function FigmaCanvas() {
  const canvasRef = useRef();
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;

  useEffect(() => {
    canvasRef.current.addImage(
      "img1",
      urlFor(info.mainImage).width(10).url(),
      100,
      100,
      150,
      "Image One"
    );
    canvasRef.current.addImage(
      "img2",
      urlFor(info.mainImage).width(10).url(),
      300,
      200,
      100,
      "Image Two"
    );
    canvasRef.current.addButton(
      "btn1",
      "Visit",
      "https://example.com",
      500,
      250
    );
    canvasRef.current.connectElements("img1", "img2", "btn1");
  }, []);

  return <Canvas ref={canvasRef} />;
}
