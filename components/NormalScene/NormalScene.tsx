import React, { forwardRef, Ref, useImperativeHandle, useRef } from "react";

import { Canvas } from "@react-three/fiber";
import Blocks from "./Blocks";
import { OrbitControls, Stars } from "@react-three/drei";
import { Block } from "./types";

const blocksWidth = 100;
const blocks: Block[] = [];
for (let i = 0; i < blocksWidth; i++) {
  for (let j = 0; j < blocksWidth; j++) {
    blocks.push({
      x: i - blocksWidth / 2,
      z: j - blocksWidth / 2,
      height: 0,
      targetHeight: 0.1,
    });
  }
}

const NormalScene = () => {
  return (
    <Canvas
      camera={{ position: [50, 50, 50] }}
      style={{ height: "100vh", backgroundColor: "black" }}
    >
      {/* Lights */}
      <ambientLight intensity={0.8} />
      <pointLight intensity={1} position={[0, 6, 0]} />

      {/* Scene */}
      <Blocks blocks={blocks} />

      {/* Controls */}
      <OrbitControls />

      {/* Background and misc */}
      <Stars />
      <axesHelper />
    </Canvas>
  );
};

export default NormalScene;
