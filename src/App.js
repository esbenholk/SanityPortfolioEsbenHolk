/* eslint-disable no-lone-blocks */
import { BrowserRouter, Route, Switch, useLocation } from "react-router-dom";
import React, { Suspense, lazy, useEffect, useMemo, useState, createRef } from "react";
import "./App.css";
import "./themes.css";
import "./chaos.css";
import sanityClient from "./client";
import Header from "./components/Header_function";
import Footer from "./components/Footer";
import { AnimatePresence } from "framer-motion";

import AppContext from "./globalState";
import ScrollToTop from "./components/blocks/scrollToTop";
import CursorTrail from "./components/retro/CursorTrail";
import { scatterCommercials } from "./components/retro/Commercial";
import { PageGlitch } from "./components/retro/Glitch";
import PopupAds from "./components/retro/PopupAds";
import SwampAtmosphere from "./components/retro/SwampAtmosphere";

const LandingPage = lazy(() => import("./components/LandingPage.js"));
const SinglePost = lazy(() => import("./components/SinglePost.js"));
const ProjectList = lazy(() => import("./components/ProjectList.js"));
const Category = lazy(() => import("./components/Category.js"));
const ChaosPage = lazy(() => import("./components/ChaosPage"));
const InstagramPage = lazy(() => import("./components/instagram/InstagramPage"));

// The about page is a project with this slug; it's kept out of the project grids
const ABOUT_SLUG = "esben-holk-house-of-killing";

// Tears the page briefly on every route change
function RouteGlitch() {
  const location = useLocation();
  return <PageGlitch trigger={location.pathname} />;
}

function App() {
  const [siteSettings, setSiteSettings] = useState();
  const [projectList, setProjectList] = useState();
  const [sortedProjects, setSortedProjects] = useState();
  const [settingsProject, setSettingsproject] = useState();
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hasFeaturedPosts, setHasFeaturedPosts] = useState(false);
  const [commercials, setCommercials] = useState([]);
  const mainRef = createRef();

  // Site skin: "storefront" | "tube" | "swamp", remembered per browser
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("hok_theme") || "storefront";
    } catch (e) {
      return "storefront";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("hok_theme", theme);
    } catch (e) {}
  }, [theme]);

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
      })
      .catch(console.error);

    sanityClient
      .fetch(
        '*[_type == "commercial" && active != false]{_id, title, image{asset->{_id, url, mimeType, metadata{dimensions}}, hotspot, alt}, url, "projectSlug": project->slug.current, placements}'
      )
      .then(setCommercials)
      .catch(console.error);
  }, []);

  // where each commercial shows up this visit
  const commercialSlots = useMemo(() => scatterCommercials(commercials), [commercials]);

  useEffect(() => {
    if (!projectList) return;

    setSortedProjects(projectList.filter((post) => post.slug.current !== ABOUT_SLUG));
    setSettingsproject(projectList.find((post) => post.slug.current === ABOUT_SLUG));

    const allTags = [];
    const allCategories = [];
    projectList.forEach((post) => {
      if (Array.isArray(post.tags)) allTags.push(...post.tags);
      if (Array.isArray(post.categories)) {
        post.categories.forEach((category) => {
          if (!allCategories.some((item) => item.title === category.title)) {
            allCategories.push(category);
          }
        });
      }
    });
    setTags([...new Set(allTags)]);
    setCategories(allCategories);
  }, [projectList]);

  const globalContext = {
    siteSettings: siteSettings,
    // the storefront shows the works without the about project
    projectList: sortedProjects,
    allProjects: projectList,
    settingsProject: settingsProject,
    tags: tags,
    categories: categories,
    hasFeaturedPosts: hasFeaturedPosts,
    commercialSlots,
    mainRef: mainRef,
    theme,
    setTheme,
    setSiteSettings,
    setProjectList,
    setTags,
    setCategories,
    setHasFeaturedPosts,
  };

  return (
    <main className="site">
      <Suspense fallback={null}>
        <AppContext.Provider value={globalContext}>
          <BrowserRouter>
            <RouteGlitch />
            <CursorTrail />
            {theme === "tube" && <PopupAds />}
            {theme === "swamp" && <SwampAtmosphere />}
            {siteSettings && <Header />}
            <AnimatePresence>
              <div className="mainContainer" ref={mainRef}>
                <ScrollToTop>
                  <Switch>
                    <Route exact path="/">
                      {siteSettings && <LandingPage />}
                    </Route>
                    <Route path="/projects/:slug">
                      {projectList && <SinglePost />}
                    </Route>
                    <Route path="/projects">
                      <ProjectList projectList={sortedProjects} />
                    </Route>
                    <Route path="/chaos">
                      <ChaosPage mode="boids" />
                    </Route>
                    <Route path="/gallery">
                      <ChaosPage mode="gallery" />
                    </Route>
                    <Route path="/mappingconfusion">
                      <ChaosPage mode="mapping" />
                    </Route>
                    <Route path="/ascii">
                      <ChaosPage mode="ascii" />
                    </Route>
                    <Route path="/instagram">
                      <InstagramPage />
                    </Route>
                    <Route path="/:slug">
                      <Category />
                    </Route>
                  </Switch>
                </ScrollToTop>
              </div>
            </AnimatePresence>
            {siteSettings && <Footer info={siteSettings} />}
          </BrowserRouter>
        </AppContext.Provider>
      </Suspense>
    </main>
  );
}

export default App;
