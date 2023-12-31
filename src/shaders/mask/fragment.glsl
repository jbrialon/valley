varying vec2 vUv;
uniform sampler2D uMaskTexture;
uniform float uStrength;

void main() {
    // Sample the mask texture
  float maskValue = texture2D(uMaskTexture, vUv).r;

    // Use the mask value to discard fragments
  if(maskValue > uStrength) {
    discard;
  }

    // If not discarded, set the fragment color to white
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1);
}