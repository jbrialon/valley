attribute vec3 barycentric;

varying vec3 vBarycentric;
varying vec2 vUv;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
  vBarycentric = barycentric;
  vUv = uv;
}