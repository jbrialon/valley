#include ../utils/snoise4.glsl;
#define PI 3.14159265359

varying vec3 vBarycentric;
varying float vEven;
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform float uThickness;
uniform float uSeconduThickness;

uniform float uDashRepeats;
uniform float uDashLength;
uniform bool uDashOverlap;
uniform bool uDashEnabled;
uniform bool uDashAnimate;

uniform bool uSeeThrough;
uniform bool uInsideAltColor;
uniform bool uDualStroke;
uniform bool uNoiseA;
uniform bool uNoiseB;

uniform bool uSqueeze;
uniform float uSqueezeMin;
uniform float uSqueezeMax;

uniform vec3 uStroke;
uniform vec3 uFill;

// This is like
float aastep(float threshold, float dist) {
  float afwidth = fwidth(dist) * 0.5;
  return smoothstep(threshold - afwidth, threshold + afwidth, dist);
}

// This function is not currently used, but it can be useful
// to achieve a fixed width wireframe regardless of z-depth
float computeScreenSpaceWireframe(vec3 barycentric, float lineWidth) {
  vec3 dist = fwidth(barycentric);
  vec3 smoothed = smoothstep(dist * ((lineWidth * 0.5) - 0.5), dist * ((lineWidth * 0.5) + 0.5), barycentric);
  return 1.0 - min(min(smoothed.x, smoothed.y), smoothed.z);
}

// This function returns the fragment color for our styled wireframe effect
// based on the barycentric coordinates for this fragment
vec4 getStyledWireframe(vec3 barycentric) {
  // this will be our signed distance for the wireframe edge
  // float d = computeScreenSpaceWireframe(barycentric, 1.0);
  float d = min(min(barycentric.x, barycentric.y), barycentric.z);

  // we can modify the distance field to create interesting effects & masking
  float noiseOff = 0.0;
  if(uNoiseA)
    noiseOff += snoise(vec4(vPosition.xyz * 1.0, uTime * 0.35)) * 0.15;
  if(uNoiseB)
    noiseOff += snoise(vec4(vPosition.xyz * 80.0, uTime * 0.5)) * 0.12;
  d += noiseOff;

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
  if(uSeeThrough) {
    outColor = vec4(uStroke, edge);
    if(uInsideAltColor && !gl_FrontFacing) {
      outColor.rgb = uFill;
    }
  } else {
    vec3 mainStroke = mix(uFill, uStroke, edge);
    outColor.a = 1.0;
    if(uDualStroke) {
      float inner = 1.0 - aastep(uSeconduThickness, d);
      vec3 wireColor = mix(uFill, uStroke, abs(inner - edge));
      outColor.rgb = wireColor;
    } else {
      outColor.rgb = mainStroke;
    }
  }

  return outColor;
}

void main() {
  gl_FragColor = getStyledWireframe(vBarycentric);
}