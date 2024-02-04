#include ../utils/circle.glsl;
#include ../utils/snoise3.glsl;
#include ../utils/mapRangeClamped.glsl;

uniform float uAlpha;
uniform float uStrength;
uniform float uContourWidth;
uniform float uColorNumber;
uniform float uContourFrequency;
uniform vec3 uLineColor;
uniform vec3 uColorOne;
uniform vec3 uColorTwo;
uniform vec3 uColorThree;
uniform float uPixelRatio;

varying vec2 vUv;
varying vec3 vVertex;

uniform float uNoiseIntensity;

uniform float uCircleRadius;
uniform vec2 uCirclePos;

uniform float uTime;

void main() {
  float inputMin = 1.0;  // Minimum pixel ratio
  float inputMax = 2.0;  // Maximum pixel ratio
  float outputMin = 0.65;  // Desired minimum output
  float outputMax = uContourWidth;  // Desired maximum output

  float contourWidth = mapRangeClamped(uPixelRatio, inputMin, inputMax, outputMin, outputMax);

  vec2 circlePos = vUv + (uCirclePos) - vec2(1.0);
    // this 1.5 should be adapted by the ratio of the model we apply the material to 
    // circlePos.x = circlePos.x * 1.5;
  float c = circle(circlePos, (uCircleRadius / 10000.0), 2.) * 2.5;

  float offx = vUv.x + sin(vUv.y + uTime * .1);
  float offy = vUv.y - uTime * 0.1 - cos(uTime * .001) * .01;

  float n = snoise3(vec3(offx, offy, uTime * 0.1) * uNoiseIntensity) - 1.0;

  float finalMask = smoothstep(0.4, 0.5, n + pow(c, 2.));

  if(finalMask < 0.5) {
    discard;
  }

  // Pick a coordinate to visualize in a grid
  // float coord = length(vUv.xy) * 400.0; 
  float coord = length(vVertex.xz) * uContourFrequency;

  // Compute anti-aliased world-space grid lines
  float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);

  // Check if it's a grid line
  bool isGridLine = contourWidth - min(line, contourWidth) > 0.0;

  // Adjust color based on whether it's a grid line or not
  vec3 color;
  if(isGridLine) {
    color = uLineColor;
  } else {
    float gridCellColor = mod(coord, uColorNumber);
    // Use step function to determine the color based on the value of gridCellColor
    color = mix(uColorOne, mix(uColorOne, mix(uColorTwo, mix(uColorThree, vec3(0.0), step(3.0, gridCellColor)), step(2.0, gridCellColor)), step(1.0, gridCellColor)), step(0.0, gridCellColor));
  }

  gl_FragColor = vec4(color, uAlpha);
}