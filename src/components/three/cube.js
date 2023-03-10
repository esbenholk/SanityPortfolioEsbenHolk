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

  // Get a pre-configured url-builder from your sanity client
  const builder = imageUrlBuilder(sanityClient)

  // Then we like to make a simple function like this that gives the
  // builder an image and returns the builder for you to specify additional
  // parameters:
  function urlFor(source) {
    return builder.image(source)
  }




  export const ImageTextureMaterial = (imageUrl, material) => {
    const texture = useLoader(TextureLoader, imageUrl.imageUrl);
    return (
      <meshStandardMaterial
        attach="material"
        roughness={0}
        color="white"
        map={texture}
        material={material}
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

    const isActiveRef = useRef(isActive);

    // position
    const position = useMemo(() => {
      return [random(-3, 3, true), random(-3, 3, true), random(-3, 3, true)];
    }, []);

    // random time mod factor
    const timeMod = useMemo(() => random(0.1, 1, true), []);

    // color
    const color = isHovered ? 0xe5d54d : (isActive ? 0xf7e7e5 : 0xf95b3c);

    const size = isHovered ? 1 : (isActive ? 0.7 : 0.5);

    //useEffect of the activeState
    useEffect(() => {
      isActiveRef.current = isActive;
    }, [isActive]);

    // raf loop
    useFrame(() => {
      mesh.current.rotation.y += 0.01 * timeMod;
      if (isActiveRef.current) {
        time.current += 0.03;
        mesh.current.position.y = position[1] + Math.sin(time.current) * 0.4;
      }
    });

    // Events
    const onHover = useCallback(
      (e, value) => {
        e.stopPropagation();
        setIsHovered(value);

        props.stateChanger(props.project)

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
        <boxBufferGeometry attach="geometry" args={[size,size,size]} />
        <meshStandardMaterial
          attach="material"
          color={color}
          roughness={0.6}
          metalness={0.1}
        />

        <ImageTextureMaterial
          // imageUrl={props.project.mainImage.asset.url}
          imageUrl={urlFor(props.project.mainImage).width(200).url()}
          material={material}
        />
      </mesh>
    );
  };