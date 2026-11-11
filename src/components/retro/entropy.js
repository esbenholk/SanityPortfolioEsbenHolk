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

  const walk = (el) => {
    if (pieces.length >= MAX_PIECES) return;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return;
    if (style.position === "fixed") return; // pop-ups and the like stay where they are
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    // decorations far bigger than the screen (rotated backgrounds) are left alone
    if (rect.width > vw * 1.6 || rect.height > vh * 3) {
      [...el.children].forEach(walk);
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
  return { pieces, shells };
}

export default function start(root) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { pieces, shells } = collectPieces(root);

  // remember everything we're about to change
  const saved = pieces.map(({ el }) => el.getAttribute("style"));
  const previousOverflow = document.body.style.overflow;

  const engine = Matter.Engine.create();
  engine.gravity.y = 1.1;

  const bodies = pieces.map(({ el, rect }) => {
    let { left, top } = rect;
    // pieces outside the screen rain down from above
    if (top > vh || rect.bottom < -vh)
      top = -rect.height - Math.random() * vh * 1.5;
    const body = Matter.Bodies.rectangle(
      left + rect.width / 2,
      top + rect.height / 2,
      rect.width,
      rect.height,
      { restitution: 0.25, friction: 0.4, frictionAir: 0.012 },
    );
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03);
    // the element now floats above the page, drawn wherever its body is
    Object.assign(el.style, {
      position: "fixed",
      left: "0px",
      top: "0px",
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: "0",
      boxSizing: "border-box",
      transformOrigin: "50% 50%",
      transition: "none",
      zIndex: "9000",
    });
    return { el, body, w: rect.width, h: rect.height };
  });

  shells.forEach((el) => el.classList.add("entropy-shell"));
  document.body.classList.add("entropy-on");
  document.body.style.overflow = "hidden";
  window.scrollTo(0, 0);

  // floor and walls around the screen (tall, so pieces raining from above stay inside)
  const walls = [
    Matter.Bodies.rectangle(vw / 2, vh + WALL / 2, vw * 3, WALL, {
      isStatic: true,
    }),
    Matter.Bodies.rectangle(-WALL / 2, 0, WALL, vh * 8, { isStatic: true }),
    Matter.Bodies.rectangle(vw + WALL / 2, 0, WALL, vh * 8, { isStatic: true }),
  ];
  Matter.Composite.add(engine.world, [...bodies.map((b) => b.body), ...walls]);

  // grab and throw
  const mouse = Matter.Mouse.create(document.body);
  const grab = Matter.MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  Matter.Composite.add(engine.world, grab);

  let frame;
  let last = performance.now();
  const tick = (now) => {
    Matter.Engine.update(engine, Math.min(now - last, 32));
    last = now;
    bodies.forEach(({ el, body, w, h }) => {
      el.style.transform = `translate(${body.position.x - w / 2}px, ${
        body.position.y - h / 2
      }px) rotate(${body.angle}rad)`;
    });
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
    bodies.forEach(({ el }, i) => {
      if (saved[i] === null) el.removeAttribute("style");
      else el.setAttribute("style", saved[i]);
    });
    shells.forEach((el) => el.classList.remove("entropy-shell"));
    document.body.classList.remove("entropy-on");
    document.body.style.overflow = previousOverflow;
    restore.remove();
  };
  restore.addEventListener("click", stop);
  document.body.appendChild(restore);

  return stop;
}
