import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Water as ThreeWater } from "three-stdlib";
import * as THREE from "three";

import { PALETTE } from "./waves";

export const SUN_DIRECTION = new THREE.Vector3(-0.5, 0.18, -1).normalize();
// A mirror-like sea: three.js's Water effect reflects the sky, the sun and the floating cubes,
// rippled by a scrolling "water normals" texture (from the three.js examples), tinted to the dawn palette
// and faded into the horizon by the scene's fog.
export function Water() {
  const normals = useTexture(process.env.PUBLIC_URL + "/ocean/waternormals.jpg");
  const water = useMemo(() => {
    normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
    const mirror = new ThreeWater(new THREE.PlaneGeometry(600, 600), {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: normals,
      sunDirection: SUN_DIRECTION.clone(),
      sunColor: PALETTE.sun,
      waterColor: PALETTE.deep,
      distortionScale: 1.6,
      fog: true,
    });
    mirror.material.uniforms.size.value = 1.4; // bigger, calmer ripples
    mirror.rotation.x = -Math.PI / 2;
    return mirror;
  }, [normals]);

  useEffect(
    () => () => {
      water.geometry.dispose();
      water.material.dispose();
    },
    [water]
  );

  useFrame((_, delta) => {
    water.material.uniforms.time.value += delta * 0.35;
  });

  return <primitive object={water} />;
}

// A sphere around the camera, painted from the horizon colour up to the sky blue, with a soft sun
export function Sky() {
  const mesh = useRef();
  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color(PALETTE.zenith) },
      uHorizon: { value: new THREE.Color(PALETTE.horizon) },
      uSun: { value: new THREE.Color(PALETTE.sun) },
      uSunDir: { value: SUN_DIRECTION },
    }),
    []
  );

  useFrame(({ camera }) => {
    if (mesh.current) mesh.current.position.copy(camera.position);
  });

  return (
    <mesh ref={mesh} frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[600, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={
          /* glsl */ `
          varying vec3 vDirection;
          void main() {
            vDirection = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`
        }
        fragmentShader={
          /* glsl */ `
          uniform vec3 uZenith, uHorizon, uSun, uSunDir;
          varying vec3 vDirection;
          void main() {
            vec3 direction = normalize(vDirection);
            vec3 colour = mix(uHorizon, uZenith, smoothstep(0.0, 0.45, direction.y));
            float sun = max(dot(direction, uSunDir), 0.0);
            colour += uSun * (pow(sun, 600.0) * 1.5 + pow(sun, 12.0) * 0.25);
            gl_FragColor = vec4(colour, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`
        }
      />
    </mesh>
  );
}
