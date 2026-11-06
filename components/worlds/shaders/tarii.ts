// Tarii: dawn light over a roster in Tarii's still-water palette.
const TARII = /* glsl */ `
// Tarii's "still water" palette: teal and mint shifts, amber on-call, pale leave.
vec3 shiftColor(float h) {
  if (h < .34) return vec3(.19, .35, .376);
  if (h < .62) return vec3(.643, .784, .729);
  if (h < .8) return vec3(.894, .698, .235);
  return vec3(.82, .89, .863);
}

vec3 scene(vec2 uv) {
  float t = uTime;
  vec2 p = rot(.07) * uv + vec2(.06, .02);
  float grain = fbm(uv * 38.) * .5 + vnoise(uv * 900.) * .5;
  vec3 col = vec3(.969, .98, .973) * (.96 + .04 * grain);

  vec2 cell = vec2(.112, .054);
  vec2 g = p / cell;
  vec2 id = floor(g);
  vec2 f = fract(g) - .5;
  vec2 fl = f * cell;
  float gx = min(fract(g.x), 1. - fract(g.x)) * cell.x;
  float gy = min(fract(g.y), 1. - fract(g.y)) * cell.y;
  col = mix(col, vec3(.643, .784, .729), .55 * (1. - smoothstep(0., px * 1.2, min(gx, gy))));

  bool nameCol = id.x == -6.;
  bool header = id.y == 5.;
  if (id.x < -6. || id.y > 5.) {
    col *= .97;
  } else if (header) {
    float w = .022 + .018 * hash11(id.x * 3.1);
    col = mix(col, vec3(.09, .24, .235), fill(sdRoundBox(fl - vec2(-cell.x * .5 + .012 + w, 0.), vec2(w, .006), .003)));
  } else if (nameCol) {
    float w = .02 + .025 * hash11(id.y * 5.7);
    col = mix(col, vec3(.09, .24, .235), fill(sdRoundBox(fl - vec2(-cell.x * .5 + .014 + w, 0.), vec2(w, .0055), .003)));
  } else {
    float h = hash12(id + 11.);
    float e = floor(t / 3.6);
    float ph = fract(t / 3.6);
    vec2 target = vec2(floor(hash11(e * 1.7) * 10.) - 4., floor(hash11(e * 2.9 + 4.) * 8.) - 3.);
    float d = sdRoundBox(fl, cell * .5 - vec2(.009, .0075), .006);
    bool isTarget = id == target;
    if (isTarget) {
      vec3 red = vec3(.82, .22, .2);
      if (ph < .38) {
        float hatch = step(.5, fract((fl.x + fl.y) * 70.));
        col = mix(col, mix(shiftColor(h), red, .5 + .5 * hatch), fill(d));
        col = mix(col, red, stroke(d, .0016));
      } else if (ph < .6) {
        col = mix(col, red, stroke(d, .0014) * (.5 + .5 * sin(t * 18.)));
      } else {
        float grow = smoothstep(.6, .82, ph);
        float m = fill(d) * step(f.x + .5, grow);
        col = mix(col, vec3(.19, .35, .376), m);
        col = mix(col, vec3(.19, .35, .376), stroke(d, .0014));
      }
    } else if (h < .78) {
      vec3 sc = shiftColor(hash12(id + 7.3));
      col = mix(col, sc, fill(d));
      col = mix(col, sc * .8 + .22, fill(d) * stroke(fl.y - cell.y * .5 + .012, .0011));
    }
  }

  float s = dot(uv, normalize(vec2(.8, .55)));
  float slats = smoothstep(.25, .75, .5 + .5 * sin(s * 58. + t * .05));
  float sun = smoothstep(.9, -.5, dot(uv, normalize(vec2(.75, -.6))) + .1);
  float soft = mix(slats, .55, smoothstep(.0, .9, dot(uv, normalize(vec2(.75, -.6))) + .4));
  vec3 shade = vec3(.78, .84, .82);
  vec3 warm = vec3(1.04, 1.03, .97);
  col *= mix(shade, warm, soft * sun);

  for (int k = 0; k < 2; k++) {
    vec2 q = uv * (14. + float(k) * 9.) + vec2(t * .06, -t * .03) * (1. + float(k));
    vec2 qi = floor(q); vec2 qf = fract(q) - .5;
    vec2 o = hash22(qi + float(k) * 3.) - .5;
    float mote = smoothstep(.06, .0, length(qf - o * .7)) * step(.86, hash12(qi + 1.7));
    col += mote * .25 * slats * sun * vec3(1., .9, .7);
  }
  return col;
}
`;

export default TARII;
