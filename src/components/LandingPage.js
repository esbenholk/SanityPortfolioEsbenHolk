import * as THREE from 'three'
import React, { Suspense, useRef, useContext } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, ScrollControls, Scroll, Preload, Image as ImageImpl } from '@react-three/drei'
import AppContext from "../globalState";


// {projectList &&
//   projectList.map((element, index) => (
//     <Page position={[width * index, 0, 0]} urls={[element.mainImage.asset.url]} key={index} />
//   ))}
// </>

function Image(props) {
  const ref = useRef()
  const group = useRef()

  return (
    <group ref={group}>
      <ImageImpl ref={ref} {...props} />
    </group>
  )
}


function Page({ m = 0.4, urls, project, title, ...props }) {
  const { width } = useThree((state) => state.viewport)
  const w = width < 10 ? 1.8 / 3 : 1 / 3;

  console.log(project);

  return (
    <group {...props}>

  

      {/* <Image position={[-width * w, Math.random() * (1 - -1) + -1, 1.9]} scale={[width * w - m * 2, width * w - m * 2, 1]} url={project.mainImage.asset.url} /> */}
            {/* <Image position={[width * w, Math.random() * (1 - -1) + -1, 1]} scale={[width * w - m * 1, width * w - m * 1, 1]} url={project.mainImage.asset.url} /> */}

      {project.productImage ?       <Image position={[0, Math.random() * (1.2 - -1.2) + -1, 0]} scale={[width * w - m * 3, width * w - m * 3, 1]} url={project.productImage.asset.url} /> : null}

      <Html
        as="div" // Wrapping element (default: 'div')
        zIndexRange={[100, 0]} // Z-order range (default=[16777271, 0])
        position={[width * w, Math.random() * (1 - -1) + -1, 1]}
      >
        {/* <Card /> */}
        <a className="standard-button" href={"/projects/" + project.slug}>
            {title}
          </a>
      </Html>
    </group>
  )
}

function Pages({projectList}) {
  const { width } = useThree((state) => state.viewport);

  const firstProject = projectList[0];


  return (
    <>
    
    {firstProject &&
        <Page position={[-width * 1*0.9, 0, 0]} project={firstProject} title={firstProject.title}/>
     }   

    {projectList &&
        projectList.map((element, index) => (
        <Page position={[width * index*0.9, 0, 0]} project={element} key={index} title={element.title}/>
    
      ))}
  


    </>
  )
}

export default function LandingPage() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;
  const projectList = myContext.projectList;
  return (
    <Canvas gl={{ antialias: false }} dpr={[1, 6]} className="mainCanvas">
      <Suspense fallback={null}>
        <ScrollControls infinite horizontal damping={4} pages={projectList.length + 3} distance={1}>
          <Scroll>

            <Pages projectList={projectList} />
          </Scroll>
        </ScrollControls>
        <Preload />
      </Suspense>
    </Canvas>
  )
}




