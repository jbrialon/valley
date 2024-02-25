#include ../utils/circle.glsl;
#include ../utils/snoise3.glsl;

varying vec2 vUv;

uniform float uAlpha;
uniform float uCircleRadius;
uniform vec2 uCirclePos;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uBorderColor;
uniform float uBorderWidth;
uniform float uScreenRatio;

void main() {

  vec2 circlePos = vUv + (uCirclePos) - vec2(1.0);
  circlePos.x = circlePos.x * uScreenRatio;
  float circle = circle(circlePos, uCircleRadius, 2.) * 2.5;

  float offx = vUv.x + sin(vUv.y + uTime * .1);
  float offy = vUv.y - uTime * 0.1 - cos(uTime * .001) * .01;

  float noise = snoise3(vec3(offx, offy, uTime * 0.1) * 1.5) - 1.0;

  float finalMask = smoothstep(0.4, 0.5, noise + pow(circle, 2.));

  // Determine if we are within the border range
  float borderRange = smoothstep(uCircleRadius - (uCircleRadius * uBorderWidth), uCircleRadius + (uCircleRadius * uBorderWidth), dot(circlePos, circlePos) * 4.0);

  // Mix the border color and the main color based on border range
  vec3 finalColor = mix(uColor, uBorderColor, 1.0 - borderRange);

  if(finalMask > 0.5) {
    discard;
  }

  gl_FragColor = vec4(finalColor, uAlpha);
}
