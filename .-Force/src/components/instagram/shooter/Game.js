import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

import Player from "./Player";
import Explosion from "./Explosion";
import {
  BLOCK_HEIGHT,
  CELL,
  buildLevel,
  columnHeights,
  columnKey,
  destroyBlock,
  solidColumns,
} from "./level";

const NEON = ["#39ff14", "#ff2bd6", "#00e5ff", "#ffe600", "#7a1fff"];
const BLOCK_GEOMETRY = new THREE.BoxGeometry(CELL, BLOCK_HEIGHT, CELL);
const FALL_GRAVITY = 30;
const MAX_EXPLOSIONS = 16;

// New media arriving mid-game drops in as fresh blocks
const DROP_INTERVAL = 1.4; // seconds between drops
const DROPS_PER_IMAGE = 2; // blocks per newly loaded image
const DROP_HEIGHT = 26; // where they fall from
const MAX_STACK = 6; // tallest a column may grow
const MAX_BLOCKS = 600; // keep the scene light
const SAFE_DISTANCE = 2.5 * CELL; // never drop right next to the player

// One block of the level. It owns its position so it can fall when the block under it is shot.
function Block({ block, material }) {
  const ref = useRef();
  const fallSpeed = useRef(0);
  // dropped-in blocks start high above and fall into place
  const [initial] = useState(() => [
    block.cx * CELL,
    block.dropFrom != null ? block.dropFrom : block.y * BLOCK_HEIGHT + BLOCK_HEIGHT / 2,
    block.cz * CELL,
  ]);
  const restY = block.y * BLOCK_HEIGHT + BLOCK_HEIGHT / 2;

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (mesh.position.y > restY) {
      fallSpeed.current += FALL_GRAVITY * Math.min(delta, 1 / 30);
      mesh.position.y = Math.max(restY, mesh.position.y - fallSpeed.current * delta);
    } else {
      fallSpeed.current = 0;
    }
  });

  return (
    <mesh
      ref={ref}
      position={initial}
      geometry={BLOCK_GEOMETRY}
      material={material}
      userData={{ blockId: block.id }}
    />
  );
}

let explosionId = 0;

export default function Game({ textures, onStats, onLockChange, fpsRef, isTouch }) {
  const { camera } = useThree();
  // the level is built from the images available at the start; later ones drop in
  const [level] = useState(() => buildLevel(textures.length));
  const [blocks, setBlocks] = useState(level.blocks);
  const introduced = useRef(textures.length);
  const dropQueue = useRef([]);
  const dropTimer = useRef(DROP_INTERVAL);
  const nextBlockId = useRef(level.blocks.length);
  const [explosions, setExplosions] = useState([]);
  const blocksRef = useRef();
  const blocksState = useRef(blocks);
  const solidRef = useRef(solidColumns(level.blocks));
  const impactLight = useRef();
  const fps = useRef({ frames: 0, time: 0 });

  // One material per image, created when first needed and kept for the whole game,
  // so images arriving later never disturb blocks already in the scene
  const neonMaterials = useMemo(
    () =>
      NEON.map(
        (color) =>
          new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4, roughness: 0.4 })
      ),
    []
  );
  const materialCache = useRef(new Map());
  const materialFor = useCallback(
    (index) => {
      if (textures.length === 0) return neonMaterials[index % neonMaterials.length];
      const texture = textures[index % textures.length];
      let material = materialCache.current.get(texture);
      if (!material) {
        material = new THREE.MeshStandardMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.35,
          roughness: 0.55,
          metalness: 0.15,
        });
        materialCache.current.set(texture, material);
      }
      return material;
    },
    [textures, neonMaterials]
  );
  useEffect(() => {
    const cache = materialCache.current;
    return () => {
      cache.forEach((material) => material.dispose());
      neonMaterials.forEach((material) => material.dispose());
    };
  }, [neonMaterials]);

  const report = useCallback(
    (current) =>
      onStats({
        left: current.length,
        destroyed: nextBlockId.current - current.length, // every block ever placed, minus those left
        incoming: dropQueue.current.length,
      }),
    [onStats]
  );

  // Queue every image that arrived since the last check
  useEffect(() => {
    for (let i = introduced.current; i < textures.length; i++) dropQueue.current.push(i);
    introduced.current = textures.length;
    report(blocksState.current);
  }, [textures.length, report]);

  // Pick free columns away from the player and stack new blocks textured with this image
  const dropImage = (textureIndex, current) => {
    if (current.length >= MAX_BLOCKS) return [];
    const heights = columnHeights(current);
    const { minX, maxX, minZ, maxZ } = level.bounds;
    const candidates = [];
    for (let cx = minX / CELL + 1; cx <= maxX / CELL - 1; cx++) {
      for (let cz = minZ / CELL + 1; cz <= maxZ / CELL - 1; cz++) {
        const height = heights.get(columnKey(cx, cz)) || 0;
        const distance = Math.hypot(cx * CELL - camera.position.x, cz * CELL - camera.position.z);
        if (height < MAX_STACK && distance > SAFE_DISTANCE) candidates.push({ cx, cz, height });
      }
    }
    const spawned = [];
    for (let n = 0; n < DROPS_PER_IMAGE && candidates.length > 0; n++) {
      const [spot] = candidates.splice(Math.floor(Math.random() * candidates.length), 1);
      spawned.push({
        id: nextBlockId.current++,
        cx: spot.cx,
        cz: spot.cz,
        y: spot.height,
        texture: textureIndex,
        dropFrom: DROP_HEIGHT + Math.random() * 10,
      });
    }
    return spawned;
  };

  useEffect(() => {
    blocksState.current = blocks;
    solidRef.current = solidColumns(blocks);
    report(blocks);
  }, [blocks, report]);

  const handleShoot = useCallback(
    (hit) => {
      if (impactLight.current) {
        impactLight.current.position.copy(hit.point);
        impactLight.current.intensity = hit.blockId != null ? 60 : 12;
      }
      const block =
        hit.blockId != null && blocksState.current.find((b) => b.id === hit.blockId);
      if (!block) return;
      setBlocks((current) => destroyBlock(current, hit.blockId));
      setExplosions((current) => [
        ...current.slice(-(MAX_EXPLOSIONS - 1)),
        {
          id: explosionId++,
          position: hit.center,
          point: hit.point,
          direction: hit.direction,
          material: materialFor(block.texture),
        },
      ]);
    },
    [materialFor]
  );

  const removeExplosion = useCallback(
    (id) => setExplosions((current) => current.filter((boom) => boom.id !== id)),
    []
  );

  useFrame((_, delta) => {
    // release queued media as falling blocks, one image at a time
    dropTimer.current -= delta;
    if (dropTimer.current <= 0 && dropQueue.current.length > 0) {
      dropTimer.current = DROP_INTERVAL;
      const textureIndex = dropQueue.current.shift();
      // functional update, so a block shot in the same frame can't be brought back
      setBlocks((current) => {
        const spawned = dropImage(textureIndex, current);
        if (spawned.length === 0) {
          // no free spot right now; try again later
          if (current.length < MAX_BLOCKS) dropQueue.current.push(textureIndex);
          return current;
        }
        return [...current, ...spawned];
      });
    }

    if (impactLight.current) {
      impactLight.current.intensity = Math.max(0, impactLight.current.intensity - delta * 260);
    }
    // frames-per-second readout, written straight to the HUD every half second
    fps.current.frames += 1;
    fps.current.time += delta;
    if (fps.current.time >= 0.5 && fpsRef.current) {
      fpsRef.current.textContent = Math.round(fps.current.frames / fps.current.time);
      fps.current.frames = 0;
      fps.current.time = 0;
    }
  });

  return (
    <>
      <color attach="background" args={["#05010d"]} />
      <fog attach="fog" args={["#05010d", 14, 70]} />

      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#6a5cff", "#16001f", 0.6]} />
      <pointLight position={[-14, 10, -14]} color="#ff2bd6" intensity={120} distance={45} />
      <pointLight position={[14, 10, 14]} color="#00e5ff" intensity={120} distance={45} />
      <pointLight position={[0, 12, 0]} color="#39ff14" intensity={60} distance={40} />
      <pointLight ref={impactLight} color="#b6ff8a" intensity={0} distance={16} decay={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#07030f" roughness={0.85} metalness={0.3} />
      </mesh>
      <Grid
        position={[0, 0.01, 0]}
        args={[200, 200]}
        cellSize={CELL}
        cellThickness={0.6}
        cellColor="#ff2bd6"
        sectionSize={CELL * 5}
        sectionThickness={1.2}
        sectionColor="#00e5ff"
        fadeDistance={70}
        infiniteGrid
      />
      <Sparkles count={180} scale={[44, 10, 44]} position={[0, 5, 0]} size={4} speed={0.35} color="#39ff14" />

      <group ref={blocksRef}>
        {blocks.map((block) => (
          <Block key={block.id} block={block} material={materialFor(block.texture)} />
        ))}
      </group>

      {explosions.map((boom) => (
        <Explosion key={boom.id} boom={boom} material={boom.material} onDone={removeExplosion} />
      ))}

      <Player
        spawn={level.spawn}
        bounds={level.bounds}
        solidRef={solidRef}
        blocksRef={blocksRef}
        onShoot={handleShoot}
        onLockChange={onLockChange}
        isTouch={isTouch}
      />

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.32} luminanceSmoothing={0.25} />
        <Vignette offset={0.3} darkness={0.8} />
      </EffectComposer>
    </>
  );
}
