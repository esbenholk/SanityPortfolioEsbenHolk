import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

import urlFor from "../functions/urlFor";
import { hashOf } from "../retro/theme";
import { Sky, SUN_DIRECTION, Water } from "./Environment";
import Sailor from "./Sailor";
import { PALETTE, slope, wave } from "./waves";

const CONCURRENT_LOADS = 4;

// Where each project's cube floats: a sunflower spiral around the starting point,
// so they spread evenly however many projects there are
function layout(projects) {
  return projects.map((project, i) => {
    const hash = hashOf(project.slug.current);
    const angle = i * 2.39996;
    const radius = 12 + 6.5 * Math.sqrt(i + 1);
    return {
      project,
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      size: 2.6 + (hash % 100) / 70,
      spin: (hash % 628) / 100,
      phase: (hash % 1000) / 160,
    };
  });
}

// Square crops of each project's image, loaded a few at a time (Sanity's CDN allows WebGL to use them)
function useCubeTextures(projects) {
  const [textures, setTextures] = useState({});
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const created = [];
    const queue = projects.filter((project) => {
      const image = project.mainImage || project.productImage;
      return image && image.asset;
    });
    const next = () => {
      const project = queue.shift();
      if (!project || cancelled) return;
      const image = project.mainImage || project.productImage;
      const url = urlFor(image.asset).width(512).height(512).fit("crop").url();
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 4;
          created.push(texture);
          if (!cancelled)
            setTextures((all) => ({ ...all, [project.slug.current]: texture }));
          next();
        },
        undefined,
        next,
      );
    };
    for (let i = 0; i < CONCURRENT_LOADS; i++) next();
    return () => {
      cancelled = true;
      created.forEach((texture) => texture.dispose());
    };
  }, [projects]);
  return textures;
}

// One project: a cube bobbing on the swell, slowly turning. Points to be explored.
function ProjectCube({ spot, texture, hovered, onHover, onExplore, dragged }) {
  const mesh = useRef();
  const { project, x, z, size, spin, phase } = spot;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const lean = slope(x, z, t);
    const cube = mesh.current;
    if (!cube) return;
    cube.position.set(
      x,
      wave(x, z, t) * 0.35 + size * 0.3 + Math.sin(t * 0.7 + phase) * 0.06,
      z,
    );
    cube.rotation.set(lean.z * 0.25, spin + t * 0.04, -lean.x * 0.25);
    const scale = THREE.MathUtils.lerp(cube.scale.x, hovered ? 1.08 : 1, 0.12);
    cube.scale.setScalar(scale);
  });

  return (
    <mesh
      ref={mesh}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(project);
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        // a drag to look around isn't a click
        if (dragged.current > 6) return;
        e.stopPropagation();
        onExplore(project);
      }}
    >
      <boxGeometry args={[size, size, size]} />
      {/* glossy and clear-coated, like the camera-shake example's model */}
      <meshPhysicalMaterial
        key={texture ? "image" : "plain"}
        map={texture || null}
        color={texture ? "#ffffff" : "#efe7dc"}
        roughness={0.08}
        clearcoat={1}
        clearcoatRoughness={0}
        envMapIntensity={0.9}
        emissive="#ffffff"
        emissiveIntensity={hovered ? 0.14 : 0}
      />
    </mesh>
  );
}

// The ocean home page's 3D part: sky, water, a cube per project, and the visitor's boat.
// `onHoverStart` is told each time the pointer arrives on a cube (the page blows its title across the screen).
export default function OceanScene({
  projects,
  paused,
  onExplore,
  onMove,
  onReady,
  onHoverStart,
}) {
  const spots = useMemo(() => layout(projects), [projects]);
  const textures = useCubeTextures(projects);
  const [hovered, setHovered] = useState(null);
  const dragged = useRef(0);
  const loaded = Object.keys(textures).length;

  const handleHover = useCallback(
    (project) => {
      setHovered(project);
      if (project && onHoverStart) onHoverStart(project);
    },
    [onHoverStart],
  );

  useEffect(() => {
    if (onReady) onReady(loaded, spots.length);
  }, [loaded, spots.length, onReady]);

  useEffect(() => {
    document.body.style.cursor = hovered && !paused ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered, paused]);

  const sun = SUN_DIRECTION.clone().multiplyScalar(80);

  return (
    <Canvas
      className="ocean-canvas"
      dpr={[1, 1.5]}
      camera={{ fov: 62, near: 0.1, far: 1500, position: [0, 2.2, 0] }}
    >
      {/* a close, soft mist: the far cubes fade into the horizon colour */}
      <fog attach="fog" args={[PALETTE.horizon, 28, 150]} />
      {/* what the glossy cubes reflect: soft glowing panels in the dawn colours
          (made on the spot, nothing to download) */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={2}
          color={PALETTE.sun}
          position={[-10, 6, -20]}
          scale={[30, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color={PALETTE.horizon}
          position={[20, 4, 10]}
          rotation-y={-Math.PI / 2}
          scale={[40, 10, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          color={PALETTE.zenith}
          position={[0, 20, 0]}
          rotation-x={Math.PI / 2}
          scale={[50, 50, 1]}
        />
        <Lightformer
          form="ring"
          intensity={1.5}
          color={PALETTE.shallow}
          position={[0, -6, 0]}
          rotation-x={-Math.PI / 2}
          scale={20}
        />
      </Environment>
      <Sky />
      <Suspense fallback={null}>
        <Water />
      </Suspense>
      <hemisphereLight args={[PALETTE.horizon, PALETTE.deep, 1.3]} />
      <directionalLight
        position={[sun.x, sun.y, sun.z]}
        intensity={2}
        color={PALETTE.sun}
      />
      <ambientLight intensity={0.35} />
      {spots.map((spot) => (
        <ProjectCube
          key={spot.project.slug.current}
          spot={spot}
          texture={textures[spot.project.slug.current]}
          hovered={!paused && hovered === spot.project}
          onHover={handleHover}
          onExplore={onExplore}
          dragged={dragged}
        />
      ))}
      <Sailor
        paused={paused}
        dragged={dragged}
        obstacles={spots}
        onMove={onMove}
        start={[0, 0, 0]}
      />
    </Canvas>
  );
}
