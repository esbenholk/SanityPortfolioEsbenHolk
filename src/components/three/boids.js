import React, {  useRef,     useState, useEffect, useCallback, Suspense} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html,  DeviceOrientationControls, useTexture } from '@react-three/drei'

import sanityClient from "../../client";
import imageUrlBuilder from '@sanity/image-url'
import * as THREE from 'three';

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(sanityClient)

// Then we like to make a simple function like this that gives the
// builder an image and returns the builder for you to specify additional
// parameters:
function urlFor(source) {
  return builder.image(source)
}



function Loader() {

    return <Html center className="fixedMiddle"><p className="standard-button fixedMiddle">
                content incoming...
    </p><div className="loader "></div></Html>
}
function OscillatingImagePlanes({ project, stateChanger,camera, onClick, currentProject, image}){
  const texture = useTexture(urlFor(image).width(200).url());
  const [aspectRatio, setAspectRatio] = useState(1);
  const [upgradableTexture, setUpgradableTexture] = useState(texture);
  const [isUpgraded, setIsUpgraded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = urlFor(image).width(10).url();
    img.onload = () => {
      setAspectRatio(img.width / img.height);
    };
  }, [image]);




  const upgradeImageOnClick = () => {
    // Dynamically load the new texture upon click
    if(!isUpgraded){
      new THREE.TextureLoader().load(urlFor(image).width(1000).url(), (newTexture) => {
        setUpgradableTexture(newTexture);
      });
      setIsUpgraded(true);
    }
  };






  return (
    <>
      {Array.apply(null, { length: 5 }).map((el, i) =>
          <group>
              <OscillatingImagePlane upgradeImageOnClick={upgradeImageOnClick}texture={upgradableTexture} aspectRatio={aspectRatio} project={project} stateChanger={stateChanger} camera={camera} onClick={onClick} currentProject={currentProject}/>
           </group>
       )}
    </>

    
  );
};
const OscillatingImagePlane = ({ upgradeImageOnClick, project, stateChanger,camera, onClick, currentProject, texture, aspectRatio}) => {
  const meshRef = useRef();
  const [originalPosition] = useState([
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
  ]);
  const [position] = useState(new THREE.Vector3(...originalPosition));
  const [movingToCenter, setMovingToCenter] = useState(true);
  const [delay] = useState(Math.random() * 2); // Random delay between 0 and 2 second
  const [distanceTOcenter] = useState(2); // Random delay between 0 and 2 seconds
  const [elapsedTime, setElapsedTime] = useState(0);


 

  useFrame((delta) => {

   
    if (currentProject != null && currentProject.title === project.title) {
      // If the plane is in focus, move it to the center smoothly and stop oscillation
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      const centerPosition = new THREE.Vector3().copy(camera.position).add(cameraDirection.multiplyScalar(0.25));      
      
      meshRef.current.position.lerp(centerPosition, 0.1);
      meshRef.current.lookAt(camera.position);
      return;
    }
   
    setElapsedTime((prev) => prev + delta);
    // Delay the movement if the elapsed time is less than the delay
    if (elapsedTime < delay) return;

    if (meshRef.current) {
      const targetPosition = movingToCenter ? camera.position : new THREE.Vector3(...originalPosition);
      const speed = 0.001;
      
      // Move towards the target position
      meshRef.current.position.lerp(targetPosition, speed);
      // Make the plane face the camera
      meshRef.current.lookAt(camera.position);
      // Check if near the target position and reverse direction
      if (meshRef.current.position.distanceTo(targetPosition) < distanceTOcenter) {
        setMovingToCenter(!movingToCenter); // Reverse the direction
      }
    }
  });





  const onHover = useCallback(
      (e, value) => {
          e.stopPropagation();
          // setIsHovered(value);
          if(value){
            stateChanger(project);
          } else {
            stateChanger(null);
          }

      },[stateChanger, project]
  );

  const onMissed = useCallback(
    (e) => {
        e.stopPropagation();
        // setIsActive(false);
        onClick(null);
        // setIsClicked(false);
    },[onClick]
  );
  const handleFirstClick= useCallback(
    e => {
      e.stopPropagation();
      // setIsActive(true);
      // setIsClicked(true);
      upgradeImageOnClick();
      onClick(project);         
    },
    [onClick, project, upgradeImageOnClick]
  );





  return (
    <group>
        <mesh
        ref={meshRef}
        position={position}
        onClick={e => handleFirstClick(e)}
        onPointerOver={e => onHover(e, true)}
        onPointerOut={e => onHover(e, false)}
        onPointerMissed={e=>onMissed(e)}
      >
        <planeGeometry args={[0.3 * aspectRatio, 0.3]} />
        <meshBasicMaterial map={texture} transparent/>

      
      </mesh>

    </group>
    
  );
};

const ImageCubeScene = ({ projects,  stateChanger, handlePlaneClickOutsideCanvas}) => {
    const controlsRef = useRef();
    const { camera } = useThree();



    // Detect if on mobile or desktop
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    const [currentProject, setCurrentProject] = useState(null)
  
    const handlePlaneClick = (clickedProject) => {
      handlePlaneClickOutsideCanvas(clickedProject);
      setCurrentProject(clickedProject); // Set the camera's target position to focus on the clicked plane
    };
    const handleControlsChange = (event) => {
      setCurrentProject(null);
    };



    return (
      < >
        <Suspense fallback={<Loader />}> 
            {projects.map((project) => (
             <OscillatingImagePlanes project={project} stateChanger={stateChanger} camera={camera} onClick={handlePlaneClick} currentProject={currentProject} image={project.mainImage}/>
          ))}


       </Suspense>
 
        {isMobile ? (
          <DeviceOrientationControls ref={controlsRef} />
        ) : (
          <OrbitControls onChange={handleControlsChange} ref={controlsRef} enableZoom={false} enablePan={false}/>
        )}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        </>
    );
  };


export default function Boids({settingsProject, projects, updateSelectedProjectOnHover}) {
  const [clickedProject, setClickedProject] = useState(null);

  const handlePlaneClick = (clickedProject) => {
    setClickedProject(clickedProject); // Set the camera's target position to focus on the clicked plane
  };

  return (
    <>
      <Canvas camera={{ position: [0, 0, 0.1]}} className="mainCanvas">
        <ImageCubeScene projects={projects} stateChanger={updateSelectedProjectOnHover} handlePlaneClickOutsideCanvas={handlePlaneClick}/>
      </Canvas>
      {clickedProject != null &&
        <>
   
          <div className="project-plane-container">
          <a className="standard-button"  href={"/projects/" + clickedProject.slug.current}>
              {clickedProject.title}
          </a>
              <button className="standard-button"> more images </button>
              <button className="standard-button">info</button>
         </div>
        </>
      }
 
    </>
  );
}