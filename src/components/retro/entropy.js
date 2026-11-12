import Matter from "matter-js";

// ENTROPY: every piece of the page becomes a box in a 2D physics world (matter-js)
// and collapses under gravity. Pieces can be grabbed and thrown with the mouse.
// start(root) does it to everything inside `root` and returns stop(), which puts the page back.

const MAX_PIECES = 350;
// these are always one piece, whatever is inside them
const SOLID_TAGS = new Set([
  "IMG",
  "CANVAS",
  "VIDEO",
  "IFRAME",
  "BUTTON",
  "A",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "svg",
  "SVG",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "P",
  "LI",
  "DT",
  "DD",
  "TD",
  "TH",
  "LABEL",
  "FIGURE",
]);
// pictures, videos, frames and 3D canvases never break up
const MEDIA_TAGS = new Set(["IMG", "CANVAS", "VIDEO", "IFRAME", "svg", "SVG"]);
const WALL = 200;

// Split the page into pieces: small or solid elements become pieces; bigger boxes are
// opened up and their contents become pieces instead (the opened boxes turn see-through).
function collectPieces(root) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pieces = [];
  const shells = [];
  const hidden = [];

  const walk = (el) => {
    if (pieces.length >= MAX_PIECES) return;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return;
    if (style.position === "fixed") return; // pop-ups and the like stay where they are
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    // decorations far bigger than the screen (rotated backgrounds): hidden while
    // everything falls (they'd hang in the air), their contents still fall
    if (rect.width > vw * 1.6 || rect.height > vh * 3) {
      if (el.children.length) {
        shells.push(el);
        [...el.children].forEach(walk);
      } else hidden.push(el);
      return;
    }
    const children = [...el.children];
    // a 3D scene's wrapper is one piece, so its canvas keeps its size
    const holdsCanvas = el.querySelector(
      ":scope > canvas, :scope > div > canvas",
    );
    const area = rect.width * rect.height;
    const small = area < vw * vh * 0.05 && rect.height < vh * 0.35;
    // links, buttons, headings… are one piece unless they're big (like a whole product card)
    const solid =
      MEDIA_TAGS.has(el.tagName) ||
      (SOLID_TAGS.has(el.tagName) &&
        (area < vw * vh * 0.15 || !children.length));
    if (solid || holdsCanvas || !children.length || small) {
      pieces.push({ el, rect });
      return;
    }
    shells.push(el);
    children.forEach(walk);
  };
  [...root.children].forEach(walk);
  return { pieces, shells, hidden };
}

// The page falls at full size the moment entropy starts; after a beat the view zooms
// out (like a camera pulling back) until the whole page and its pile fit the screen.
const ZOOM_DELAY = 500;
const ZOOM_MS = 1400;
const MARGIN = 24;
const MIN_SCALE = 0.6;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export default function start(root) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const startScroll = window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;
  const { pieces, shells, hidden } = collectPieces(root);

  // remember everything we're about to change
  const saved = pieces.map(({ el }) => el.getAttribute("style"));
  const previousOverflow = document.body.style.overflow;

  // Where the camera ends up: the whole page shrunk to fit the screen (but not smaller
  // than MIN_SCALE: a very long page keeps its bottom on screen)
  const scale = Math.max(
    MIN_SCALE,
    Math.min(1, (vh - MARGIN * 2) / pageHeight),
  );
  const camFrom = { x: 0, y: -startScroll, zoom: 1 };
  const camTo = {
    x: (vw - vw * scale) / 2,
    y: Math.min(MARGIN, vh - MARGIN - pageHeight * scale),
    zoom: scale,
  };
  const cam = { ...camFrom };

  // the physics world uses page coordinates at full size; the camera only changes the view
  const items = pieces.map(({ el, rect }) => {
    const w = rect.width;
    const h = rect.height;
    // the element now floats above the page, drawn wherever we put it
    Object.assign(el.style, {
      position: "fixed",
      left: "0px",
      top: "0px",
      width: `${w}px`,
      height: `${h}px`,
      margin: "0",
      boxSizing: "border-box",
      transformOrigin: "50% 50%",
      transition: "none",
      zIndex: "9000",
    });
    return {
      el,
      w,
      h,
      x: rect.left + w / 2,
      y: rect.top + startScroll + h / 2,
    };
  });
  const draw = (item, x, y, angle) => {
    const sx = cam.x + x * cam.zoom;
    const sy = cam.y + y * cam.zoom;
    item.el.style.transform = `translate(${sx - item.w / 2}px, ${
      sy - item.h / 2
    }px) rotate(${angle}rad) scale(${cam.zoom})`;
  };
  items.forEach((item) => draw(item, item.x, item.y, 0));

  shells.forEach((el) => el.classList.add("entropy-shell"));
  hidden.forEach((el) => el.classList.add("entropy-hidden"));
  document.body.classList.add("entropy-on");
  document.body.style.overflow = "hidden";
  window.scrollTo({ top: 0, behavior: "instant" });

  const engine = Matter.Engine.create();
  engine.gravity.y = 1.1;

  const bodies = items.map((item) => {
    const body = Matter.Bodies.rectangle(
      item.x,
      item.y,
      Math.max(item.w, 2),
      Math.max(item.h, 2),
      { restitution: 0.25, friction: 0.4, frictionAir: 0.012 },
    );
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03);
    return { item, body };
  });
  // the floor is the bottom of the page; walls on both sides, as tall as the page
  const walls = [
    Matter.Bodies.rectangle(vw / 2, pageHeight + WALL / 2, vw * 3, WALL, {
      isStatic: true,
    }),
    Matter.Bodies.rectangle(-WALL / 2, pageHeight / 2, WALL, pageHeight * 3, {
      isStatic: true,
    }),
    Matter.Bodies.rectangle(
      vw + WALL / 2,
      pageHeight / 2,
      WALL,
      pageHeight * 3,
      { isStatic: true },
    ),
  ];
  Matter.Composite.add(engine.world, [...bodies.map((b) => b.body), ...walls]);

  // grab and throw (the mouse is mapped through the camera)
  const mouse = Matter.Mouse.create(document.body);
  const grab = Matter.MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  Matter.Composite.add(engine.world, grab);

  const began = performance.now();
  let last = began;
  let frame;
  const tick = (now) => {
    // the camera pulls back once things are already falling
    const k = ease(
      Math.min(1, Math.max(0, (now - began - ZOOM_DELAY) / ZOOM_MS)),
    );
    cam.x = camFrom.x + (camTo.x - camFrom.x) * k;
    cam.y = camFrom.y + (camTo.y - camFrom.y) * k;
    cam.zoom = camFrom.zoom + (camTo.zoom - camFrom.zoom) * k;
    Matter.Mouse.setScale(mouse, { x: 1 / cam.zoom, y: 1 / cam.zoom });
    Matter.Mouse.setOffset(mouse, {
      x: -cam.x / cam.zoom,
      y: -cam.y / cam.zoom,
    });

    Matter.Engine.update(engine, Math.min(now - last, 32));
    last = now;
    bodies.forEach(({ item, body }) =>
      draw(item, body.position.x, body.position.y, body.angle),
    );
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  // the way back
  const restore = document.createElement("button");
  restore.className = "entropy-restore";
  restore.textContent = "↺ RESTORE ORDER";

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    [
      "mousemove",
      "mousedown",
      "mouseup",
      "wheel",
      "touchmove",
      "touchstart",
      "touchend",
    ].forEach((type) => {
      const handler = mouse[type === "wheel" ? "mousewheel" : type];
      if (handler) mouse.element.removeEventListener(type, handler);
    });
    Matter.Composite.clear(engine.world, false);
    Matter.Engine.clear(engine);
    items.forEach(({ el }, i) => {
      if (saved[i] === null) el.removeAttribute("style");
      else el.setAttribute("style", saved[i]);
    });
    shells.forEach((el) => el.classList.remove("entropy-shell"));
    hidden.forEach((el) => el.classList.remove("entropy-hidden"));
    document.body.classList.remove("entropy-on");
    document.body.style.overflow = previousOverflow;
    restore.remove();
    // back to where you were on the page. For a moment the page is still settling
    // (parts above grow and shrink back), so hold the position for a second.
    const back = performance.now();
    const scrollBack = () => {
      window.scrollTo({ top: startScroll, behavior: "instant" });
      if (performance.now() - back < 1000) requestAnimationFrame(scrollBack);
    };
    requestAnimationFrame(scrollBack);
  };
  restore.addEventListener("click", stop);
  document.body.appendChild(restore);

  return stop;
}
