import React, {  useRef, Suspense} from "react";
import { EffectComposer, Bloom} from '@react-three/postprocessing'
import { Canvas, useFrame } from "@react-three/fiber";
import {Html} from "@react-three/drei";
import { EmptyCube } from "./cube";

function Cubes({images}) {
  
    const group = useRef();
    useFrame(() => {
        group.current.rotation.y += 0.002;
    });
    return (
      <group ref={group}>
        {images.map((image, index)=>(
          <EmptyCube image={image}/>
        ))}
      </group>
    );
};

function Loader() {

    return <Html center className="fixedMiddle"><p className="standard-button fixedMiddle">
                content incoming...
    </p><div className="loader "></div></Html>
}

function Lights ()  {
      return (
      <group>
        <ambientLight intensity={5} />
   
        <pointLight intensity={1} position={[0, 0, 0]} color={0x1dff00}/>
      </group>
    );
  };

export default function EmptyBoids({media}) {
  let images = [];
  for (let index = 0; index < media.length; index++) {
    const element = media[index];
    if(!element.youtube){
      images.push(element);
    }
    
  }
  return (
    
      <Canvas className="mainCanvas" style={{pointerEvents: "none"}}>

        <Suspense fallback={<Loader/>}>
            <Cubes images={images}/>
            <Cubes images={images}/>
            <Cubes images={images}/>
            <Lights></Lights>
            <EffectComposer multisampling={8}>
              <Bloom kernelSize={1} luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.1} color={0x1dff00}/>
            </EffectComposer>        
        
        </Suspense>
  
      </Canvas>

  );
}