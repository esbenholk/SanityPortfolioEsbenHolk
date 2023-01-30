import {
  Bloom,

  EffectComposer,

  HueSaturation,

} from "@react-three/postprocessing";

import React from "react";

// Glitch,

// ChromaticAberration,


export default function Effects() {
const args = [1, 1, 1];

  return (
    <EffectComposer>

        <Bloom
            intensity={1}
            luminanceSmoothing={0.9 * args[1]}
            luminanceThreshold={0.6 * args[2]}
            color={"#39FF14"}
                />
        <HueSaturation
            hue={Math.PI * 0.025}
            saturation={Math.PI * 0.25}
        />
        
        {/* <ChromaticAberration offset={[0.02, 0.002]} /> */}

{/* 
        <Glitch
          delay={[args[0] * 1.5, args[0] * 3.5]}
          duration={[args[1] * 0.6, args[1]]}
          strength={[args[2] * 0.3, args[2]]}
        /> */}
     
    </EffectComposer>
  );
}

export { Effects };
