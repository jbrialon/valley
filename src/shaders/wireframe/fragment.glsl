#define PI 3.14159265359

varying vec3 vBarycentric;

uniform float uTime;
uniform float uThickness;

uniform float uDashRepeats;
uniform float uDashLength;
uniform bool uDashOverlap;
uniform bool uDashEnabled;
uniform bool uDashAnimate;

uniform bool uSqueeze;
uniform float uSqueezeMin;
uniform float uSqueezeMax;

uniform vec3 uStroke;
uniform vec3 uFill;

float aastep(float threshold, float dist) {
  float afwidth = fwidth(dist) * 0.5;
  return smoothstep(threshold - afwidth, threshold + afwidth, dist);
}

// This function returns the fragment color for our styled wireframe effect
// based on the barycentric coordinates for this fragment
vec4 getStyledWireframe(vec3 barycentric) {
  // this will be our signed distance for the wireframe edge
  // float d = computeScreenSpaceWireframe(barycentric, 1.0);
  float d = min(min(barycentric.x, barycentric.y), barycentric.z);

  // for dashed rendering, we can use this to get the 0 .. 1 value of the line length
  float positionAlong = max(barycentric.x, barycentric.y);
  if(barycentric.y < barycentric.x && barycentric.y < barycentric.z) {
    positionAlong = 1.0 - positionAlong;
  }

  // the uThickness of the stroke
  float computeduThickness = uThickness;

  // if we want to shrink the uThickness toward the center of the line segment
  if(uSqueeze) {
    computeduThickness *= mix(uSqueezeMin, uSqueezeMax, (1.0 - sin(positionAlong * PI)));
  }

  // if we should create a dash pattern
  if(uDashEnabled) {
    // here we offset the stroke position depending on whether it
    // should overlap or not
    float offset = 1.0 / uDashRepeats * uDashLength / 2.0;
    if(!uDashOverlap) {
      offset += 1.0 / uDashRepeats / 2.0;
    }

    // if we should animate the dash or not
    if(uDashAnimate) {
      offset += uTime * 0.22;
    }

    // create the repeating dash pattern
    float pattern = fract((positionAlong + offset) * uDashRepeats);
    computeduThickness *= 1.0 - aastep(uDashLength, pattern);
  }

  // compute the anti-aliased stroke edge  
  float edge = 1.0 - aastep(computeduThickness, d);

  // now compute the final color of the mesh
  vec4 outColor = vec4(0.0);
  vec3 mainStroke = mix(uFill, uStroke, edge);
  outColor.a = 1.0;
  outColor.rgb = mainStroke;

  return outColor;
}

void main() {
  gl_FragColor = getStyledWireframe(vBarycentric);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
