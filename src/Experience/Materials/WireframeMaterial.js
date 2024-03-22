import { ShaderMaterial, Uniform } from "three";

import vertexShader from "../../shaders/wireframe/vertex.glsl";
import fragmentShader from "../../shaders/wireframe/fragment.glsl";

const terrainMaterial = (options) => {
  return new ShaderMaterial({
    extensions: {
      derivatives: true,
    },
    uniforms: {
      uTime: { value: 0 },
      // Visual
      uFill: new Uniform(options.uFill),
      uStroke: new Uniform(options.uStroke),
      uThickness: new Uniform(options.uThickness),
      uSqueeze: new Uniform(options.uSqueeze),
      uSqueezeMin: new Uniform(options.uSqueezeMin),
      uSqueezeMax: new Uniform(options.uSqueezeMax),
      // Dash
      uDashEnabled: new Uniform(options.uDashEnabled),
      uDashRepeats: new Uniform(options.uDashRepeats),
      uDashOverlap: new Uniform(options.uDashOverlap),
      uDashLength: new Uniform(options.uDashLength),
      uDashAnimate: new Uniform(options.uDashAnimate),
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
};

export default terrainMaterial;
