varying vec3 vUv;
varying float vElevation;

void main() {
  vElevation = position.y;

  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;
}