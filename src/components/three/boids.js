import React, {  useRef, Suspense, useState, useCallback } from "react";
import { map } from "lodash";

import { EffectComposer, Bloom} from '@react-three/postprocessing'

import { Canvas, useFrame } from "@react-three/fiber";
import {Environment, Html} from "@react-three/drei";


import Cube from "./cube";
import Model from "./model"

import Cross from "../cross";

function Cubes(props) {
      const group = useRef();

      useFrame(() => {
        group.current.rotation.y += 0.002;
      });

      const nodesCubes = map(props.projects.projects, (project, i) => {
        return <Cube key={i} project={project} stateChanger={props.stateChanger}/>;
      });
    
    return <group ref={group}>{nodesCubes}</group>;

    };

function Loader(props) {

    return <Html center className="fixedMiddle"><p className="standard-button fixedMiddle">
                content incoming...
    </p><div className="loader "></div></Html>
}


function Lights ()  {

      return (
      <group>
        <ambientLight intensity={0.3} />
   
        <pointLight intensity={1} position={[0, 0, 0]} color={0x1dff00}/>
      </group>
    );
  };



export default function Boids(projects) {

  const[selectedProject, setSelectedProject]=useState({});

  const updateSelectedProjectOnHover = useCallback((project) => {
    setSelectedProject(project);
  }, []);




  

  return (
    <>
 
     
      <Canvas className="mainCanvas" >

        <Suspense fallback={<Loader/>}>
            <Environment files="/environment.hdr" />

            <Cubes projects={projects} stateChanger={updateSelectedProjectOnHover}/>
            <Cubes projects={projects} stateChanger={updateSelectedProjectOnHover}/>
            <Cubes projects={projects} stateChanger={updateSelectedProjectOnHover}/>
            <Cubes projects={projects} stateChanger={updateSelectedProjectOnHover}/>
            
            <Model stateChanger={updateSelectedProjectOnHover} project={projects.settingsProject}></Model>
            <Lights></Lights>
            <EffectComposer multisampling={8}>
              <Bloom kernelSize={3} luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.6} color={0x1dff00}/>
            </EffectComposer>        
        
        </Suspense>
  
      </Canvas>
      <Cross selectedProject={selectedProject}/>

    </>
  );
}