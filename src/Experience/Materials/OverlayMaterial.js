import { ShaderMaterial, Uniform, Color } from "three";

import overlayVertexShader from "../../shaders/overlay/vertex.glsl";
import overlayFragmentShader from "../../shaders/overlay/fragment.glsl";

const overlayMaterial = (options) => {
  return new ShaderMaterial({
    uniforms: {
      uTime: new Uniform(0),
      uAlpha: new Uniform(options.uAlpha || 0),
      // Visual
      uStrength: new Uniform(options.uStrength || 0.5),
      uPixelRatio: new Uniform(options.uPixelRatio || 2),
      uContourWidth: new Uniform(options.uContourWidth || 1),
      uColorNumber: new Uniform(options.uColorNumber || 1),
      uContourFrequency: new Uniform(options.uContourFrequency || 1),
      uLineColor: new Uniform(new Color(options.uLineColor || "#000000")),
      uColorOne: new Uniform(new Color(options.uColorOne || "#ff0000")),
      uColorTwo: new Uniform(new Color(options.uColorTwo || "#00ff00")),
      uColorThree: new Uniform(new Color(options.uColorThree || "#0000ff")),
      // Mask
      uNoiseIntensity: new Uniform(options.uNoiseIntensity),
      uCircleRadius: new Uniform(options.uCircleRadius || 3),
      uCirclePos: new Uniform(options.uCirclePos || new Vector2(0.14, 0.41)),
    },
    vertexShader: overlayVertexShader,
    fragmentShader: overlayFragmentShader,
    transparent: false,
  });
};

export default overlayMaterial;
