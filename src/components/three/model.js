import { useGLTF} from "@react-three/drei";
import React, {
  useRef,
  useState,

  useCallback
} from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

import { useHistory } from "react-router-dom";


export default function Model (props  ) {

  const { nodes } = useGLTF('/three/simlogo.glb', true);
  const simlogo = useRef();
  const material = useRef();

  const history = useHistory();

  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useFrame(() => {
    simlogo.current.rotation.y += 0.009;
  });

  const size = isHovered ? 0.7 : (isActive ? 0.5 : 0.5);
  const yposition = isHovered ? -0.5 : (isActive ? -0.2 : -0.2);

   // Events
   const onHover = useCallback(
    (e, value) => {
      e.stopPropagation();
      setIsHovered(value);

      props.stateChanger(props.project)

    },
    [setIsHovered, props]
  );

  
 const ImageTextureMaterial = (imageUrl, material) => {
    const texture = useLoader(TextureLoader, imageUrl.imageUrl);
    return (
      <meshStandardMaterial
        attach="material"
        roughness={0}
        color="#39FF14"
        emmision="white"
        map={texture}
        material={material}
        thickness={4} metalness={1} clearcoat={1}
      />
    );
  };

  const onClick = useCallback(
    e => {
      e.stopPropagation();
      setIsActive(v => !v);
      let path = "/projects/esben-holk-house-of-killing"; 
      console.log(props.project);
      history.push(path);
    },
    [setIsActive, history, props]
  );

  return <mesh ref={simlogo} geometry={nodes.Cube.geometry} position={[0,yposition,0]} scale={[size,size,size]}         
  onClick={e => onClick(e)}
  onPointerOver={e => onHover(e, true)}
  onPointerOut={e => onHover(e, false)}> 
        <ImageTextureMaterial    imageUrl={"https://cdn.sanity.io/images/swdt1dj3/production/50e0726142d16da248d3ebd90237f98fe76badce-3000x3000.png?w=1000&h=1000&fit=max"} material={material}/>
        {/* <meshPhysicalMaterial envMapIntensity={100} color={0x04ff00} emmisive={0x4a9d39} flatShading={true} attenuationTint={0x4a9d39} attenuationDistance={0} transmission={1} thickness={2} roughness={0} metalness={1} clearcoat={1} clearcoatRoughness={1} /> */}
  </mesh>
};
