import React, {  useRef, Suspense} from "react";
import { map } from "lodash";
import { EffectComposer, Bloom} from '@react-three/postprocessing'
import { Canvas, useFrame } from "@react-three/fiber";
import {Html} from "@react-three/drei";
import Cube from "./cube";
import Model from "./model"

function Cubes({projects, stateChanger}) {
      const group = useRef();

      useFrame(() => {
        group.current.rotation.y += 0.002;
      });

      const nodesCubes = map(projects, (project, i) => {
        return <Cube key={i} project={project} stateChanger={stateChanger} />;
      });
    
    return <group ref={group}>{nodesCubes}</group>;

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



export default function Boids({settingsProject, projects, updateSelectedProjectOnHover}) {

  return (
    
      <Canvas className="mainCanvas" >

        <Suspense fallback={<Loader/>}>
            <Cubes projects={projects} stateChanger={updateSelectedProjectOnHover}/>
            <Cubes projects={projects} stateChanger={updateSelectedProjectOnHover}/>
            <Model stateChanger={updateSelectedProjectOnHover} project={settingsProject}></Model>
            <Lights></Lights>
            <EffectComposer multisampling={8}>
              <Bloom kernelSize={1} luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.1} color={0x1dff00}/>
            </EffectComposer>        
        
        </Suspense>
  
      </Canvas>

  );
}