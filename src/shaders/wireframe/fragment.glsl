uniform float uAlpha;
uniform float uContourWidth;
uniform float uColorNumber;
uniform float uContourFrequency;
uniform vec3 uLineColor;
uniform vec3 uColorOne;
uniform vec3 uColorTwo;
uniform vec3 uColorThree;

varying vec2 vUv;
varying vec3 vVertex;

void main() {
  // Pick a coordinate to visualize in a grid
  // float coord = length(vUv) * 200.0; 
  float coord = length(vVertex.xz) * uContourFrequency;

  // Compute anti-aliased world-space grid lines
  float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);

  // Check if it's a grid line
  bool isGridLine = uContourWidth - min(line, uContourWidth) > 0.0;

  // Adjust color based on whether it's a grid line or not
  vec3 color;
  if (isGridLine) {
    color = uLineColor;
  } else {
    float gridCellColor = mod(coord, uColorNumber);
    // Use step function to determine the color based on the value of gridCellColor
    color = mix(uColorOne, mix(uColorOne, mix(uColorTwo, mix(uColorThree, vec3(0.0), step(3.0, gridCellColor)), step(2.0, gridCellColor)), step(1.0, gridCellColor)), step(0.0, gridCellColor));
  }

  gl_FragColor = vec4(color, uAlpha);
}