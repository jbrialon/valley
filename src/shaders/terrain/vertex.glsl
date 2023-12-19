varying vec2 vUv;
varying vec3 vVertex;

void main() {
    vUv = uv;
    
    // This is a happy accident because i'm an idiot
    vec4 vertex = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vVertex = vec3(vertex.x * 3.0, vertex.y * 6.0, vertex.z * 3.0);
    gl_Position = vertex;

    // This should be like this
    // vVertex = vec3(position.x * 3.0, position.y * 6.0, position.z * 3.0);
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
}