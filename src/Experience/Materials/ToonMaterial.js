import * as THREE from "three";

const toonMaterial = (options) => {
  return new THREE.MeshToonMaterial({
    color: options.color,
    gradientMap: options.gradientMap,
    transparent: options.transparent,
    opacity: options.opacity,
  });
};

export default toonMaterial;
