
import React from 'react'
import sanityClient from "../client";

import { NavLink } from "react-router-dom";

import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(sanityClient);

function urlFor(source) {
  return builder.image(source);
}

function sideScroll(element,direction,speed,distance,step) {
    let scrollAmount = 0;
    var slideTimer = setInterval(() => {
        if(direction === 'left'){
            element.scrollLeft -= step;
        } else {
            element.scrollLeft += step;
        }
        scrollAmount += step;
        if(scrollAmount >= distance){
            window.clearInterval(slideTimer);
        }
    }, speed);
  } 


class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        project: props.project
      }
  }
  
  render() {
    return(
      <div className={"card " + this.props.classes}>
           
            {this.state.project.imagesGallery && this.state.project.imagesGallery.map((image, index) => (
              <>
              <RandImg image={image} index={index} project={this.state.project}/>
              {/* <h1 className="link">{this.state.project.title} </h1>  */}
              </>
        
            ))}
           
      </div>
    )
  }
}


class RandImg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        image: props.image,
        index: props.index,
        project: props.project
      }
  }
  
  render() {

    var topDistance = Math.floor(Math.random() * (90 - 0));
    return(

      <a href={"/projects/"+this.state.project.slug.current}> 
          <img alt="randIMGinGrandEcologies"className="surroundingImg" style={{top: topDistance + "%", left: 500*this.state.index, position: 'absolute', zIndex: "100"}} src={urlFor(this.state.image).url()} key={this.state.index}/>
 
      </a>
  
    )
  }
}

class CardContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disableScroll: false,
      scrollWidth: 0,
      scrollPos: 1,
      clonesWidth: 0,
      projectList: props.projectList
    }
    this.scrollContainerRef = React.createRef();
    this.handleScroll = this.handleScroll.bind(this);
    this.scrollNext = this.scrollNext.bind(this);
    this.scrollPrev = this.scrollPrev.bind(this);
    this.setScroll = this.setScroll.bind(this);
    this.getClonesWidth = this.getClonesWidth.bind(this);
    this.reCalc = this.reCalc.bind(this);
  }
  
  reCalc() {
    let scrollPos = this.state.scrollPos;
    let scrollWidth = this.scrollContainerRef.current.clientWidth;
    let clonesWidth = this.getClonesWidth();

    if (scrollPos <= 0) {
      scrollPos = 1;
    }
    this.setState({
      scrollPos: scrollPos,
      scrollWidth: scrollWidth,
      clonesWidth: clonesWidth,
    });
  }
  
  handleScroll(e) {
    const container = e.currentTarget;
    const scrollWidth = container.scrollWidth;
    const clonesWidth = this.getClonesWidth();
    let scrollPos = container.scrollLeft;
    let scrollPosAdd;
    container.clientWidth > clonesWidth ? scrollPosAdd = container.clientWidth : scrollPosAdd = clonesWidth;
    
    if (!this.state.disableScroll) {
      if (scrollPos + scrollPosAdd >= scrollWidth) {
        this.setScroll(
          // The math floor value helps smooth out the scroll jump, 
          // I don't know why that particular value works, but it does 
          // Same goes for the other setScroll call below
          container, 1 + Math.floor(scrollPosAdd/12.09)
        );
        this.setState({
          disableScroll: true,
        });
      } else if (scrollPos <= 0) {
        this.setScroll(
          container, scrollWidth - clonesWidth - Math.floor(scrollPosAdd/12.09)
        );
        this.setState({
          disableScroll: true,
        });
      }
    } 
    
    this.setState({
      scrollWidth: container.scrollWidth,
      scrollPos: container.scrollLeft,
    });
  } 
  
  getClonesWidth() {
    const clones = document.getElementsByClassName('is-clone');
    let clonesWidth = 0;
    for (let i = 0; i < clones.length; i++) {
      clonesWidth = clonesWidth + clones[i].clientWidth;
    }
    return clonesWidth;
  }
 
  setScroll(element, pos) {
    element.scrollLeft = pos;
    this.setState({
      scrollPos: element.scrollLeft,
    });
  }
  
  scrollNext(e) {
    const container = e.currentTarget.previousSibling;
    sideScroll(container,'right', 10, 272, 10);
  }
  
  scrollPrev(e) {
    const container = e.currentTarget.nextSibling;
    sideScroll(container, 'left', 10, 272, 10);
  }
  
  
  
  componentDidUpdate(prevProps, prevState) {
      if (this.state.disableScroll) {
        window.setTimeout(function() {
          this.setState({
            disableScroll: false,
          });
        }.bind(this), 40)
      }
  }
  
  componentDidMount() {
    window.addEventListener('resize', this.reCalc);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.reCalc);
  }
  
  render() {
    console.log("CARDCONTAINRR" , this.state.projectList);
    return(
      <div className="card-container">
    
        <div ref={this.scrollContainerRef} className="scrolling-wrapper" onScroll={this.handleScroll}>
            {this.state.projectList &&
                this.state.projectList.map((element, index) => (
                <Card title={'Card Number' + index} classes={""} project={element} key={index}/>
            ))}
            {this.state.projectList &&
                this.state.projectList.map((element, index) => (
                <Card title={'Card Number' + index} classes={`is-clone ${index===1 ? "is-start" : ""}`} project={element} key={index}/>
            ))}
        </div>

      </div>
    )
  }
}




export default class HorizontalScrollComp extends React.Component {

    constructor(props) {
        console.log(props);
        super(props);
        this.state = {
          projectList: props.projects
        }
      
    }

  render() {
    console.log("HORCOMP,", this.state.projectList);
    return (
      <div className="app">
           <nav className="footer-nav">
              <NavLink className="standard-button" to="/gallery">
                Gallery
              </NavLink>

              <NavLink className="standard-button" to="/gallery">
                Gallery
              </NavLink>
            </nav>
         <main className="scrollcontent" >
            <CardContainer projectList={this.state.projectList}/>
        </main>        
      </div>
    )
  }
}
