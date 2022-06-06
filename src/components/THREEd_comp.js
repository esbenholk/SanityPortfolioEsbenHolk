import * as THREE from "three";
import React from 'react';
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { Physics, useSphere } from "@react-three/cannon";
import { Sky, Environment, Effects as EffectComposer, useTexture } from "@react-three/drei";
import { SSAOPass } from "three-stdlib";

extend({ SSAOPass })

const rfs = THREE.MathUtils.randFloatSpread
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const baubleMaterial = new THREE.MeshStandardMaterial({ color: "white", roughness: 0, envMapIntensity: 1, emissive: "#370037" })

export const THREEd_comp = () => (
  <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }} style={{position: "fixed", top: 0, right: 0, width: "100%", bottom: 0, left: 0}}>
    <ambientLight intensity={0.25} color="green" />
    <spotLight color="green" intensity={1} angle={0.2} penumbra={1} position={[30, 30, 30]} castShadow shadow-mapSize={[512, 512]} />
    <directionalLight intensity={5} position={[-10, -10, -10]} color="green" />
    <Physics gravity={[0, 2, 0]} iterations={10}>
      <Pointer />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
      <Clump />
    </Physics>
    {/* <Environment files="/adamsbridge.hdr" /> */}
    <Effects />
  </Canvas>
)

function Clump({ mat = new THREE.Matrix4(), vec = new THREE.Vector3(), ...props }) {
  const texture = useTexture("https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1631264421/aawkwaa/aawkwaa_cover_y6bptr.png")
  const [ref, api] = useSphere(() => ({ args: [1], mass: 1, angularDamping: 0.1, linearDamping: 0.65, position: [rfs(20), rfs(20), rfs(20)] }))
  useFrame((state) => {
    for (let i = 0; i < 1; i++) {
      // Get current whereabouts of the instanced sphere
      ref.current.getMatrixAt(i, mat)
      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api.at(i).applyForce(vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-50).toArray(), [0, 0, 0])
    }
  })
  return <instancedMesh ref={ref} castShadow receiveShadow args={[null, null, 1]} geometry={sphereGeometry} material={baubleMaterial} material-map={texture} />
}

function Pointer() {
  const viewport = useThree((state) => state.viewport)
  const [, api] = useSphere(() => ({ type: "Kinematic", args: [3], position: [0, 0, 0] }))
  return useFrame((state) => api.position.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0))
}

function Effects(props) {
  const { scene, camera } = useThree()
  return <EffectComposer {...props}>{/* <sSAOPass args={[scene, camera, 100, 100]} kernelRadius={1.2} kernelSize={0} /> */}</EffectComposer>
}
