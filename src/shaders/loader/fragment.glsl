#include ../utils/circle.glsl;
#include ../utils/snoise3.glsl;
#include ../utils/mapRangeClamped.glsl;

varying vec2 vUv;

uniform float uAlpha;
uniform float uCircleRadius;
uniform vec2 uCirclePos;
uniform float uTime;
uniform vec3 uColor;

void main() {
  float inputMin = 1.0;  // Minimum pixel ratio
  float inputMax = 20.0;  // Maximum pixel ratio
  float outputMin = 3.0;  // Desired minimum output
  float outputMax = 0.0;  // Desired maximum output

  float intensity = mapRangeClamped(uCircleRadius, inputMin, inputMax, outputMin, outputMax);

  vec2 circlePos = vUv + (uCirclePos * 0.5) - vec2(0.5);
  // this 1.5 should be adapted by the ratio of the model we apply the material to 
  circlePos.x = circlePos.x * 1.5;
  float c = circle(circlePos, uCircleRadius, 2.) * 2.5;

  float offx = vUv.x + sin(vUv.y + uTime * .1);
  float offy = vUv.y - uTime * 0.1 - cos(uTime * .001) * .01;

  float n = snoise3(vec3(offx, offy, uTime * 0.1) * (intensity) - intensity / 1.5) - 1.0;

  float finalMask = smoothstep(0.4, 0.5, n + pow(c, 2.));

  if(finalMask < 0.5) {
    discard;
  }

  gl_FragColor = vec4(uColor, uAlpha);
}