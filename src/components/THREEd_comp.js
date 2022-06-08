import * as THREE from "three";
import { TextureLoader } from "three";
import React, {Suspense} from 'react';
import { Canvas, extend, useFrame, useThree,  useLoader } from "@react-three/fiber";
import { Physics, useSphere } from "@react-three/cannon";
import {Environment, useTexture,  MeshDistortMaterial, useProgress, Html} from "@react-three/drei";

// import Image from "./blocks/image";

import Effects from "./effects";

import { a } from "@react-spring/three";

import sanityClient from "../client";

import imageUrlBuilder from "@sanity/image-url";


const builder = imageUrlBuilder(sanityClient);

function urlFor(source) {
  return builder.image(source);
}


const rfs = THREE.MathUtils.randFloatSpread
const sphereGeometry = new THREE.SphereGeometry(1.5, 50, 50)
const baubleMaterial = new THREE.MeshStandardMaterial({ color: "white", roughness: 0, envMapIntensity: 0.2, emissive: "white" })

function Loader(props) {

  console.log(props.mainImage, urlFor(props.mainImage.asset.url).url());
  // const { active, progress, errors, item, loaded, total } = useProgress()
  return <Html center><div className="loading_img">
           <img
                src={ urlFor(props.mainImage.asset.url).url()}
              />
    
    
    </div></Html>
}

export function ThreeDComp(props){

  const projects = props.projectList;


  return (
    <>
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }} style={{position: "fixed", top: 0, right: 0, width: "100%", bottom: 0, left: 0}}>
      
      <ambientLight intensity={0.25} color="#39FF14" />
      
      <spotLight color="#39FF14" intensity={1} angle={0.2} penumbra={1} position={[30, 30, 30]} castShadow shadow-mapSize={[512, 512]} />
      <directionalLight intensity={5} position={[-10, -10, -10]} color="#39FF14" />

  

          <Physics gravity={[0, 2, 0]} iterations={10}>

              {/* {projects &&
                  projects.map((project, index) => (
               
                    <Clump url={urlFor(project.mainImage.asset.url).url()} project={project} id={index}/>
           
              ))}     */}

              <Suspense fallback={<Loader mainImage={props.mainImage}/>}>
                    <Clump url={urlFor(projects[1].mainImage.asset.url).url()} />
              </Suspense>


              <Pointer />
            

          </Physics>

          <Effects/>

      <Environment files="/environment.hdr" />

    </Canvas>

    


  </>

)
  
}


const ImageTextureMaterial = (imageUrl, material) => {
  const AnimatedMaterial = a(MeshDistortMaterial);

  const texture = useLoader(TextureLoader, imageUrl.imageUrl);
  return (
    < MeshDistortMaterial
      attach="material"
      roughness={0}
      color="white"
      map={texture}
      material={material}
      envMapIntensity={1} 
      emissive={"#370037"}
    />
  );
};



function Clump({ mat = new THREE.Matrix4(), vec = new THREE.Vector3(), ...props }) {

  const texture = useTexture(props.url);

  console.log(texture);
  const [ref, api] = useSphere(() => ({ args: [1], mass: 1, angularDamping: 0.1, linearDamping: 0.65, position: [rfs(20), rfs(20), rfs(20)] }))
  useFrame((state) => {
    for (let i = 0; i < 40; i++) {
      // Get current whereabouts of the instanced sphere
      ref.current.getMatrixAt(i, mat)
      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api.at(i).applyForce(vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-50).toArray(), [0, 0, 0])
    }
  })
  // return <instancedMesh ref={ref} castShadow receiveShadow args={[null, null, 1]}>

  //       <sphereGeometry args={[1, 32, 32]}/>
  //       <ImageTextureMaterial
  //         imageUrl={props.url}
        
  //       />


  // </instancedMesh>
  return <instancedMesh ref={ref} castShadow receiveShadow args={[null, null, 40]} geometry={sphereGeometry} material={baubleMaterial} material-map={texture} >
     <ImageTextureMaterial
          imageUrl={"https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1624263715/textures/Artboard_5explosion_rpkdlq.png"}
        
        />
    </instancedMesh>

}

function Pointer() {
  const viewport = useThree((state) => state.viewport)
  const [, api] = useSphere(() => ({ type: "Kinematic", args: [3], position: [0, 0, 0] }))
  return useFrame((state) => api.position.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0))
}
