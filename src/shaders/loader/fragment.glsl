#include ../utils/circle.glsl;
#include ../utils/snoise3.glsl;
#include ../utils/mapRangeClamped.glsl;

varying vec2 vUv;

uniform float uAlpha;
uniform float uCircleRadius;
uniform vec2 uCirclePos;
uniform float uTime;
uniform vec3 uColor;
uniform float uScreenRatio;

void main() {
  float inputMin = 1.0;  // Minimum radius
  float inputMax = 20.0;  // Maximum radius
  float outputMin = 3.0;  // Desired minimum output
  float outputMax = 1.0;  // Desired maximum output

  // intensity of the noise depending on the circle mask radius
  float intensity = mapRangeClamped(uCircleRadius, inputMin, inputMax, outputMin, outputMax);

  vec2 circlePos = vUv + (uCirclePos) - vec2(1.0);
  circlePos.x = circlePos.x * uScreenRatio;
  float circle = circle(circlePos, uCircleRadius, 2.) * 2.5;

  float offx = vUv.x + sin(vUv.y + uTime * .1);
  float offy = vUv.y - uTime * 0.1 - cos(uTime * .001) * .01;

  float noise = snoise3(vec3(offx, offy, uTime * 0.1) * intensity) - 1.0;

  float finalMask = smoothstep(0.4, 0.5, noise + pow(circle, 2.));

  if(finalMask > 0.5) {
    discard;
  }

  gl_FragColor = vec4(uColor, uAlpha);
}