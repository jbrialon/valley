#include ../includes/circle.glsl;
#include ../includes/snoise3.glsl;
#define PI 3.14159265359

varying vec3 vBarycentric;
varying vec2 vUv;

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

uniform float uAlpha;
uniform float uNoiseIntensity;
uniform float uCircleRadius[10];
uniform vec2 uCirclePos[10];

// This is like
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

  return vec4(outColor.rgb, uAlpha);
}

void main() {
  float finalMask = 0.0;

  float offx = vUv.x + sin(vUv.y + uTime * .1);
  float offy = vUv.y - uTime * 0.1 - cos(uTime * .001) * .01;
  float noise = snoise3(vec3(offx, offy, uTime * 0.1) * uNoiseIntensity) - 1.0;

  for(int i = 0; i < 10; ++i) {
    // I don't now if it's better in terms of performances to draw a 0 radius circle or doing an if > 0.0 
    if(uCircleRadius[i] > 0.0) {
      vec2 circlePos = vUv + (uCirclePos[i]) - vec2(1.0);
      float circle = circle(circlePos, (uCircleRadius[i] / 10000.0), 2.) * 2.5;
      float circleNoise = smoothstep(0.4, 0.5, noise + pow(circle, 2.));

      finalMask += circleNoise;
    }
  }

  if(finalMask < 0.5) {
    discard;
  }

  gl_FragColor = getStyledWireframe(vBarycentric);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
