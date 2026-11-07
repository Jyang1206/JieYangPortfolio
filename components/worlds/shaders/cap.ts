// Lens cap shown behind the welcome.
const CAP = /* glsl */ `
vec3 scene(vec2 uv) {
  vec3 col = vec3(.022, .022, .026) + fbm(uv * 3. + uTime * .02) * .012;
  vec2 c = vec2(.28, .0);
  float r = length(uv - c);
  float a = atan(uv.y - c.y, uv.x - c.x);
  float rim = .47 + .0035 * sin(a * 220.);
  float cap = fill(r - rim);
  float light = .5 + .5 * dot(normalize(uv - c + 1e-4), normalize(vec2(-.6, .8)));
  vec3 capCol = vec3(.034, .035, .04) + .02 * smoothstep(.3, .46, r) * light;
  capCol += stroke(r - .40, .0015) * .03 * light + stroke(r - .30, .001) * .018;
  capCol += stroke(r - rim, .002) * .09 * light;
  col = mix(col, capCol, cap);
  return col;
}
`;

export default CAP;
