uniform float uTime;
uniform vec3 uColor;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main() {
  // Animate
  vec2 waterUv = vUv;
  waterUv.y -= uTime * 0.3;

  // Water
  float water = texture(uPerlinTexture, waterUv).r;
  water = step(0.4, water);

  // Curvy, varying edges
  float edgeWidth = 0.05 + 0.03 * sin(uTime * 2.5 + vUv.y * 6.28); // non-uniform edge

  float leftEdge = step(edgeWidth, vUv.x);  // Dynamic edge on the left
  float rightEdge = step(vUv.x, 1.0 - edgeWidth); // Dynamic edge on the right

  // Combine edges
  float edge = 1.0 - leftEdge * rightEdge; // 1.0 on edges, 0.0 elsewhere

  // Calculate base color
  vec3 baseColor = mix(vec3(1.0), uColor, water); // Mix between white and uColor based on Perlin noise

  // Apply edges (keep edges white regardless of Perlin noise)
  vec3 color = mix(baseColor, vec3(1.0), edge); // Mix base color with white based on the edge

  gl_FragColor = vec4(color, 1.0); // Output color

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
