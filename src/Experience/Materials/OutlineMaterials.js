import * as THREE from "three";

import outlineVertexShader from "../../shaders/outline/vertex.glsl";
import outlineFragmentShader from "../../shaders/outline/fragment.glsl";

const outlineMaterial = (options) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLinewidth: { value: options.uLinewidth },
      uColor: { value: new THREE.Color(options.uColor) || "#ff0000" },
    },
    vertexShader: outlineVertexShader,
    fragmentShader: outlineFragmentShader,
  });
};

export default outlineMaterial;
