import { useRef, useEffect, useMemo, useLayoutEffect, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { AsciiEffect } from "three-stdlib";
import { MeshStandardMaterial, DoubleSide } from "three";

function Model({ url }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  const customMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "black",
        metalness: 0.5,
        roughness: 0.3,
        side: DoubleSide,
      }),
    []
  );

  //   useFrame((state, delta) => {
  //     ref.current.rotation.x = ref.current.rotation.y += delta / 5;
  //     ref.current.rotation.y = ref.current.rotation.x += delta / 5;
  //   });

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = customMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene, customMaterial]);

  return <primitive ref={ref} object={scene} scale={[2, 2, 2]} />;
}

function CameraController() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function AsciiRenderer({
  renderIndex = 1,
  characters = " .:-+*=%@#",
  bgColor = "black",
  fgColor = "white",
  invert = false,
  color = false,
  resolution = 0.175,
}) {
  // Reactive state
  const { size, gl, scene, camera } = useThree();

  // Create effect
  const effect = useMemo(() => {
    const effect = new AsciiEffect(gl, characters, {
      invert,
      color,
      resolution,
    });
    effect.domElement.style.position = "absolute";
    effect.domElement.style.top = "0px";
    effect.domElement.style.left = "0px";
    effect.domElement.style.pointerEvents = "none";
    return effect;
  }, [characters, invert, color, resolution, gl]);

  // Styling
  useLayoutEffect(() => {
    effect.domElement.style.color = fgColor;
    effect.domElement.style.backgroundColor = bgColor;
  }, [fgColor, bgColor, effect.domElement.style]);

  // Append on mount, remove on unmount
  useEffect(() => {
    gl.domElement.style.opacity = "0";
    gl.domElement.parentNode.appendChild(effect.domElement);
    return () => {
      gl.domElement.style.opacity = "1";
      gl.domElement.parentNode.removeChild(effect.domElement);
    };
  }, [effect, gl.domElement.parentNode, gl.domElement.style]);

  // Set size
  useEffect(() => {
    effect.setSize(size.width, size.height);
  }, [effect, size]);

  // Take over render-loop (that is what the index is for)
  useFrame((state) => {
    effect.render(scene, camera);
  }, renderIndex);

  // This component returns nothing, it is a purely logical
  return null;
}
export default function AsciiScene({ modelUrl }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Suspense fallback={null}>
          <color attach="background" args={["grey"]} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.45}
            penumbra={1}
            intensity={1}
          />
          <pointLight position={[-10, -10, -10]} />
          <ambientLight intensity={0.4} />
          <Model url={modelUrl} />
        </Suspense>
        <CameraController />
        <AsciiRenderer fgColor="white" bgColor="lightgrey" />
      </Canvas>
    </div>
  );
}
