import React, { useContext,  Suspense } from "react";

import { motion } from "framer-motion";

import AppContext from "../globalState";


import {ThreeDComp} from "./THREEd_comp"

// const {ThreeDComp}  = React.lazy(() => import("./THREEd_comp"));




export default function LandingPage() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;
  const projectList = myContext.projectList;


  return (
    <>
      <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // style={{ backgroundImage: `url(${info.backgroundImage.asset.url})` }}
      >
  
        <Suspense fallback={null}>
            <ThreeDComp projectList={projectList} mainImage={info.mainImage}/>
        </Suspense>
      </motion.div>
      

    </>

  );
}
