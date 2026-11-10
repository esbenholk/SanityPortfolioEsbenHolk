import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";

import urlFor from "../../functions/urlFor";
import { BLOCK_HEIGHT, CELL, buildLevel } from "./level";
import { prepareTexture } from "./textures";

const TEXTURE_COUNT = 8;
const BLOCK_GEOMETRY = new THREE.BoxGeometry(CELL, BLOCK_HEIGHT, CELL);
const PLAIN = new THREE.MeshStandardMaterial({
  color: "#2a1745",
  roughness: 0.7,
});

// A few random project images, loaded for the preview (Sanity's CDN allows WebGL to use them)
function usePreviewTextures(projects) {
  const [textures, setTextures] = useState([]);
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const images = (projects || [])
      .map((project) => project.mainImage || project.productImage)
      .filter((image) => image && image.asset)
      .sort(() => Math.random() - 0.5)
      .slice(0, TEXTURE_COUNT);
    const created = [];
    images.forEach((image) =>
      loader.load(urlFor(image.asset).width(400).url(), (texture) => {
        created.push(texture);
        if (!cancelled) setTextures((all) => [...all, prepareTexture(texture)]);
      }),
    );
    return () => {
      cancelled = true;
      created.forEach((texture) => texture.dispose());
    };
  }, [projects]);
  return textures;
}

// All blocks that share an image, drawn in one go
function BlockSet({ blocks, material }) {
  const mesh = useRef();
  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    blocks.forEach((block, i) => {
      matrix.setPosition(
        block.cx * CELL,
        block.y * BLOCK_HEIGHT + BLOCK_HEIGHT / 2,
        block.cz * CELL,
      );
      mesh.current.setMatrixAt(i, matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [blocks]);
  return (
    <instancedMesh
      ref={mesh}
      args={[BLOCK_GEOMETRY, material, blocks.length]}
    />
  );
}

// The camera circles the arena, bobbing a little, always looking at the middle
function Orbit() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime * 0.12;
    camera.position.set(
      Math.sin(t) * 13,
      4.5 + Math.sin(t * 2.3) * 0.8,
      Math.cos(t) * 13,
    );
    camera.lookAt(0, 1.5, 0);
  });
  return null;
}

// A live, non-interactive look into the Instagram block-breaker level
export default function ShooterPreview({ projects }) {
  const textures = usePreviewTextures(projects);
  const materials = useMemo(
    () =>
      textures.map(
        (texture) =>
          new THREE.MeshStandardMaterial({ map: texture, roughness: 0.55 }),
      ),
    [textures],
  );
  const groups = useMemo(() => {
    const { blocks } = buildLevel(Math.max(materials.length, 1));
    const byMaterial = new Map();
    blocks.forEach((block) => {
      const key = materials.length ? block.texture : 0;
      if (!byMaterial.has(key)) byMaterial.set(key, []);
      byMaterial.get(key).push(block);
    });
    return [...byMaterial.entries()];
  }, [materials]);

  useEffect(
    () => () => materials.forEach((material) => material.dispose()),
    [materials],
  );

  return (
    <Canvas
      dpr={1}
      camera={{ fov: 70, near: 0.1, far: 120 }}
      gl={{ antialias: false }}
    >
      <color attach="background" args={["#05010d"]} />
      <fog attach="fog" args={["#05010d", 10, 42]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#6a5cff", "#16001f", 0.8]} />
      <pointLight
        position={[-10, 9, -10]}
        color="#ff2bd6"
        intensity={90}
        distance={40}
      />
      <pointLight
        position={[10, 9, 10]}
        color="#00e5ff"
        intensity={90}
        distance={40}
      />
      <Grid
        position={[0, 0.001, 0]}
        args={[60, 60]}
        cellSize={CELL}
        cellColor="#3a1d6e"
        sectionSize={CELL * 5}
        sectionColor="#ff2bd6"
        fadeDistance={45}
        infiniteGrid
      />
      {groups.map(([key, blocks]) => (
        <BlockSet
          key={`${materials.length}-${key}`}
          blocks={blocks}
          material={materials[key] || PLAIN}
        />
      ))}
      <Orbit />
    </Canvas>
  );
}
