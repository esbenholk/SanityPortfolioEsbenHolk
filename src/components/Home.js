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

            <div className="flex-row justifyBetween">
              {info.authorImage ? (
                <Image image={info.authorImage} class={"authorImage"} />
              ) : null}
              {info.about ? (
                <div class="authorInfo">
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
