uniform vec3 uColor;
varying vec3 vNormal;

void main() {
    float intensity = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
    vec3 finalColor = mix(uColor, vec3(1.0), smoothstep(0.8, 1.0, intensity));

    gl_FragColor = vec4(finalColor, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
