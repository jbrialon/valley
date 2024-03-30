varying vec3 vNormal;
varying mat4 vModelViewMatrix;

void main() {
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    vModelViewMatrix = modelViewMatrix;
    vNormal = normalize(normalMatrix * normal);
}
