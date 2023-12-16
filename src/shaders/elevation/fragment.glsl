uniform vec3 uTerrainColor;
uniform vec3 uLineColor;
uniform float uContourFrequency;
uniform float uContourWidth;
varying float vElevation;

void main() {
    // Set a threshold for contour lines
    float contourThreshold = uContourFrequency; // Contour frequency

    // Determine if the pixel is part of a contour line
    float isContour = step(mod(vElevation, contourThreshold), uContourWidth); // contour Width

    // Interpolate between colors based on whether it's a contour line or not
    vec3 finalColor = mix(uTerrainColor, uLineColor, isContour);

    // Color the pixel based on whether it's a contour line or not
    gl_FragColor = vec4(finalColor, 1.0);
}
