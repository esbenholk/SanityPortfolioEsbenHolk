import React, {useRef, useEffect, useState} from "react";
import BlockContent from "./blocks/BlockContent";
import useWindowDimensions from "./functions/useWindowDimensions";


function JumbleLettersInElement(element, word){
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ@";

  let interval = null;

  let iteration = 0;
  
  clearInterval(interval);
  
  interval = setInterval(() => {
    element.innerText = word
      .split("")
      .map((letter, index) => {
        if(index < iteration) {
          return word[index];
        }
      
        return letters[Math.floor(Math.random() * letters.length)]
      })
      .join("");
    
    if(iteration >= word.length + 10){ 
      clearInterval(interval);
    }
    
    iteration += 1;
  }, 1);
}

const Cross = (props) => {
  const verCursor = useRef(null);
  const horCursor = useRef(null);
  const projectContainer = useRef(null);
  const title = useRef(null);
  const { width } = useWindowDimensions();
  const mainCursor = useRef(null);
  const [trackedProject, setTrackedProject] = useState(null);


  useEffect(() => {


    document.addEventListener("mousemove", (event) => {
      
      const { clientX, clientY } = event;

      const mouseX = clientX;
      const mouseY = clientY;

      if(mainCursor.current){
          mainCursor.current.style.transform = `translate3d(${mouseX -
            mainCursor.current.clientWidth / 2 }px, ${mouseY  -
            mainCursor.current.clientHeight / 2}px, 0)`;
        }

      if(horCursor.current){
        horCursor.current.style.transform = `translate3d(0px, ${mouseY -
          horCursor.current.clientHeight / 2 -30}px, 0)`;
      }

      if(verCursor.current){
        verCursor.current.style.transform = `translate3d(${mouseX -
          verCursor.current.clientWidth / 2 -30}px, 0px, 0`;
      }


      if(projectContainer.current){
        projectContainer.current.style.width =  `${(mouseX -
          verCursor.current.clientWidth / 2) -20 }px`;
      }
  
          
      });

   

      return () => {};

  }, []);

 
  useEffect(()=>{


  console.log("updates selected project in CrossHair", props.selectedProject.title);
  if(props.selectedProject !== trackedProject){
    if(title.current){
      JumbleLettersInElement(title.current, title.current.innerText);
    }
    setTrackedProject(props.selectedProject);
  }
  },[props.selectedProject, trackedProject])




  return (

        <>
            {props.isActive && <div className="main-cursor-ring" ref={mainCursor}>
              <div className="main-cursor "></div></div>}
            <div className="cross hor" ref={horCursor}>
              {width>500 && props.isActive ? <> 
                <div className="standard-container projectnamecontainer background" ref={projectContainer}>
                  {props.selectedProject.title && (
                    <p ref={title} id="title" className="projectTitle borderBottom">{props.selectedProject.title}</p>
                  )}
                  {props.selectedProject.recap && ( 
                    <div className="projectRecap">
                      <BlockContent blocks={props.selectedProject.recap} />
                    </div>
                  )}
                </div>
                {props.selectedProject.year && (
                      <p className="standard-container projectYear background">{props.selectedProject.year}</p>
                )}
              </>: null}
       
           
            </div>
            <div className="cross ver" ref={verCursor}></div>

        </>
  );
};

export default Cross;