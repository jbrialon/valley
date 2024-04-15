import { ShaderMaterial, Uniform } from "three";

import riverVertexShader from "../../shaders/river/vertex.glsl";
import riverFragmentShader from "../../shaders/river/fragment.glsl";

const toonMaterial = (options) => {
  return new ShaderMaterial({
    uniforms: {
      uTime: new Uniform(0),
      uColor: new Uniform(options.uColor),
      uPerlinTexture: new Uniform(options.uPerlinTexture),
    },
    vertexShader: riverVertexShader,
    fragmentShader: riverFragmentShader,
  });
};

export default toonMaterial;
