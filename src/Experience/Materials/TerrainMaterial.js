import { ShaderMaterial, Uniform, Color, DoubleSide } from "three";

import terrainVertexShader from "../../shaders/terrain/vertex.glsl";
import terrainFragmentShader from "../../shaders/terrain/fragment.glsl";

const terrainMaterial = (options) => {
  return new ShaderMaterial({
    uniforms: {
      uAlpha: new Uniform(options.uAlpha || 0),
      uStrength: new Uniform(options.uStrength || 0.5),
      uPixelRatio: new Uniform(options.uPixelRatio || 2),
      uContourWidth: new Uniform(options.uContourWidth || 1),
      uColorNumber: new Uniform(options.uColorNumber || 1),
      uContourFrequency: new Uniform(options.uContourFrequency || 1),
      uLineColor: new Uniform(new Color(options.uLineColor || "#000000")),
      uColorOne: new Uniform(new Color(options.uColorOne || "#ff0000")),
      uColorTwo: new Uniform(new Color(options.uColorTwo || "#00ff00")),
      uColorThree: new Uniform(new Color(options.uColorThree || "#0000ff")),
    },
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    transparent: false,
    side: DoubleSide,
  });
};

export default terrainMaterial;
