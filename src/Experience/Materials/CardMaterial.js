import * as THREE from "three";

import cardVertexShader from "../../shaders/card/vertex.glsl";
import cardFragmentShader from "../../shaders/card/fragment.glsl";

const cardMaterial = (options) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uAlpha: { value: options.uAlpha },
      uTime: { value: options.uTime },
    },
    vertexShader: cardVertexShader,
    fragmentShader: cardFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });
};

export default cardMaterial;
