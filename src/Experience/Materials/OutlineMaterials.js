import { ShaderMaterial, Uniform, Color } from "three";

import outlineVertexShader from "../../shaders/outline/vertex.glsl";
import outlineFragmentShader from "../../shaders/outline/fragment.glsl";

const outlineMaterial = (options) => {
  return new ShaderMaterial({
    uniforms: {
      uLinewidth: new Uniform(options.uLinewidth),
      uColor: new Uniform(new Color(options.uColor) || "#ff0000"),
    },
    vertexShader: outlineVertexShader,
    fragmentShader: outlineFragmentShader,
  });
};

export default outlineMaterial;
