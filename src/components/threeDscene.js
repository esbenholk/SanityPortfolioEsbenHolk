import * as THREE from "three";
import React, { useRef, useMemo, useState, useEffect } from "react";
import { TextureLoader } from "three";
import niceColors from "nice-color-palettes";
import Effects from "./functions/effects_3d";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();
const data = Array.from({ length: 1000 }, () => ({
  color: niceColors[17][Math.floor(Math.random() * 5)],
  scale: 1,
}));

function Boxes(imageUrl) {
  const [hovered, set] = useState();
  const material = useRef();
  const colorArray = useMemo(
    () =>
      Float32Array.from(
        new Array(1000)
          .fill()
          .flatMap((_, i) => tempColor.set(data[i].color).toArray())
      ),
    []
  );
  const meshRef = useRef();
  const prevRef = useRef();

  useEffect(() => void (prevRef.current = hovered), [hovered]);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time / 4);
    meshRef.current.rotation.y = Math.sin(time / 2);
    let i = 0;
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++)
        for (let z = 0; z < 10; z++) {
          const id = i++;
          tempObject.position.set(5 - x, 5 - y, 5 - z);
          tempObject.rotation.y =
            Math.sin(x / 4 + time) +
            Math.sin(y / 4 + time) +
            Math.sin(z / 4 + time);
          tempObject.rotation.z = tempObject.rotation.y * 2;
          if (hovered !== prevRef.Current) {
            tempColor
              .set(id === hovered ? "white" : data[id].color)
              .toArray(colorArray, id * 3);
            // meshRef.current.geometry.attributes.color.needsUpdate = true;
          }
          const scale = (data[id].scale = THREE.MathUtils.lerp(
            data[id].scale,
            id === hovered ? 3 : 1,
            0.1
          ));
          tempObject.scale.setScalar(scale);
          tempObject.updateMatrix();
          meshRef.current.setMatrixAt(id, tempObject.matrix);
        }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[null, null, 500]}
        onPointerMove={(e) => set(e.instanceId)}
        onPointerOut={(e) => set(undefined)}
      >
        <boxGeometry args={[0.7, 0.7, 0.7]}></boxGeometry>
        <ImageTextureMaterial
          imageUrl={imageUrl.imageUrl}
          material={material}
        />{" "}
      </instancedMesh>
    </>
  );
}

const ImageTextureMaterial = (imageUrl, material) => {
  const texture = useLoader(TextureLoader, imageUrl.imageUrl);
  return (
    <meshStandardMaterial
      attach="material"
      roughness={1}
      color="white"
      map={texture}
      material={material}
    />
  );
};

export default function ThreeDScene(projects) {
  var imageUrls = [];
  for (let index = 0; index < projects.projects.length; index++) {
    const element = projects.projects[index];
    imageUrls.push(element.mainImage.asset.url);
  }
  return (
    <Canvas
      id="canvas"
      concurrent
      colorManagement
      shadowMap={true}
      RGB
      alpha={true}
      antialias={true}
      style={{
        zIndex: "0",
        width: "100%",
        position: "fixed",
        top: "0",
        left: "0",
      }}
      linear
      camera={{ position: [0, 0, 2], near: 0.1, far: 110 }}
    >
      <ambientLight />
      <pointLight position={[150, 150, 150]} intensity={0.55} />

      {imageUrls &&
        imageUrls.map((imageUrl, index) => (
          <group position={[0, 0, index]} key={index}>
            <Boxes imageUrl={imageUrl} />
          </group>
        ))}

      <Effects />
      <OrbitControls
        autoRotate
        autoRotateSpeed={(-60 * 0.15) / 5}
        maxZoom={100}
        minZoom={0}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </Canvas>
  );
}
