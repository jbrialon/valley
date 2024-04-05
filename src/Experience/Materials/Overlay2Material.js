import { ShaderMaterial, Uniform, Color } from "three";

import vertexShader from "../../shaders/overlay2/vertex.glsl";
import fragmentShader from "../../shaders/overlay2/fragment.glsl";

const overlay2Material = (options) => {
  return new ShaderMaterial({
    extensions: {
      derivatives: true,
    },
    uniforms: {
      uTime: new Uniform(options.uTime),
      uAlpha: new Uniform(options.uAlpha || 0),
      // Visual
      uFill: new Uniform(new Color(options.uFill)),
      uStroke: new Uniform(new Color(options.uStroke)),
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
      // Mask
      uNoiseIntensity: new Uniform(options.uNoiseIntensity),
      uCircleRadius: new Uniform(options.uCircleRadius),
      uCirclePos: new Uniform(options.uCirclePos),
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
};

export default overlay2Material;
