/* eslint-disable no-lone-blocks */
import { BrowserRouter, Route, Switch } from "react-router-dom";
import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  createRef,
  // useRef,
} from "react";
// import NavBar from "./components/NavBar.js";
import "./App.css";
import sanityClient from "./client";
import Header from "./components/Header_function";

import { AnimatePresence } from "framer-motion";
import Footer from "./components/Footer";

import AppContext from "./globalState";

import ScrollToTop from "./components/blocks/scrollToTop";

// import useWindowDimensions from "./components/functions/useWindowDimensions";

const SinglePost = lazy(() => import("./components/SinglePost.js"));
const LandingPage = lazy(() => import("./components/LandingPage.js"));
const ProjectList = lazy(() => import("./components/ProjectList.js"));
const Category = lazy(() => import("./components/Category.js"));
const Home = lazy(() => import("./components/Home.js"));
const ThreeDScene = lazy(() => import("./components/threeDscene"));

function App() {
  const [siteSettings, setSiteSettings] = useState();
  const [projectList, setProjectList] = useState();
  // const cursorRef = useRef(null);

  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);

  const [basket, setBasket] = useState([]);

  const [hasFeaturedPosts, setHasFeaturedPosts] = useState(false);

  const mainRef = createRef();

  // const { width } = useWindowDimensions();

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
        '*[_type == "project"]{id, title,mainImage{asset->{_id,url}, hotspot, alt}, productImage{asset->{_id,url}, hotspot, alt}, year, abbreviated_year, star_rating ,slug, categories[]->{title, slug}, tags, color, recap, yearString}'
      )
      .then((data) => {
        data.sort((a, b) => b.year - a.year);
        setProjectList(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    var tags = [];
    var categories = [];
    if (projectList) {
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
              console.log("obejct in array already");
            } else {
              categories.push(category);
              console.log(category, categories);
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

  // function generateNoise(opacity, h, w) {
  //   function makeCanvas(h, w) {
  //     var canvas = document.createElement("canvas");
  //     canvas.height = h;
  //     canvas.width = w;
  //     return canvas;
  //   }

  //   function randomise(data, opacity) {
  //     // see prev. revision for 8-bit
  //     var i, x;
  //     for (i = 0; i < data.length; ++i) {
  //       x = Math.floor(Math.random() * 0xffffff); // random RGB
  //       data[i] = x | opacity; // set all of RGBA for pixel in one go
  //     }
  //   }

  //   function initialise(opacity, h, w) {
  //     var canvas = makeCanvas(h, w),
  //       context = canvas.getContext("2d"),
  //       image = context.createImageData(h, w),
  //       data = new Uint32Array(image.data.buffer);
  //     opacity = Math.floor(opacity * 0x255) << 24; // make bitwise OR-able
  //     return function () {
  //       randomise(data, opacity); // could be in-place for less overhead
  //       context.putImageData(image, 0, 0);
  //       // you may want to consider other ways of setting the canvas
  //       // as the background so you can take this out of the loop, too
  //       document.body.style.backgroundImage =
  //         "url(" + canvas.toDataURL("image/png") + ")";
  //     };
  //   }

  //   return initialise(opacity || 0.2, h || 55, w || 55);
  // }

  // var noise = generateNoise(0.8, 200, 200);

  // (function loop() {
  //   noise();
  //   requestAnimationFrame(loop);
  // })();

  const globalContext = {
    siteSettings: siteSettings,
    projectList: projectList,
    basket: basket,
    tags: tags,
    categories: categories,
    hasFeaturedPosts: hasFeaturedPosts,
    mainRef: mainRef,
    setSiteSettings,
    setProjectList,
    setBasket,
    setTags,
    setCategories,
    setHasFeaturedPosts,
  };

  // const followMouse = (e) => {
  //   const x = e.clientX;
  //   const y = e.clientY;

  //   cursorRef.current.style.transform = `translate3d(${x - 250}px, ${
  //     y - 250
  //   }px, 0)`;
  // };

  // useEffect(() => {
  //   if (cursorRef.current) {
  //     window.addEventListener("mousemove", followMouse);
  //   }

  //   return () => {
  //     window.removeEventListener("mousemove", followMouse);
  //   };
  // }, []);

  return (
    <main>
      <Suspense fallback={null}>
        <AppContext.Provider value={globalContext}>
          <BrowserRouter>
            {siteSettings && <Header />}
            <AnimatePresence>
              <div className="mainContainer" ref={mainRef}>
                <ScrollToTop>
                  <Switch>
                    <Route exact path="/">
                      {siteSettings && (
                        <LandingPage
                          info={siteSettings}
                          projectList={projectList}
                        />
                      )}
                    </Route>
                    <Route path="/projects/:slug">
                      {projectList && <SinglePost projectList={projectList} />}
                    </Route>
                    <Route path="/projects">
                      <ProjectList projectList={projectList} />
                    </Route>
                    <Route path="/about">
                      <Home info={siteSettings} projectList={projectList} />
                    </Route>
                    <Route path="/chaos">
                      <ThreeDScene projects={projectList} />
                    </Route>
                    <Route path="/:slug">
                      <Category />
                    </Route>
                  </Switch>
                </ScrollToTop>
              </div>
            </AnimatePresence>
            {/* {width > 900 && <div className="cursor" ref={cursorRef}></div>} */}
            {siteSettings && <Footer info={siteSettings} />}
          </BrowserRouter>
        </AppContext.Provider>
      </Suspense>
    </main>
  );
}

export default App;
