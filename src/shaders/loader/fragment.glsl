uniform float uAlpha;
uniform vec3 uColor;
uniform sampler2D uMaskTexture;
uniform float uStrength;

varying vec2 vUv;

void main() {
    // Sample the mask texture
    float maskValue = texture2D(uMaskTexture, vUv).r;

    // Use the mask value to discard fragments
    if (maskValue > uStrength) {
        discard;
    }

    // If not discarded, set the fragment color to white
    gl_FragColor = vec4(uColor, 1);
}