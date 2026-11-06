// Battlecode 2026 (Cambridge Battlecode): the table the replay is played on.
//
// The match itself is drawn by BattlecodeReplayOverlay (components/worlds/battlecode) from a real decoded replay,
// on a transparent canvas over this shader. This shader is the room around the board: a dark floor with a pool of
// grass-green light where the board stands, a faint tilted tile grid that fades out from it, and slow drifting
// light. It is also what shows during the crossing and when the overlay is not drawn, so it reads on its own as
// the setting without pretending to be a match.
//
// Layout: the light pool is centred at 66% of the width on wide screens (a paper card covers the left of the
// screen on desktop) and at the centre on narrow ones. Keep in step with boardRect() in
// components/worlds/battlecode/draw.ts.
//
// uParams: unused.
const battlecode = /* glsl */ `
vec3 scene(vec2 uv) {
  float aspect = uRes.x / uRes.y;
  float wide = smoothstep(1.0, 1.35, aspect);
  vec2 c = vec2(mix(0., aspect * .16, wide), .0);
  vec2 q = uv - c;

  // Floor: near-black with a green cast, darker away from the board.
  vec3 col = vec3(.035, .043, .036);
  vec2 qs = q * vec2(1.05, 1.35);
  float pool = exp(-dot(qs, qs) * 4.2);
  vec3 grass = mix(vec3(.16, .23, .09), vec3(.24, .31, .12), fbm(uv * 3.2 + vec2(uTime * .015, 0.)));
  col = mix(col, grass * .55, pool * .8);

  // A tilted tile grid, as if the board extended under the dark: rows shrink towards the top.
  float persp = 1. / (1.25 - q.y * .55);
  vec2 g = vec2(q.x * persp, q.y * persp * 1.15) * 26.;
  vec2 f = abs(fract(g) - .5);
  float line = smoothstep(.5 - px * 30. * persp, .5, max(f.x, f.y));
  col += vec3(.09, .12, .06) * line * pool * .6;

  // Drifting cloud light, as on the official visualiser's grass.
  float cloud = fbm(uv * 1.6 + vec2(uTime * .02, -uTime * .012));
  col *= .88 + .24 * cloud;

  // Faint team glows towards the two spawn corners: OneTap blue near (bottom left), the opponent red far (top right).
  vec2 a = q - vec2(-.42, -.3), b = q - vec2(.36, .32);
  col += vec3(.12, .3, .7) * .06 * exp(-dot(a, a) * 9.);
  col += vec3(.75, .2, .18) * .05 * exp(-dot(b, b) * 9.);
  return col;
}
`;
export default battlecode;
