uniform bool uEdge;
uniform float uLineWidth;
varying vec3 vNormal;
varying mat4 vModelViewMatrix;

void main() {
    vec3 pos = position;
    if(uEdge) {
        pos += normal * uLineWidth;
    }

    vec4 modelViewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    vModelViewMatrix = modelViewMatrix;
    vNormal = normalize(normalMatrix * normal);
}