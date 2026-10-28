import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { CELL, columnKey } from "./level";

const EYE_HEIGHT = 1.7;
const RADIUS = 0.35;
const WALK = 6;
const RUN = 10.5;
const JUMP = 7.5;
const GRAVITY = -22;
const FIRE_INTERVAL = 0.13; // seconds between shots while holding the trigger
const RANGE = 90;

const CENTER = new THREE.Vector2(0, 0);
const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const wish = new THREE.Vector3();
const muzzle = new THREE.Vector3();

// First-person player: mouse-look, WASD, jump, hold to fire. On touch screens: drag to look, tap to shoot.
// In "inspect" mode a click scans the block under the crosshair instead of destroying it.
export default function Player({
  spawn,
  bounds,
  solidRef,
  blocksRef,
  mode,
  onShoot,
  onInspect,
  onLockChange,
  isTouch,
}) {
  const { camera, gl, raycaster } = useThree();
  // latest mode and callbacks, for event listeners that were attached once
  const latest = useRef({});
  latest.current = { mode, onShoot, onInspect };
  const controls = useRef();
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());
  const grounded = useRef(true);
  const firing = useRef(false);
  const cooldown = useRef(0);
  const gun = useRef();
  const recoil = useRef(0);
  const flash = useRef();
  const muzzleLight = useRef();
  const tracer = useRef();
  const tracerLife = useRef(0);
  // Chrome can report one huge mouse jump right after the pointer locks; hold the view still briefly
  const lockGuard = useRef({ until: 0, frames: 0, view: new THREE.Quaternion() });

  useEffect(() => {
    camera.position.set(spawn.x, EYE_HEIGHT, spawn.z);
    camera.rotation.set(0, 0, 0, "YXZ");
  }, [camera, spawn]);

  // keyboard
  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      if (e.code === "Space") e.preventDefault();
    };
    const up = (e) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // A column is solid while it still has blocks; the arena edge is always solid
  const blocked = (x, z) => {
    if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) return true;
    const corners = [
      [x - RADIUS, z - RADIUS],
      [x + RADIUS, z - RADIUS],
      [x - RADIUS, z + RADIUS],
      [x + RADIUS, z + RADIUS],
    ];
    return corners.some(([cx, cz]) =>
      solidRef.current.has(columnKey(Math.round(cx / CELL), Math.round(cz / CELL)))
    );
  };

  // Fire a ray from the screen centre (or the tapped point) and report what it hit
  const shoot = (pointer = CENTER) => {
    raycaster.setFromCamera(pointer, camera);
    const ray = raycaster.ray;
    const hits = blocksRef.current
      ? raycaster.intersectObjects(blocksRef.current.children, false)
      : [];
    const hit = hits.find((h) => h.distance < RANGE);
    const inspecting = latest.current.mode === "inspect";
    let point;
    if (hit && inspecting) {
      point = hit.point.clone();
      latest.current.onInspect({ blockId: hit.object.userData.blockId });
    } else if (hit) {
      point = hit.point.clone();
      latest.current.onShoot({
        blockId: hit.object.userData.blockId,
        center: hit.object.position.clone(),
        point,
        direction: ray.direction.clone(),
      });
    } else {
      point = new THREE.Vector3();
      if (!ray.intersectPlane(FLOOR, point) || point.distanceTo(ray.origin) > RANGE) {
        point = ray.origin.clone().addScaledVector(ray.direction, RANGE);
      }
      if (!inspecting) latest.current.onShoot({ blockId: null, point, direction: ray.direction.clone() });
    }

    // gun feedback: recoil, muzzle flash and a green tracer; inspecting fires a soft cyan scan beam instead
    recoil.current = inspecting ? 0.3 : 1;
    tracerLife.current = inspecting ? 0.25 : 0.09;
    if (gun.current && tracer.current) {
      tracer.current.material.color.set(inspecting ? "#00e5ff" : "#39ff14");
      gun.current.localToWorld(muzzle.set(0, 0.02, -0.62));
      const length = muzzle.distanceTo(point);
      tracer.current.position.copy(muzzle).lerp(point, 0.5);
      tracer.current.scale.set(1, 1, length);
      tracer.current.lookAt(point);
    }
  };

  // mouse: hold to fire while the pointer is locked
  useEffect(() => {
    if (isTouch) return;
    const down = (e) => {
      if (e.button === 0 && controls.current && controls.current.isLocked) {
        if (latest.current.mode === "inspect") {
          shoot(); // one scan per click, no auto-fire
        } else {
          firing.current = true;
          cooldown.current = 0;
        }
      }
    };
    const up = () => {
      firing.current = false;
    };
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
    // `shoot` only reads refs, so the listener attached once stays correct
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouch]);

  // touch: drag to look around, tap to shoot at the tapped point
  useEffect(() => {
    if (!isTouch) return;
    const element = gl.domElement;
    const euler = new THREE.Euler(0, 0, 0, "YXZ");
    let start = null;
    let last = null;
    const down = (e) => {
      start = last = { x: e.clientX, y: e.clientY };
    };
    const move = (e) => {
      if (!last) return;
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= (e.clientX - last.x) * 0.005;
      euler.x = Math.max(-1.4, Math.min(1.4, euler.x - (e.clientY - last.y) * 0.005));
      camera.quaternion.setFromEuler(euler);
      last = { x: e.clientX, y: e.clientY };
    };
    const up = (e) => {
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 8) {
        const rect = element.getBoundingClientRect();
        shoot(
          new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
          )
        );
      }
      start = last = null;
    };
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouch, gl, camera]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    const k = keys.current;
    const guard = lockGuard.current;
    if (guard.frames > 0 || performance.now() < guard.until) {
      camera.quaternion.copy(guard.view);
      guard.frames = Math.max(0, guard.frames - 1);
    }

    // movement relative to where the camera looks, on the ground plane
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, camera.up).normalize();
    wish.set(0, 0, 0);
    if (k.KeyW || k.ArrowUp) wish.add(forward);
    if (k.KeyS || k.ArrowDown) wish.sub(forward);
    if (k.KeyD || k.ArrowRight) wish.add(right);
    if (k.KeyA || k.ArrowLeft) wish.sub(right);
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(k.ShiftLeft || k.ShiftRight ? RUN : WALK);

    const v = velocity.current;
    const smoothing = 1 - Math.exp(-12 * delta);
    v.x += (wish.x - v.x) * smoothing;
    v.z += (wish.z - v.z) * smoothing;

    if (k.Space && grounded.current) {
      v.y = JUMP;
      grounded.current = false;
    }
    v.y += GRAVITY * delta;

    // move one axis at a time so you slide along walls
    const nextX = camera.position.x + v.x * delta;
    if (!blocked(nextX, camera.position.z)) camera.position.x = nextX;
    else v.x = 0;
    const nextZ = camera.position.z + v.z * delta;
    if (!blocked(camera.position.x, nextZ)) camera.position.z = nextZ;
    else v.z = 0;
    camera.position.y += v.y * delta;
    if (camera.position.y <= EYE_HEIGHT) {
      camera.position.y = EYE_HEIGHT;
      v.y = 0;
      grounded.current = true;
    }

    // automatic fire while holding the button
    cooldown.current -= delta;
    if (firing.current && latest.current.mode === "shoot" && cooldown.current <= 0) {
      shoot();
      cooldown.current = FIRE_INTERVAL;
    }

    // the gun hangs in front of the camera, kicks back when firing and bobs while walking
    recoil.current = Math.max(0, recoil.current - delta * 9);
    const bob = Math.sin(performance.now() / 110) * 0.012 * Math.min(1, Math.hypot(v.x, v.z) / WALK);
    if (gun.current) {
      gun.current.position.copy(camera.position);
      gun.current.quaternion.copy(camera.quaternion);
      gun.current.translateX(0.28);
      gun.current.translateY(-0.24 + bob);
      gun.current.translateZ(-0.5 + recoil.current * 0.09);
      gun.current.rotateX(recoil.current * 0.12);
    }
    const flashOn = recoil.current > 0.6;
    if (flash.current) flash.current.visible = flashOn;
    if (muzzleLight.current) muzzleLight.current.intensity = flashOn ? 8 : 0;

    tracerLife.current = Math.max(0, tracerLife.current - delta);
    if (tracer.current) {
      tracer.current.visible = tracerLife.current > 0;
      tracer.current.material.opacity = Math.min(1, tracerLife.current / 0.09);
    }
  });

  return (
    <>
      {!isTouch && (
        <PointerLockControls
          ref={controls}
          selector="#shooter-start"
          onLock={() => {
            lockGuard.current.until = performance.now() + 150;
            lockGuard.current.frames = 3;
            lockGuard.current.view.copy(camera.quaternion);
            onLockChange(true);
          }}
          onUnlock={() => {
            firing.current = false;
            onLockChange(false);
          }}
        />
      )}

      <group ref={gun}>
        <mesh position={[0, 0, -0.15]}>
          <boxGeometry args={[0.1, 0.13, 0.5]} />
          <meshStandardMaterial color="#121212" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.02, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.035, 0.36, 12]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.25} />
        </mesh>
        {/* neon trim */}
        <mesh position={[0, 0.072, -0.15]}>
          <boxGeometry args={[0.104, 0.012, 0.46]} />
          <meshBasicMaterial color="#39ff14" toneMapped={false} />
        </mesh>
        <mesh position={[0.052, -0.01, -0.15]}>
          <boxGeometry args={[0.006, 0.05, 0.4]} />
          <meshBasicMaterial color="#ff2bd6" toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.12, -0.02]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.08, 0.18, 0.09]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh ref={flash} position={[0, 0.02, -0.66]} visible={false}>
          <icosahedronGeometry args={[0.07, 0]} />
          <meshBasicMaterial color="#e9ffcf" toneMapped={false} />
        </mesh>
        <pointLight ref={muzzleLight} position={[0, 0.02, -0.7]} color="#b6ff8a" intensity={0} distance={8} />
      </group>

      <mesh ref={tracer} visible={false}>
        <boxGeometry args={[0.025, 0.025, 1]} />
        <meshBasicMaterial color="#39ff14" transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </>
  );
}
