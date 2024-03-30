#include ../includes/inverse4.glsl;

uniform vec3 uLightDirection;
uniform sampler2D uTexture;
uniform vec3 uColor;
varying mat4 vModelViewMatrix;
varying vec3 vNormal;

void main() {
  mat4 invMatrix = inverse4(vModelViewMatrix);
  vec3 invLight = normalize(invMatrix * vec4(uLightDirection, 0.0)).xyz;
  float diffuse = clamp(dot(vNormal, invLight), 0.0, 0.8) * 2.0;
  vec4 smpColor = texture2D(uTexture, vec2(diffuse, 0.0));

  gl_FragColor = vec4(uColor, 1.0) * smpColor;

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
