import React, {
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  useGLTF,
} from "@react-three/drei";
import { SimplexNoise } from "three-stdlib";
import * as THREE from "three";

import Marquee from "../retro/Marquee";

import AppContext from "../../globalState";
import ThemeSwitcher from "../retro/ThemeSwitcher";

// The laptop and how it's built, from pmndrs' "mixing-html-and-webgl-w-occlusion" example
// (https://github.com/pmndrs/examples, MIT licence). It's Draco-compressed; the decoder
// is in public/draco/ so nothing has to come from another server.
const MODEL = process.env.PUBLIC_URL + "/computer/mac-draco.glb";
const DRACO = process.env.PUBLIC_URL + "/draco/";

const SLOGANS = [
  "EVERYTHING EVERYWHERE IS JUST LAYERS OF ALIENATION",
  "NOTHING IS REAL",
  "VIRTUAL REALITY BECCOMES PERFORMED REALITY BECOMES CORPORAL REALITY",
  "UNREALITY ON SCREEN",
  "DIDN'T I TELL U I WAS UNNECESSARY",
  "I LOVE U",
  "R U ALSO CONFUSED?",
  "R U ALSO STUCK?",
  "A WORLD WIDE WEB OF DISTRACTIONS",
  "MY FIRST LOVE WAS 4 CYBERSPACE",
  "WHEN I DIE I WANT YOU TO DESTROY MY COMPUTER",
  "ALIENATE ME LIKE 1 OF UR FRENCH GIRLS",
  "IN MY DREAMS THE BUTTONS DONT WORK",
];

// The background marquees: how many, how many slogans each, and the colours they may get
// (text, border and background are each picked from these, all three different)
const MARQUEE_COUNT = 7;
const SLOGANS_PER_MARQUEE = 4;
const MARQUEE_COLORS = [
  "var(--c-red)",
  "var(--c-yellow)",
  "var(--c-blue)",
  "var(--c-magenta)",
  "var(--c-lime)",
  "var(--c-cyan)",
  "var(--c-orange)",
  "var(--c-purple)",
  "#000",
  "#fff",
];

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// For the tube on the screen: its own slogans and its black/orange/pink colours
const TUBE_SLOGANS = [
  "ADDICTED TO CONTENT",
  "HOT WORKS IN YOUR AREA",
  "CONTENT FETISHISM",
  "100% FREE — NO SIGNUP",
  "HOT HOT HOT",
  "WATCH UNTIL THE END",
  "THE ALGORITHM LOVES YOU",
  "SKIP AD IN 5",
  "FUCK MY MEMES",
  "R U STILL WATCHING?",
  "I LOVE U",
  "LIKE AND SUBSCRIBE TO THE VOID",
];
const TUBE_COLORS = [
  "#000",
  "#121212",
  "#ff9000",
  "#ff2d2d",
  "#ffd000",
  "#fff",
  "#9a9a9a",
];

// What surrounds the laptop, depending on which site is on its screen
// (the store or the tube: whichever was picked last before coming to the computer)
const SCREENS = {
  storefront: { slogans: SLOGANS, colors: MARQUEE_COLORS, fog: "#33ff00" },
  tube: { slogans: TUBE_SLOGANS, colors: TUBE_COLORS, fog: "#0b0b0b" },
};

// A random set of marquees: each gets its own mix of slogans and three different colours,
// alternating direction
const randomMarquees = (screen) =>
  Array.from({ length: MARQUEE_COUNT }, (_, i) => {
    const [text, border, background] = shuffle(screen.colors);
    return {
      items: shuffle(screen.slogans).slice(0, SLOGANS_PER_MARQUEE),
      reverse: i % 2 === 0,
      colors: {
        "--marquee-text": text,
        "--marquee-border": border,
        "--marquee-bg": background,
      },
    };
  });

// the camera: further back looking at the laptop, or right in front of the screen
const VIEWS = {
  out: {
    position: new THREE.Vector3(-5, 0.5, -15),
    look: new THREE.Vector3(0, 0.6, 0),
  },
  in: {
    position: new THREE.Vector3(0, 2.1, -6.1),
    look: new THREE.Vector3(0, 1.9, 0),
  },
};
const noise = new SimplexNoise();

// The laptop, gently floating. Its screen shows the site in an iframe (always with the
// "I miss the internet" skin) that is hidden properly when the laptop turns away.
function Laptop({ src, zoomed }) {
  const group = useRef();
  const { nodes, materials } = useGLTF(MODEL, DRACO);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const g = group.current;
    // float a little; hold still while you're reading the screen
    const calm = zoomed ? 0.15 : 1;
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      (Math.cos(t / 2) / 20) * calm + 0.25,
      0.1,
    );
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      (Math.sin(t / 4) / 20) * calm,
      0.1,
    );
    g.rotation.z = THREE.MathUtils.lerp(
      g.rotation.z,
      (Math.sin(t / 8) / 20) * calm,
      0.1,
    );
    g.position.y = THREE.MathUtils.lerp(
      g.position.y,
      ((-2 + Math.sin(t / 2)) / 2) * calm,
      0.1,
    );
  });

  return (
    <group ref={group} dispose={null}>
      <group rotation-x={-0.425} position={[0, -0.04, 0.41]}>
        <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            material={materials.aluminium}
            geometry={nodes["Cube008"].geometry}
          />
          <mesh
            material={materials["matte.001"]}
            geometry={nodes["Cube008_1"].geometry}
          />
          <mesh geometry={nodes["Cube008_2"].geometry}>
            <Html
              className="computer-screen"
              rotation-x={-Math.PI / 2}
              position={[0, 0.05, -0.09]}
              scale={0.25}
              transform
              occlude
            >
              {/* the site, at desktop size, shrunk onto the screen */}
              <div
                className="computer-screen__wrapper"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <iframe src={src} title="The site, on the computer" />
              </div>
            </Html>
          </mesh>
        </group>
      </group>
      <mesh
        material={materials.keys}
        geometry={nodes.keyboard.geometry}
        position={[1.79, 0, 3.45]}
      />
      <group position={[0, -0.1, 3.39]}>
        <mesh
          material={materials.aluminium}
          geometry={nodes["Cube002"].geometry}
        />
        <mesh
          material={materials.trackpad}
          geometry={nodes["Cube002_1"].geometry}
        />
      </group>
      <mesh
        material={materials.touchbar}
        geometry={nodes.touchbar.geometry}
        position={[0, -0.03, 1.2]}
      />
    </group>
  );
}

// After the camera-shake example: the camera eases after the mouse and sways a little
function Rig({ zoomed }) {
  const look = useRef(VIEWS.out.look.clone());
  const goal = useRef(new THREE.Vector3());
  useFrame(({ camera, pointer, clock }, delta) => {
    const view = zoomed ? VIEWS.in : VIEWS.out;
    const t = clock.elapsedTime;
    const ease = 1 - Math.exp(-3 * Math.min(delta, 0.05));
    const reach = zoomed ? 0.4 : 2.5; // less mouse-wandering while reading the screen
    goal.current.copy(view.position);
    goal.current.x += pointer.x * reach;
    goal.current.y += pointer.y * reach * 0.4;
    camera.position.lerp(goal.current, ease);
    look.current.lerp(view.look, ease);
    camera.lookAt(look.current);
    const shake = zoomed ? 0.002 : 0.01;
    camera.rotation.x += shake * noise.noise(t * 0.5, 1);
    camera.rotation.y += shake * noise.noise(t * 0.5, 2);
    camera.rotation.z += shake * noise.noise(t * 0.4, 3);
  });
  return null;
}

// The "computer" skin (desktop only): the "I miss the internet" site, live, on a floating laptop.
// Whatever address you're on is what the screen shows; links inside it work as usual.
export default function ComputerLayout() {
  const { pathname } = useLocation();
  const [zoomed, setZoomed] = useState(false);
  // picked once per visit, so the marquees don't reshuffle when you zoom in and out
  const { computerScreen } = useContext(AppContext);
  const screenSkin = SCREENS[computerScreen] ? computerScreen : "storefront";
  const screen = SCREENS[screenSkin];
  const [marquees] = useState(() => randomMarquees(screen));
  const src = `${pathname}?skin=${screenSkin}`;

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`computer computer--${screenSkin}`}>
      <div className="computer-marquee-background">
        {marquees.map((marquee, i) => (
          <div className="computer-marquee" style={marquee.colors} key={i}>
            <Marquee
              reverse={marquee.reverse}
              className="marquee--ticker headline--ticker"
              items={marquee.items}
            />
          </div>
        ))}
      </div>
      <Canvas camera={{ position: VIEWS.out.position.toArray(), fov: 55 }}>
        <fog attach="fog" args={[screen.fog, 18, 40]} />
        <pointLight
          position={[10, 10, 10]}
          intensity={1.5 * Math.PI}
          decay={0}
        />
        <Suspense fallback={null}>
          <group rotation={[0, Math.PI, 0]} position={[0, 1, 0]}>
            <Laptop src={src} zoomed={zoomed} />
          </group>
          {/* soft studio lights for the aluminium to reflect (made on the spot, no download) */}
          <Environment resolution={256}>
            <Lightformer
              form="rect"
              intensity={3}
              position={[0, 6, -10]}
              scale={[20, 6, 1]}
            />
            <Lightformer
              form="rect"
              intensity={1.5}
              color="#ff2bd6"
              position={[-12, 2, 0]}
              rotation-y={Math.PI / 2}
              scale={[20, 8, 1]}
            />
            <Lightformer
              form="rect"
              intensity={1.5}
              color="#00e5ff"
              position={[12, 2, 0]}
              rotation-y={-Math.PI / 2}
              scale={[20, 8, 1]}
            />
          </Environment>
        </Suspense>
        <ContactShadows position={[0, -4.5, 0]} scale={20} blur={2} far={4.5} />
        <Rig zoomed={zoomed} />
      </Canvas>
      <div className="computer-bar">
        <button className="btn95" onClick={() => setZoomed(!zoomed)}>
          {zoomed ? "⤡ STEP BACK" : "⤢ SIT DOWN AT THE COMPUTER"}
        </button>
        <ThemeSwitcher />
      </div>
    </div>
  );
}

useGLTF.preload(MODEL, DRACO);
