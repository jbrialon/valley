import * as THREE from "three";

const toonMaterial = (options) => {
  return new THREE.MeshToonMaterial({
    color: options.color,
    gradientMap: options.gradientMap,
  });
};

export default toonMaterial;
