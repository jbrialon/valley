float circle(in vec2 _st, in float _radius, in float blurriness) {
    vec2 dist = _st;
    return 1. - smoothstep(_radius - (_radius * blurriness), _radius + (_radius * blurriness), dot(dist, dist) * 4.0);
}