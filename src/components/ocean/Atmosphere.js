import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { SimplexNoise } from "three-stdlib";
import * as THREE from "three";

import { PALETTE, wave } from "./waves";

const noise = new SimplexNoise();

// A soft round blob, drawn once, used for the fog banks
function makeFogTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.45)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Glowing motes drifting above the water: small ones low, bigger slower ones higher up
export function Motes() {
  return (
    <>
      <Sparkles
        count={420}
        scale={[220, 8, 220]}
        position={[0, 4, 0]}
        size={3}
        speed={0.25}
        opacity={0.85}
        color={PALETTE.sun}
        noise={1.5}
      />
      <Sparkles
        count={160}
        scale={[260, 40, 260]}
        position={[0, 22, 0]}
        size={7}
        speed={0.12}
        opacity={0.5}
        color={PALETTE.horizon}
        noise={2}
      />
    </>
  );
}

// Low banks of mist lying on the water, drifting slowly. Where they gather is decided by
// noise, so they form patches with clear water in between.
export function FogBanks({ count = 70 }) {
  const texture = useMemo(makeFogTexture, []);
  const group = useRef();
  const banks = useMemo(() => {
    const list = [];
    let tries = 0;
    while (list.length < count && tries < count * 20) {
      tries += 1;
      const x = (Math.random() - 0.5) * 260;
      const z = (Math.random() - 0.5) * 260;
      if (Math.hypot(x, z) < 14) continue; // keep the starting point clear
      if (noise.noise(x * 0.012, z * 0.012) < 0.1) continue;
      list.push({
        x,
        z,
        y: 0.8 + Math.random() * 3,
        size: 18 + Math.random() * 34,
        drift: Math.random() * Math.PI * 2,
        opacity: 0.18 + Math.random() * 0.22,
      });
    }
    return list;
  }, [count]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    group.current.children.forEach((sprite, i) => {
      const bank = banks[i];
      sprite.position.set(
        bank.x + Math.sin(t * 0.05 + bank.drift) * 6,
        bank.y + Math.sin(t * 0.3 + bank.drift) * 0.3,
        bank.z + Math.cos(t * 0.04 + bank.drift) * 6,
      );
    });
  });

  return (
    <group ref={group}>
      {banks.map((bank, i) => (
        <sprite key={i} scale={[bank.size, bank.size * 0.35, 1]}>
          <spriteMaterial
            map={texture}
            color={PALETTE.horizon}
            transparent
            opacity={bank.opacity}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}

// Simplex noise for the plants' sway, in GLSL (Ian McEwan, Ashima Arts, MIT licence)
const SNOISE = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

// Reeds growing out of the water. They sway with simplex noise (each one a little
// differently, like a current running through them) and lean more towards their tips.
// Where they grow: a reed bed around every project cube, plus wild meadows wherever a
// large-scale noise pattern says so; the area where you start stays open water.
export function SeaPlants({ spots }) {
  const mesh = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  const blades = useMemo(() => {
    const list = [];
    const add = (x, z, height) => {
      if (Math.hypot(x, z) < 10) return;
      list.push({
        x,
        z,
        height,
        turn: Math.random() * Math.PI,
        lean: (Math.random() - 0.5) * 0.3,
      });
    };
    // reed beds around the works
    spots.forEach((spot) => {
      const count = 26 + Math.floor(Math.random() * 20);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = spot.size * (0.85 + Math.random() * 1.4);
        add(
          spot.x + Math.cos(angle) * r,
          spot.z + Math.sin(angle) * r,
          1.4 + Math.random() * 2.6,
        );
      }
    });
    // wild meadows where the noise is high
    for (let i = 0; i < 9000 && list.length < 3200; i++) {
      const x = (Math.random() - 0.5) * 240;
      const z = (Math.random() - 0.5) * 240;
      const field = noise.noise(x * 0.018 + 40, z * 0.018 - 13);
      if (field < 0.45) continue;
      add(x, z, 1 + (field - 0.45) * 7 + Math.random() * 1.5);
    }
    return list;
  }, [spots]);

  const geometry = useMemo(() => {
    // a thin blade, narrowing to its tip, standing on y = 0
    const blade = new THREE.PlaneGeometry(0.18, 1, 1, 8);
    const position = blade.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i) + 0.5;
      position.setXY(i, position.getX(i) * (1 - y * 0.85), y);
    }
    blade.computeVertexNormals();
    return blade;
  }, []);

  const material = useMemo(() => {
    const plant = new THREE.MeshStandardMaterial({
      roughness: 0.55,
      side: THREE.DoubleSide,
    });
    plant.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
          uniform float uTime;
          ${SNOISE}`,
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          // where this blade stands, and how high up the blade this vertex is
          vec3 root = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          float bend = position.y * position.y;
          vec2 current = vec2(
            snoise(root.xz * 0.06 + vec2(uTime * 0.25, 0.0)),
            snoise(root.xz * 0.06 + vec2(13.0, uTime * 0.2))
          );
          transformed.x += current.x * bend * 0.35;
          transformed.z += current.y * bend * 0.35;`,
        );
    };
    return plant;
  }, [uniforms]);

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();
    const base = new THREE.Color(PALETTE.deep).lerp(
      new THREE.Color("#1d3b2f"),
      0.75,
    );
    const tip = new THREE.Color(PALETTE.shallow);
    const color = new THREE.Color();
    blades.forEach((blade, i) => {
      euler.set(blade.lean, blade.turn, blade.lean * 0.5);
      rotation.setFromEuler(euler);
      scale.set(1, blade.height, 1);
      position.set(blade.x, -0.4, blade.z);
      matrix.compose(position, rotation, scale);
      mesh.current.setMatrixAt(i, matrix);
      mesh.current.setColorAt(
        i,
        color.copy(base).lerp(tip, Math.random() * 0.55),
      );
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true;
  }, [blades]);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    // the whole meadow rides the swell a little
    mesh.current.position.y = wave(0, 0, clock.elapsedTime) * 0.15;
  });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, blades.length]}
      frustumCulled={false}
    />
  );
}

// A work's title drawn onto a canvas, for the breeze
function makeTitleTexture(title) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const font = '300 160px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.font = font;
  const width = Math.min(4096, Math.ceil(ctx.measureText(title).width) + 80);
  canvas.width = width;
  canvas.height = 220;
  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255,255,255,0.6)";
  ctx.shadowBlur = 24;
  ctx.fillText(title, 40, 110);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, aspect: width / canvas.height };
}

const BREEZE_DISTANCE = 105;
const BREEZE_HEIGHT = 16;

// One title blowing across, far out over the water: the cubes and the horizon pass in
// front of it and the mist softens it
function BreezeTitle({ breeze, onDone }) {
  const mesh = useRef();
  const { camera, size } = useThree();
  const { texture, aspect } = useMemo(
    () => makeTitleTexture(breeze.title),
    [breeze.title],
  );
  const born = useRef(null);
  const yaw = useRef(null);
  const done = useRef(false);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    if (born.current === null) {
      born.current = clock.elapsedTime;
      yaw.current = new THREE.Euler().setFromQuaternion(
        camera.quaternion,
        "YXZ",
      ).y;
    }
    const p = (clock.elapsedTime - born.current) / breeze.duration;
    if (p >= 1) {
      if (!done.current) onDone(breeze.id);
      done.current = true;
      return;
    }
    const width = BREEZE_HEIGHT * aspect;
    // how wide the view is out there, so the title enters and leaves just off screen
    const halfView =
      BREEZE_DISTANCE *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
      (size.width / size.height);
    const across = THREE.MathUtils.lerp(
      halfView + width / 2,
      -halfView - width / 2,
      p,
    );
    const forward = new THREE.Vector3(
      -Math.sin(yaw.current),
      0,
      -Math.cos(yaw.current),
    );
    const right = new THREE.Vector3(
      Math.cos(yaw.current),
      0,
      -Math.sin(yaw.current),
    );
    const height =
      2 + (1 - breeze.top / 100) * 26 + Math.sin(p * Math.PI * 2) * 1.5;
    mesh.current.position
      .copy(camera.position)
      .addScaledVector(forward, BREEZE_DISTANCE)
      .addScaledVector(right, across)
      .setY(height);
    mesh.current.rotation.set(0, yaw.current, Math.sin(p * Math.PI * 3) * 0.03);
    mesh.current.scale.set(width, BREEZE_HEIGHT, 1);
    // fade in and out at the ends
    mesh.current.material.opacity = Math.min(1, p * 6, (1 - p) * 6) * 0.9;
  });

  return (
    <mesh ref={mesh} renderOrder={-1}>
      <planeGeometry />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        opacity={0}
        toneMapped={false}
      />
    </mesh>
  );
}

export function Breezes({ breezes, onDone }) {
  return breezes.map((breeze) => (
    <BreezeTitle key={breeze.id} breeze={breeze} onDone={onDone} />
  ));
}
