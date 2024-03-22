import { ShaderMaterial, Uniform, Vector3, Vector4, FrontSide } from "three";

import toonVertexShader from "../../shaders/toon/vertex.glsl";
import toonFragmentShader from "../../shaders/toon/fragment.glsl";

// https://wgld.org/d/webgl/w048.html implementation
const toonMaterial = (options) => {
  return new ShaderMaterial({
    uniforms: {
      uLightDirection: new Uniform(
        options.uLightDirection || new Vector3(-2, 3.5, 5)
      ),
      uEdge: new Uniform(options.uEdge),
      uLineWidth: new Uniform(options.uLineWidth || 0.004),
      uEdgeColor: new Uniform(
        options.uEdgeColor || new Vector4(0.0, 0.0, 0.0, 0.0)
      ),
      uColor: new Uniform(options.uColor),
      uTexture: new Uniform(options.uTexture),
    },
    vertexShader: toonVertexShader,
    fragmentShader: toonFragmentShader,
    side: options.side || FrontSide,
  });
};

export default toonMaterial;
