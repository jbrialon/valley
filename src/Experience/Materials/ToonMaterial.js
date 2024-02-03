import * as THREE from "three";

import toonVertexShader from "../../shaders/toon/vertex.glsl";
import toonFragmentShader from "../../shaders/toon/fragment.glsl";

// https://wgld.org/d/webgl/w048.html implementation
const toonMaterial = (options) => {
  return new THREE.ShaderMaterial({
    vertexShader: toonVertexShader,
    fragmentShader: toonFragmentShader,
    uniforms: {
      uLightDirection: {
        value: options.uLightDirection || new THREE.Vector3(-2, 3.5, 5),
      },
      uEdge: { value: options.uEdge },
      uLineWidth: { value: options.uLineWidth || 0.004 },
      uEdgeColor: {
        value: options.uEdgeColor || new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
      },
      uColor: {
        value: options.uColor,
      },
      uTexture: { value: options.uTexture },
    },
    side: options.side || THREE.FrontSide,
  });
};

export default toonMaterial;
