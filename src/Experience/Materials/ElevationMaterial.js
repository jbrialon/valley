import * as THREE from "three";

import elevationVertexShader from "../../shaders/elevation/vertex.glsl";
import elevationFragmentShader from "../../shaders/elevation/fragment.glsl";

const elevationMaterial = (options) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uAlpha: { value: 1 },
      uTerrainColor: { value: new THREE.Color(options.uColorOne) },
      uLineColor: { value: new THREE.Color(options.uLineColor) },
      uContourFrequency: { value: 0.05 },
      uContourWidth: { value: 0.005 },
    },
    vertexShader: elevationVertexShader,
    fragmentShader: elevationFragmentShader,
  });
};

export default elevationMaterial;
