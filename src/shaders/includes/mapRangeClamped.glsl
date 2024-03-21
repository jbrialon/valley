// THREE.MathUtils.mapLinear but in glsl
float mapRangeClamped(float value, float inMin, float inMax, float outMin, float outMax) {
  // Map the value linearly to the target range
    float mappedValue = (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;

  // Clamp the mapped value to ensure it's within the target range
    return clamp(mappedValue, outMin, outMax);
}
