import * as THREE from "three";

import overlayVertexShader from "../../shaders/overlay/vertex.glsl";
import overlayFragmentShader from "../../shaders/overlay/fragment.glsl";

const overlayMaterial = (options) => {
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
      uLineColor: { value: new THREE.Color(options.uLineColor || "#000000") },
      uColorOne: { value: new THREE.Color(options.uColorOne || "#ff0000") },
      uColorTwo: { value: new THREE.Color(options.uColorTwo || "#00ff00") },
      uColorThree: { value: new THREE.Color(options.uColorThree || "#0000ff") },
      uMaskTexture: { value: options.uMaskTexture || null },
      uCircleRadius: {
        value: 0.0005,
      },
      uTime: { value: 0 },
      uNoiseIntensity: { value: 140 },
      uCirclePos: {
        value: options.uCirclePos || new THREE.Vector2(0.14, 0.41),
      },
    },
    vertexShader: overlayVertexShader,
    fragmentShader: overlayFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });
};

export default overlayMaterial;
