import React, {useRef, useEffect} from "react";
import BlockContent from "./blocks/BlockContent";
import useWindowDimensions from "./functions/useWindowDimensions";



const Cross = (props) => {


    const verCursor = useRef(null);
    const horCursor = useRef(null);
    const projectContainer = useRef(null);
    const { width } = useWindowDimensions();

  const mainCursor = useRef(null);
  const positionRef = useRef({
    mouseX: 0,
    mouseY: 0,
    destinationX: 0,
    destinationY: 0,
    distanceX: 0,
    distanceY: 0,
    key: -1,
  });

  console.log("CROSS PROJECT", props.selectedProject);

  useEffect(() => {
    document.addEventListener("mousemove", (event) => {
      
      const { clientX, clientY } = event;

      const mouseX = clientX;
      const mouseY = clientY;

      mainCursor.current.style.transform = `translate3d(${mouseX -
        mainCursor.current.clientWidth / 2}px, ${mouseY -
        mainCursor.current.clientHeight / 2}px, 0)`;
    
      verCursor.current.style.transform = `translate3d(${mouseX -
          verCursor.current.clientWidth / 2}px, 0px, 0`;
          
      horCursor.current.style.transform = `translate3d(0px, ${mouseY -
          horCursor.current.clientHeight / 2}px, 0)`;

      projectContainer.current.style.width =  `${(mouseX -
          verCursor.current.clientWidth / 2) + 10}px`;
          
      });

   

      return () => {};

  }, []);

  useEffect(() => {
    const followMouse = () => {
      positionRef.current.key = requestAnimationFrame(followMouse);
      const {
        mouseX,
        mouseY,
        destinationX,
        destinationY,
        distanceX,
        distanceY,
      } = positionRef.current;
      if (!destinationX || !destinationY) {
        positionRef.current.destinationX = mouseX;
        positionRef.current.destinationY = mouseY;
      } else {
        positionRef.current.distanceX = (mouseX - destinationX) * 0.1;
        positionRef.current.distanceY = (mouseY - destinationY) * 0.1;
        if (
          Math.abs(positionRef.current.distanceX) +
            Math.abs(positionRef.current.distanceY) <
          0.1
        ) {
          positionRef.current.destinationX = mouseX;
          positionRef.current.destinationY = mouseY;
        } else {
          positionRef.current.destinationX += distanceX;
          positionRef.current.destinationY += distanceY;
        }
      }
    };
    followMouse();
  }, []);
  return (

        <>
            <div className="main-cursor " ref={mainCursor}></div>
            <div className="cross hor" ref={horCursor}>
              {width>500 ? <>       <div className="standard-container projectnamecontainer" ref={projectContainer}>
                  {props.selectedProject.title && (
                    <p className="projectTitle borderBottom">{props.selectedProject.title}</p>
                  )}
                  {props.selectedProject.recap && ( 
                    <div className="projectRecap">
                      <BlockContent blocks={props.selectedProject.recap} />
                    </div>
                  )}
              </div>
              {props.selectedProject.year && (
                    <p className="standard-container projectYear">{props.selectedProject.year}</p>
              )}</>: null}
       
           
            </div>
            <div className="cross ver" ref={verCursor}></div>

        </>
  );
};

export default Cross;