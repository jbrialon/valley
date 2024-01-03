#include ../utils/snoise3.glsl;

uniform float uTime;
uniform float uAlpha;

varying vec3 uPosition;
varying vec2 vUv;

void main() {
  float offx = vUv.x + sin(vUv.y + uTime * .1);
  float offy = vUv.y - uTime * 0.1 - cos(uTime * .001) * .01;

  float n = snoise3(vec3(offx, offy, uTime * 0.1) * 5.0) - 1.0;

  vec2 threshold = vec2(0.5 + n * 0.04, 0.5 + n * 0.04);
  float x = abs(uPosition.x);
  float y = abs(uPosition.y);
  float r = step(x, threshold.x) * step(y, threshold.y);

  if(r < 0.1 || uAlpha == 0.0) {
    discard;
  }

  gl_FragColor = vec4(1.0, 1.0, 1.0, uAlpha);
}