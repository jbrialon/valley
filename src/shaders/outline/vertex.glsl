uniform float uLinewidth;
varying vec3 vNormal;

void main() {
    vNormal = normal;
    vec3 newPosition = position + normal * uLinewidth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}


