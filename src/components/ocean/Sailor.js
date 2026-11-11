import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SimplexNoise } from "three-stdlib";

import { slope, wave } from "./waves";

const EYE_HEIGHT = 2.2;
const ACCELERATION = 9;
const TURN_SPEED = 1.1;
const DRAG = 1.6; // how quickly the boat slows down by itself
const MAX_SPEED = 9;
const BOUNDS = 110;

// After pmndrs' camera-shake example: the view drifts towards the mouse (a little parallax)
// and sways like a hand-held camera, driven by smooth noise like drei's <CameraShake>.
const LOOK_YAW = 0.16; // how far the view follows the mouse sideways (radians)
const LOOK_PITCH = 0.07;
const SWAY = 0.7; // sideways drift of the camera with the mouse (world units)
const SMOOTHING = 3.5; // higher = the camera catches up faster
const SHAKE = {
  yaw: 0.012,
  pitch: 0.012,
  roll: 0.01,
  yawFrequency: 0.5,
  pitchFrequency: 0.5,
  rollFrequency: 0.4,
};
const noise = new SimplexNoise();

// The visitor's boat: drag to look around, W/S (or ↑/↓) to sail, A/D (or ←/→) to turn,
// the scroll wheel paddles forward and back. The camera rises and rolls with the waves.
// `dragged` tells the cubes whether a click was really a drag; `obstacles` are cubes to sail around.
export default function Sailor({
  paused,
  dragged,
  obstacles,
  onMove,
  start = [0, 0, 34],
}) {
  const { camera, gl } = useThree();
  const state = useRef({
    yaw: 0,
    pitch: -0.04,
    view: null, // the smoothed camera: { yaw, pitch, sway }
    speed: 0,
    position: new THREE.Vector2(start[0], start[2]),
    keys: new Set(),
    pointer: null,
  });
  const latest = useRef({ paused, onMove });
  latest.current = { paused, onMove };

  useEffect(() => {
    const s = state.current;
    const element = gl.domElement;
    const moved = () => latest.current.onMove && latest.current.onMove();

    const onKeyDown = (e) => {
      if (latest.current.paused || e.metaKey || e.ctrlKey) return;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.code,
        )
      )
        e.preventDefault();
      s.keys.add(e.code);
      moved();
    };
    const onKeyUp = (e) => s.keys.delete(e.code);
    const onBlur = () => s.keys.clear();

    const onPointerDown = (e) => {
      s.pointer = { x: e.clientX, y: e.clientY };
      dragged.current = 0;
    };
    const onPointerMove = (e) => {
      if (!s.pointer || latest.current.paused) return;
      const dx = e.clientX - s.pointer.x;
      const dy = e.clientY - s.pointer.y;
      s.pointer = { x: e.clientX, y: e.clientY };
      dragged.current += Math.abs(dx) + Math.abs(dy);
      s.yaw -= dx * 0.0035;
      s.pitch = THREE.MathUtils.clamp(s.pitch - dy * 0.0025, -0.55, 0.4);
      moved();
    };
    const onPointerUp = () => (s.pointer = null);
    const onWheel = (e) => {
      if (latest.current.paused) return;
      e.preventDefault();
      s.speed = THREE.MathUtils.clamp(
        s.speed - e.deltaY * 0.012,
        -MAX_SPEED / 2,
        MAX_SPEED,
      );
      moved();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    element.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      element.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("wheel", onWheel);
    };
  }, [gl, dragged]);

  useFrame(({ clock, pointer }, rawDelta) => {
    const s = state.current;
    const delta = Math.min(rawDelta, 0.05);
    const keys = latest.current.paused ? new Set() : s.keys;
    const has = (...codes) => codes.some((code) => keys.has(code));

    if (has("KeyA", "ArrowLeft")) s.yaw += TURN_SPEED * delta;
    if (has("KeyD", "ArrowRight")) s.yaw -= TURN_SPEED * delta;
    if (has("KeyW", "ArrowUp")) s.speed += ACCELERATION * delta;
    if (has("KeyS", "ArrowDown")) s.speed -= ACCELERATION * delta;
    s.speed = THREE.MathUtils.clamp(s.speed, -MAX_SPEED / 2, MAX_SPEED);
    s.speed *= Math.exp(-DRAG * delta);

    // forward is where the camera looks, flattened onto the water
    s.position.x -= Math.sin(s.yaw) * s.speed * delta;
    s.position.y -= Math.cos(s.yaw) * s.speed * delta;

    // glide around the cubes instead of through them
    (obstacles || []).forEach((cube) => {
      const dx = s.position.x - cube.x;
      const dz = s.position.y - cube.z;
      const distance = Math.hypot(dx, dz);
      const min = cube.size * 1.1;
      if (distance < min && distance > 0.0001) {
        s.position.x = cube.x + (dx / distance) * min;
        s.position.y = cube.z + (dz / distance) * min;
        s.speed *= 0.9;
      }
    });
    if (s.position.length() > BOUNDS) s.position.setLength(BOUNDS);

    const t = clock.elapsedTime;
    const lean = slope(s.position.x, s.position.y, t);

    // where the camera wants to look: the boat's heading, nudged towards the mouse
    const follow = latest.current.paused ? 0 : 1;
    const target = {
      yaw: s.yaw - pointer.x * LOOK_YAW * follow,
      pitch: s.pitch + pointer.y * LOOK_PITCH * follow,
      sway: pointer.x * SWAY * follow,
    };
    if (!s.view) s.view = { ...target };
    const ease = 1 - Math.exp(-SMOOTHING * delta);
    s.view.yaw += (target.yaw - s.view.yaw) * ease;
    s.view.pitch += (target.pitch - s.view.pitch) * ease;
    s.view.sway += (target.sway - s.view.sway) * ease;

    // the camera drifts sideways with the mouse, rides the swell and sways
    const sideX = Math.cos(s.view.yaw);
    const sideZ = -Math.sin(s.view.yaw);
    camera.position.set(
      s.position.x + sideX * s.view.sway,
      EYE_HEIGHT + wave(s.position.x, s.position.y, t) * 0.3,
      s.position.y + sideZ * s.view.sway,
    );
    camera.rotation.set(
      s.view.pitch +
        lean.z * 0.03 +
        SHAKE.pitch * noise.noise(t * SHAKE.pitchFrequency, 1),
      s.view.yaw + SHAKE.yaw * noise.noise(t * SHAKE.yawFrequency, 2),
      -lean.x * 0.035 + SHAKE.roll * noise.noise(t * SHAKE.rollFrequency, 3),
      "YXZ",
    );
  });

  return null;
}
