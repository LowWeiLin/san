import React, { useEffect, useMemo, useRef } from "react";

import * as THREE from "three";
import { Billboard, Text, Box } from "@react-three/drei";
import { Block } from "./types";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";

const randn_bm = (): number => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) {
    return randn_bm();
  } // resample between 0 and 1
  return num;
};

// re-use for instance computations
const tempObject3D = new THREE.Object3D();
const tempVec = new THREE.Vector3();

const size = 0.75;
const sampleRate = 10000;

type BlocksProps = {
  blocks: Block[];
};

const useMousePointInteraction = (blocks: Block[]) => {
  // track mousedown position to skip click handlers on drags
  const mouseDownRef = useRef([0, 0]);
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    mouseDownRef.current[0] = e.clientX;
    mouseDownRef.current[1] = e.clientY;
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    const { instanceId, clientX, clientY } = event;
    const downDistance = Math.sqrt(
      (mouseDownRef.current[0] - clientX) ** 2 +
        (mouseDownRef.current[1] - clientY) ** 2
    );

    // skip click if we dragged more than 5px distance
    if (downDistance > 5) {
      event.stopPropagation();
      return;
    }

    console.log("got point =", instanceId);
    // Reset heights
    blocks.forEach((block) => {
      block.height = 0.1;
    });

    event.stopPropagation();
  };

  return { handlePointerDown, handleClick };
};

const Blocks = ({ blocks }: BlocksProps) => {
  const billboardRef = useRef<THREE.Group>(null);
  const blocksMeshRef = useRef<THREE.InstancedMesh>(null);
  const numPoints = blocks.length;
  const pendingSamples = useRef(0);
  const lastHoveredInstanceId = useRef<number>();

  const { handleClick, handlePointerDown } = useMousePointInteraction(blocks);

  useFrame((state, delta) => {
    if (!blocksMeshRef.current || numPoints === 0) {
      return;
    }

    // Increase height for random samples
    pendingSamples.current += delta * sampleRate;
    while (pendingSamples.current >= 1) {
      const x = Math.round(randn_bm() * 100);
      const y = Math.round(randn_bm() * 100);
      const index = x + y * 100;
      if (blocks[index] === undefined) {
        return;
      }
      blocks[index].height += 1.5;
      pendingSamples.current -= 1;
    }

    let maxHeight = 1;
    for (let i = 0; i < numPoints; i += 1) {
      const { x, z, height, targetHeight } = blocks[i];

      // Calculate height changes
      const leftDist = Math.abs(targetHeight - height);
      const dir = targetHeight - height > 0 ? 1 : -1;
      const heightDelta = 0.95 * leftDist * delta;
      const newHeight = height + dir * Math.min(heightDelta, leftDist);
      blocks[i].height = newHeight;

      maxHeight = Math.max(maxHeight, newHeight);

      // Transform
      tempObject3D.position.set(x, (size * newHeight) / 2, z);
      tempObject3D.scale.x = size;
      tempObject3D.scale.y = size * newHeight;
      tempObject3D.scale.z = size;
      tempObject3D.updateMatrixWorld();
      blocksMeshRef.current.setMatrixAt(i, tempObject3D.matrixWorld);
    }

    blocksMeshRef.current.count = numPoints;
    blocksMeshRef.current.instanceMatrix.needsUpdate = true;

    // Move billboard
    tempVec.set(0.5, maxHeight * 0.8 + 0.05, 0.5);
    billboardRef.current?.position.lerp(tempVec, 0.02);
  });

  return (
    <>
      <group ref={billboardRef}>
        <Billboard follow position={[0.5, 1.05, 0.5]}>
          <Text
            fontSize={1}
            outlineWidth={"5%"}
            outlineColor="#000000"
            outlineOpacity={1}
          >
            Hello World!
          </Text>
        </Billboard>
      </group>

      <instancedMesh
        ref={blocksMeshRef}
        args={[undefined, undefined, numPoints]}
        frustumCulled={false}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial />
      </instancedMesh>
    </>
  );
};

export default Blocks;
