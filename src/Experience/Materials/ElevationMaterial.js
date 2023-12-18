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

// for later debugs :D
// this.debugFolder
//   .addColor(this.options, "uColorOne")
//   .name("Terrain Color")
//   .onChange(() => {
//     this.elevationMaterial.uniforms.uTerrainColor.value.set(
//       this.options.uColorOne
//     );
//   });
// this.debugFolder
//   .addColor(this.options, "uLineColor")
//   .name("Line Color")
//   .onChange(() => {
//     this.elevationMaterial.uniforms.uLineColor.value.set(
//       this.options.uLineColor
//     );
//   });
// this.debugFolder
//   .add(this.elevationMaterial.uniforms.uContourFrequency, "value")
//   .min(0)
//   .max(1)
//   .step(0.001)
//   .name("Contour Frequency");
// this.debugFolder
//   .add(this.elevationMaterial.uniforms.uContourWidth, "value")
//   .min(0)
//   .max(0.05)
//   .step(0.001)
//   .name("Contour Width");
