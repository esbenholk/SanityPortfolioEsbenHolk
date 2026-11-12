import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

import FireMaterial from "./FireMaterial";

const FLAMES = 15;
const FIRE_TEXTURE = process.env.PUBLIC_URL + "/fire/fire.png";

// One flame. It grows when the mouse is near it, and roars up after a click (`stoke`).
function Flame({ x, base, texture, stoke }) {
  const mesh = useRef();
  const material = useMemo(() => {
    const fire = new FireMaterial();
    fire.uniforms.fireTex.value = texture;
    return fire;
  }, [texture]);
  const heat = useRef(0);

  useFrame((state, delta) => {
    const flame = mesh.current;
    if (!flame) return;
    // how close the mouse is (in the strip's own units)
    const mouseX = (state.pointer.x * state.viewport.width) / 2;
    const near = Math.exp(-((mouseX - x) ** 2) / 1.6);
    const roar = Math.max(
      0,
      1 - (state.clock.elapsedTime - stoke.current) / 1.6,
    );
    const target = near * 0.8 + roar * 1.4;
    heat.current += (target - heat.current) * (1 - Math.exp(-6 * delta));

    const height = base * (1 + heat.current * 0.9);
    flame.scale.set(base * 0.8, height, base * 0.8);
    flame.position.set(x, -state.viewport.height / 2 + height / 2 - 0.15, 0);

    flame.updateMatrixWorld();
    material.uniforms.invModelMatrix.value.copy(flame.matrixWorld).invert();
    material.uniforms.scale.value.copy(flame.scale);
    material.uniforms.time.value = state.clock.elapsedTime * (1 + heat.current);
    material.uniforms.magnitude.value = 2.5 + heat.current * 1.5;
  });

  return (
    <mesh ref={mesh} material={material}>
      <boxGeometry />
    </mesh>
  );
}

function Flames({ stoke }) {
  const texture = useLoader(THREE.TextureLoader, FIRE_TEXTURE);
  texture.magFilter = texture.minFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  const { viewport } = useThree();
  // spread across the strip, alternating tall and short
  const flames = Array.from({ length: FLAMES }, (_, i) => ({
    x: ((i + 0.5) / FLAMES - 0.5) * viewport.width,
    base: viewport.height * (i % 2 ? 0.9 : 1.2),
  }));
  return flames.map((flame, i) => (
    <Flame
      key={i}
      x={flame.x}
      base={flame.base}
      texture={texture}
      stoke={stoke}
    />
  ));
}

// The tube skin's fire: a strip of flames that flare up where the mouse is. Click to stoke it.
export default function FireStrip() {
  const stoke = useRef(-10);
  return (
    <div className="fire-strip" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 40 }}>
        <Suspense fallback={null}>
          <StokeClock stoke={stoke} />
          <Flames stoke={stoke} />
        </Suspense>
      </Canvas>
      {/* <p className="fire-strip__text">🔥 {slogan} 🔥</p> */}
    </div>
  );
}

// turns a click into "now" on the canvas clock, so the flames know when they were stoked
function StokeClock({ stoke }) {
  const { gl, clock } = useThree();
  useEffect(() => {
    const onDown = () => {
      stoke.current = clock.elapsedTime;
    };
    gl.domElement.addEventListener("pointerdown", onDown);
    return () => gl.domElement.removeEventListener("pointerdown", onDown);
  }, [gl, clock, stoke]);
  return null;
}
