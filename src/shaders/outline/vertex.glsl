uniform float uLinewidth;

void main() {
    vec4 pos = modelViewMatrix * vec4( position + normal * 1.0, 1.0 );
    gl_Position = projectionMatrix * pos;
}