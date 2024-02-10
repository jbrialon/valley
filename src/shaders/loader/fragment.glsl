#include ../utils/circle.glsl;
#include ../utils/snoise3.glsl;

varying vec2 vUv;

uniform float uAlpha;
uniform float uCircleRadius;
uniform vec2 uCirclePos;
uniform float uTime;
uniform vec3 uColor;
uniform float uScreenRatio;

void main() {

  vec2 circlePos = vUv + (uCirclePos) - vec2(1.0);
  circlePos.x = circlePos.x * uScreenRatio;
  float circle = circle(circlePos, uCircleRadius, 2.) * 2.5;

  float offx = vUv.x + sin(vUv.y + uTime * .1);
  float offy = vUv.y - uTime * 0.1 - cos(uTime * .001) * .01;

  float noise = snoise3(vec3(offx, offy, uTime * 0.1) * 1.5) - 1.0;

  float finalMask = smoothstep(0.4, 0.5, noise + pow(circle, 2.));

  if(finalMask > 0.5) {
    discard;
  }

  gl_FragColor = vec4(uColor, uAlpha);
}