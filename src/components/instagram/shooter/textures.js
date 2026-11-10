import * as THREE from "three";

import { BLOCK_ASPECT } from "./level";

// Centre-crop each image to the block face shape (BLOCK_ASPECT) so it isn't stretched
export function prepareTexture(texture) {
  const { width, height } = texture.image;
  const imageAspect = width / height;
  if (imageAspect > BLOCK_ASPECT) {
    // image is wider than the face: trim the sides
    const visible = BLOCK_ASPECT / imageAspect;
    texture.repeat.set(visible, 1);
    texture.offset.set((1 - visible) / 2, 0);
  } else if (imageAspect < BLOCK_ASPECT) {
    // image is taller than the face: trim top and bottom
    const visible = imageAspect / BLOCK_ASPECT;
    texture.repeat.set(1, visible);
    texture.offset.set(0, (1 - visible) / 2);
  }
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
