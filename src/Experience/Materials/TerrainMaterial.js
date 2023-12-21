import * as THREE from "three";

import terrainVertexShader from "../../shaders/terrain/vertex.glsl";
import terrainFragmentShader from "../../shaders/terrain/fragment.glsl";

const terrainMaterial = (options) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uAlpha: { value: options.uAlpha || 0 },
      uStrength: {
        value: options.uStrength || 0.5,
      },
      uPixelRatio: { value: options.uPixelRatio || 2 },
      uContourWidth: { value: options.uContourWidth || 1 },
      uColorNumber: { value: options.uColorNumber || 1 },
      uContourFrequency: { value: options.uContourFrequency || 1 },
      uTerrainColor: {
        value: new THREE.Color(options.uTerrainColor || "#ffffff"),
      },
      uLineColor: { value: new THREE.Color(options.uLineColor || "#000000") },
      uColorOne: { value: new THREE.Color(options.uColorOne || "#ff0000") },
      uColorTwo: { value: new THREE.Color(options.uColorTwo || "#00ff00") },
      uColorThree: { value: new THREE.Color(options.uColorThree || "#0000ff") },
      uMaskTexture: { value: options.uMaskTexture || null },
    },
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    transparent: true,
  });
};

export default terrainMaterial;
