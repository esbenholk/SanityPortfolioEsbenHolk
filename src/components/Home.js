import React, { useContext } from "react";

import AppContext from "../globalState";
import { motion } from "framer-motion";

import BlockContent from "./blocks/BlockContent";

import Image from "./blocks/image";

export default function Home() {
  const myContext = useContext(AppContext);
  const info = myContext.siteSettings;

  return (
    <div>
      <div className="content-container fullWidthPadded">
        {info ? (
          <div className="align-top">
            <motion.h1 className="headline">
              Esben Holk @ HOUSE OF KILLING
            </motion.h1>

            <div className="flex-column contentColumn regContainer">
              <div className="flex-row align-center">
                {info.authorImage ? (
                  <div className="project_main_image">
                    <Image
                      image={info.authorImage}
                      // mainImageHeight={mainImageHeight}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex-row justifyBetween">
              {info.about ? (
                <div className="authorInfo">
                  <BlockContent blocks={info.about} />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
