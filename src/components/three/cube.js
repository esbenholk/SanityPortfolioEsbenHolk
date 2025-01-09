import React, {
    useMemo,
    useRef,
    useState,
    useEffect,
    useCallback
  } from "react";
  import { random } from "lodash";
  import { useLoader, useFrame } from "@react-three/fiber";

  import { useHistory } from "react-router-dom";
  import sanityClient from "../../client";
  import imageUrlBuilder from '@sanity/image-url'
  import { TextureLoader } from "three";
  import * as THREE from 'three';

  // Get a pre-configured url-builder from your sanity client
  const builder = imageUrlBuilder(sanityClient)

  // Then we like to make a simple function like this that gives the
  // builder an image and returns the builder for you to specify additional
  // parameters:
  function urlFor(source) {
    return builder.image(source)
  }




  export const ImageTextureMaterial = (imageUrl, material, opacity) => {
    const texture = useLoader(TextureLoader, imageUrl.imageUrl);
    return (
      <meshStandardMaterial
        attach="material"
        roughness={0}
        color="white"
        map={texture}
        material={material}
        transparent
        opacity={opacity}
      />
    );
  };


  export default function Cube(props) {
    const mesh = useRef();
    const time = useRef(0);
    const material = useRef();

    const history = useHistory();

    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [opacity, setOpacity] = useState(1);
    const [position, setPosition] = useState([
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
    ]);

    const isActiveRef = useRef(isActive);

    // position
    // const position = useMemo(() => {
    //   return [random(-3, 3, true), random(-3, 3, true), random(-3, 3, true)];
    // }, []);

    // random time mod factor
    const timeMod = useMemo(() => random(0.1, 1, true), []);



    const randomSize = 0.8;
    const size = isHovered ? randomSize*1.2 : (isActive ? randomSize : randomSize*0.8);

    //useEffect of the activeState
    useEffect(() => {
      isActiveRef.current = isActive;
    }, [isActive]);



    const resetPosition = () => {
      setPosition([
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
      ]);
      setOpacity(1);
    };
  
    useFrame(() => {
      mesh.current.rotation.y += 0.001 * timeMod;
      if (mesh.current) {
        // Move the cube closer to the origin (0, 0, 0)
        const speed = 0.01;
        mesh.current.position.lerp(new THREE.Vector3(0, 0, 0), speed);
  
        // Decrease opacity as it gets closer to the origin
        const distanceToCenter = mesh.current.position.length();
        const newOpacity = Math.max(0, opacity - 0.02 * (1 - distanceToCenter / 10));
        setOpacity(0.1);
  
        // If cube is close enough to the center and fully transparent, reset position
        if (distanceToCenter < 1 && newOpacity <= 0) {
          resetPosition();
        }
      }
    });

    // Events
    const onHover = useCallback(
      (e, value) => {
        e.stopPropagation();
        setIsHovered(value);
        if(value){
          props.stateChanger(props.project)
        } else {
          props.stateChanger(null);
        }


      },
      [setIsHovered, props]
    );

    const onClick = useCallback(
      e => {
        e.stopPropagation();
        setIsActive(v => !v);
        let path = "projects/"+props.project.slug.current;
        console.log(props.project);
        history.push(path);
      },
      [setIsActive, history, props]
    );

    return (
      <mesh
        ref={mesh}
        position={position}
        onClick={e => onClick(e)}
        onPointerOver={e => onHover(e, true)}
        onPointerOut={e => onHover(e, false)}
      >
        <boxGeometry attach="geometry" args={[size,size,size]} />
 

        <ImageTextureMaterial
          // imageUrl={props.project.mainImage.asset.url}
          imageUrl={urlFor(props.project.mainImage).width(500).height(500).url()}
          material={material}
          opacity={opacity}

        />
      </mesh>
    );
  };


  // export function EmptyCube({image}) {
  //   const mesh = useRef();
  //   const time = useRef(0);
  //   const material = useRef();

  //   const position = useMemo(() => {
  //     return [random(-3, 3, true), random(-3, 3, true), random(-3, 3, true)];
  //   }, []);

  //   // random time mod factor
  //   const timeMod = useMemo(() => random(0.1, 1, true), []);



  //   const size = 2;


  //   useFrame(() => {
  //     mesh.current.rotation.y += 0.01 * timeMod;
  //     mesh.current.rotation.x += 0.01 * timeMod;
  //     mesh.current.rotation.y += 0.01 * timeMod;
  //     time.current += 0.003;

  //   });

  //   console.log("CUBE:", image.image);


  //   return (
  //     <mesh
  //       ref={mesh}
  //       position={position}

  //     >
  //       <boxGeometry attach="geometry" args={[size,size,size]} />


  //       <ImageTextureMaterial
  //         // imageUrl={props.project.mainImage.asset.url}
  //         imageUrl={urlFor(image.image.asset).width(500).height(500).url()}
  //         material={material}
  //         opacity={opacity}
  //       />
  //     </mesh>
  //   );
  // };