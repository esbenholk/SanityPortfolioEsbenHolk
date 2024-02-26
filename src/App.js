/* eslint-disable no-lone-blocks */
import { BrowserRouter, Route, Switch} from "react-router-dom";
import useWindowDimensions from "./components/functions/useWindowDimensions";

import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  createRef,
 useCallback
} from "react";
// import NavBar from "./components/NavBar.js";
import "./App.css";
import sanityClient from "./client";
import Header from "./components/Header_function";
import { AnimatePresence } from "framer-motion";

import AppContext from "./globalState";

import { NavLink } from "react-router-dom";

import ScrollToTop from "./components/blocks/scrollToTop";

// import HorizontalScrollComp from "./components/horizontalScroll";
import Boids from "./components/three/boids";
import Cross from "./components/cross.js";


// import useWindowDimensions from "./components/functions/useWindowDimensions";

const SinglePost = lazy(() => import("./components/SinglePost.js"));
// const LandingPage = lazy(() => import("./components/LandingPage.js"));
const Projects = lazy(() => import("./components/projectList2022.js"));
const Category = lazy(() => import("./components/Category.js"));
// const ThreeDScene = lazy(() => import("./components/threeDscene"));

const Gallery = lazy(()=> import("./components/Gallery"))

function App() {
  const [siteSettings, setSiteSettings] = useState();
  const [projectList, setProjectList] = useState();
  const [sortedProjects, setSortedProjects] = useState();
  const [settingsProject, setSettingsproject] = useState();
  const [listIsActive, setListIsActive] = useState(false);
  const [galleryIsActive, setGalleryIsActive] = useState(false);
  const [threedIsActive, setThreedIsActive] = useState(false);

  


  // const cursorRef = useRef(null);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);


  const [hasFeaturedPosts, setHasFeaturedPosts] = useState(false);
  const mainRef = createRef();
  const { width } = useWindowDimensions();

  const[selectedProject, setSelectedProject]=useState({});
  const [isActive, setIsActive] = useState();

  const updateSelectedProjectOnHover = useCallback((project) => {
    if(project){
      setSelectedProject(project);
      setIsActive(true);

    } else {
      setIsActive(false);
    }
   
  }, []);

  useEffect(()=>{
    
    if(width<600){
      setGalleryIsActive(true);
    } else {
      setThreedIsActive(true);
    }
  },[width])

  useEffect(() => {
    sanityClient
      .fetch(
        '*[_type == "siteSettings"]{title, greeting, mainImage{asset->{_id,url}, hotspot, alt}, mainImages, authorImage{asset->{_id,url}, hotspot, alt}, backgroundImage{asset->{_id,url}, hotspot, alt}, logo{asset->{_id,url}}, footerlogo{asset->{_id,url}},featuredProjects, about, contact, socialMediaHandles[]{logo{asset->{_id,url}},url, URLName}, contactDetails, contactHours}'
      )
      .then((data) => {
        setSiteSettings(data[0]);
        if (data[0].featuredProjects && data[0].featuredProjects.length > 0) {
          setHasFeaturedPosts(true);
        }
      })
      .catch(console.error);

    sanityClient
      .fetch(
        '*[_type == "project"]{id, title,mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, year, abbreviated_year, star_rating ,slug, categories[]->{title, slug}, imagesGallery[], tags, color, recap, body, yearString, videos[]}'
      )
      .then((data) => {
        data.sort((a, b) => b.year - a.year);
        setProjectList(data);
        console.log("if i whisper seductively in the inspector will you cum'n'free me plz?", data);
      })
      .catch(console.error);


  }, []);

  useEffect(() => {
    var tags = [];
    var categories = [];
    if (projectList) {

      const sortedProjects1 = projectList.filter((element) => {
        return element.slug.current !== "esben-holk-house-of-killing";
      })
      setSortedProjects(sortedProjects1);

      const settingsProject1 = projectList.find((element) => {
        return element.slug.current === "esben-holk-house-of-killing";
      })

      setSettingsproject(settingsProject1);

      for (let index = 0; index < projectList.length; index++) {
        const post = projectList[index];

        if (post.tags != null && Array.isArray(post.tags)) {
          for (let index = 0; index < post.tags.length; index++) {
            const tag = post.tags[index];
            tags.push(tag);
          }
        }
        if (post.categories != null && Array.isArray(post.categories)) {
          for (let index = 0; index < post.categories.length; index++) {
            const category = post.categories[index];

            if (categories.some((item) => item.title === category.title)) {

            } else {
              categories.push(category);

            }
          }
        }
      }

      let sortedTags = [...new Set(tags)];
      setTags(sortedTags);

      let sortedCategories = [...new Set(categories)];
      setCategories(sortedCategories);
    }
  }, [projectList]);

  const globalContext = {
    siteSettings: siteSettings,
    projectList: projectList,
    tags: tags,
    categories: categories,
    hasFeaturedPosts: hasFeaturedPosts,
    mainRef: mainRef,
    setSiteSettings,
    setProjectList,
    setTags,
    setCategories,
    setHasFeaturedPosts,
  };



  return (
    <main>
      <Suspense fallback={null}>
        <AppContext.Provider value={globalContext}>
          <BrowserRouter>
            {siteSettings && <Header />}

         
            <AnimatePresence>

                <ScrollToTop>
                   <Switch>
                    <Route exact path="/">
                      {sortedProjects && (
                            <>
                            {threedIsActive && 
                              <Boids projects={sortedProjects} info={siteSettings} settingsProject={settingsProject} updateSelectedProjectOnHover={updateSelectedProjectOnHover} />
                              }
                            {listIsActive && <Projects info={siteSettings} projectList={projectList} />}
                            {galleryIsActive && <Gallery info={siteSettings} projectList={sortedProjects} updateSelectedProjectOnHover={updateSelectedProjectOnHover} /> }          
                            </>
                          )
                      }
                    <div className="flex-column modeNav">
                      {width>600 &&      <button className={threedIsActive ? "standard-button mode active" :"standard-button mode "} onClick={()=>{setThreedIsActive(!threedIsActive)}}>
                      3D
                    </button>}
               
          
                    <button 
                      className={galleryIsActive ? "standard-button mode active" :"standard-button mode"}
                      onClick={function(){
                        if(width>600){
                          setGalleryIsActive(!galleryIsActive);
                        } else {
                      
                          setGalleryIsActive(true);
                          setListIsActive(false);
                        }
                        
                   
                      }}
                      >
                      GALLERY
                    </button>
                    <button 
                      className={listIsActive ? "standard-button mode active" :"standard-button mode"}  
                      onClick={function(){
                        if(width>600){
                       
                          setListIsActive(!listIsActive);

                        } else {
                      
                          setGalleryIsActive(false);
                          setListIsActive(true);
                        }
                        
                   
                      }}
                      >
                      LIST 
                    </button>
               
                    </div>

                    </Route>
                    <Route path="/projects/:slug">
                      {projectList && <SinglePost projectList={projectList} updateSelectedProjectOnHover={updateSelectedProjectOnHover} />}
                    </Route>
                    <Route path="/projects">
                    {siteSettings && (
                        <>
                          <Projects info={siteSettings} projectList={projectList} />
                      </>
                      )}
                  


                    </Route>
               
                    <Route path="/gallery">
                    {siteSettings && (
                
                       <Gallery info={siteSettings}
                          projectList={projectList} updateSelectedProjectOnHover={updateSelectedProjectOnHover} />
                   
                      )}
                  
                    </Route>
               
                    <Route path="/:slug">
                      <Category updateSelectedProjectOnHover={updateSelectedProjectOnHover} />
                    </Route>



                  </Switch>

                  <Cross selectedProject={selectedProject} shouldHaveBackground={true} isActive={isActive}/>


                </ScrollToTop>



            </AnimatePresence>        
          </BrowserRouter>
        </AppContext.Provider>

      </Suspense>
    </main>
  );
}

export default App;
