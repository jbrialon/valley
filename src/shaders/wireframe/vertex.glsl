varying vec2 vUv;
varying vec3 vVertex;

void main() {
    vUv = uv;
    vec4 vertex = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vVertex = vec3(vertex.x * 3.0, vertex.y * 6.0, vertex.z * 3.0);
    gl_Position = vertex;
}