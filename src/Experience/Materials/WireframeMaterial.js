import * as THREE from "three";

import vertexShader from "../../shaders/wireframe/vertex.glsl";
import fragmentShader from "../../shaders/wireframe/fragment.glsl";

const terrainMaterial = (options) => {
  return new THREE.ShaderMaterial({
    extensions: {
      derivatives: true,
    },
    uniforms: {
      uTime: { value: 0 },
      // Visual
      uFill: { value: options.uFill },
      uStroke: { value: options.uStroke },
      uThickness: { value: options.uThickness },
      uSqueeze: { value: options.uSqueeze },
      uSqueezeMin: { value: options.uSqueezeMin },
      uSqueezeMax: { value: options.uSqueezeMax },
      // Dash
      uDashEnabled: { value: options.uDashEnabled },
      uDashRepeats: { value: options.uDashRepeats },
      uDashOverlap: { value: options.uDashOverlap },
      uDashLength: { value: options.uDashLength },
      uDashAnimate: { value: options.uDashAnimate },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
};

export default terrainMaterial;
