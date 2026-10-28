import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BLOCK_HEIGHT, CELL } from "./level";

const SPLIT = 3; // a block breaks into SPLIT³ fragments
const FRAGMENT = CELL / SPLIT; // fragment width/depth
const FRAGMENT_HEIGHT = BLOCK_HEIGHT / SPLIT;
const FRAGMENT_COUNT = SPLIT * SPLIT * SPLIT;
const SPARK_COUNT = 140;
const GRAVITY = -22;
const LIFETIME = 4.5;
const SPARK_COLORS = ["#39ff14", "#ff2bd6", "#00e5ff", "#ffe600"].map((c) => new THREE.Color(c));

const fragmentGeometry = new THREE.BoxGeometry(FRAGMENT * 0.94, FRAGMENT_HEIGHT * 0.94, FRAGMENT * 0.94);

// Soft round dot so sparks glow instead of rendering as squares
const sparkTexture = (() => {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.8)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
})();
const dummy = new THREE.Object3D();

// A shot block: its pieces fly apart and bounce on the floor, sparks burst and fade
export default function Explosion({ boom, material, onDone }) {
  const fragmentsRef = useRef();
  const sparksRef = useRef();
  const age = useRef(0);

  // Per-fragment physics state
  const fragments = useMemo(() => {
    const list = [];
    for (let i = 0; i < SPLIT; i++)
      for (let j = 0; j < SPLIT; j++)
        for (let k = 0; k < SPLIT; k++) {
          const offset = new THREE.Vector3(
            (i - 1) * FRAGMENT,
            (j - 1) * FRAGMENT_HEIGHT,
            (k - 1) * FRAGMENT
          );
          const velocity = offset
            .clone()
            .normalize()
            .multiplyScalar(3 + Math.random() * 5)
            .add(boom.direction.clone().multiplyScalar(6 + Math.random() * 4))
            .add(new THREE.Vector3(0, 3 + Math.random() * 4, 0));
          list.push({
            position: boom.position.clone().add(offset),
            velocity,
            rotation: new THREE.Euler(),
            spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(12),
          });
        }
    return list;
  }, [boom]);

  // Spark positions, velocities and colours
  const sparks = useMemo(() => {
    const positions = new Float32Array(SPARK_COUNT * 3);
    const colors = new Float32Array(SPARK_COUNT * 3);
    const velocities = [];
    for (let i = 0; i < SPARK_COUNT; i++) {
      positions.set([boom.point.x, boom.point.y, boom.point.z], i * 3);
      const color = SPARK_COLORS[i % SPARK_COLORS.length];
      colors.set([color.r, color.g, color.b], i * 3);
      velocities.push(
        new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.2, Math.random() - 0.5)
          .normalize()
          .multiplyScalar(4 + Math.random() * 10)
          .addScaledVector(boom.direction, -3)
      );
    }
    return { positions, colors, velocities };
  }, [boom]);

  useLayoutEffect(() => {
    fragments.forEach((fragment, i) => {
      dummy.position.copy(fragment.position);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      fragmentsRef.current.setMatrixAt(i, dummy.matrix);
    });
    fragmentsRef.current.instanceMatrix.needsUpdate = true;
  }, [fragments]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    age.current += delta;
    const t = age.current;

    // fragments: gravity, floor bounce with friction, shrink away at the end
    const shrink = t > LIFETIME - 1 ? Math.max(0, LIFETIME - t) : 1;
    fragments.forEach((fragment, i) => {
      fragment.velocity.y += GRAVITY * delta;
      fragment.position.addScaledVector(fragment.velocity, delta);
      const floor = FRAGMENT_HEIGHT / 2;
      if (fragment.position.y < floor) {
        fragment.position.y = floor;
        fragment.velocity.y *= -0.35;
        fragment.velocity.x *= 0.7;
        fragment.velocity.z *= 0.7;
        fragment.spin.multiplyScalar(0.7);
      }
      fragment.rotation.x += fragment.spin.x * delta;
      fragment.rotation.y += fragment.spin.y * delta;
      fragment.rotation.z += fragment.spin.z * delta;
      dummy.position.copy(fragment.position);
      dummy.rotation.copy(fragment.rotation);
      dummy.scale.setScalar(shrink);
      dummy.updateMatrix();
      fragmentsRef.current.setMatrixAt(i, dummy.matrix);
    });
    fragmentsRef.current.instanceMatrix.needsUpdate = true;

    // sparks: fast, light gravity, drag, fade out
    const positions = sparksRef.current.geometry.attributes.position;
    sparks.velocities.forEach((velocity, i) => {
      velocity.y += GRAVITY * 0.35 * delta;
      velocity.multiplyScalar(1 - 1.5 * delta);
      positions.array[i * 3] += velocity.x * delta;
      positions.array[i * 3 + 1] = Math.max(0.02, positions.array[i * 3 + 1] + velocity.y * delta);
      positions.array[i * 3 + 2] += velocity.z * delta;
    });
    positions.needsUpdate = true;
    sparksRef.current.material.opacity = Math.max(0, 1 - t / 1.4);

    if (t > LIFETIME) onDone(boom.id);
  });

  return (
    <group>
      <instancedMesh
        ref={fragmentsRef}
        args={[fragmentGeometry, material, FRAGMENT_COUNT]}
        frustumCulled={false}
      />
      <points ref={sparksRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparks.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[sparks.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={sparkTexture}
          size={0.32}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
