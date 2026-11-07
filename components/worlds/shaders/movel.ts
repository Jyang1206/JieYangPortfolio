// Movel AI: warehouse floor with AMRs on routes.
const MOVEL = /* glsl */ `
vec3 scene(vec2 uv) {
  float t = uTime;
  vec2 w = uv * 2.05 + vec2(t * .012, 0.);
  float n = fbm(w * 3.) * .6 + fbm(w * 19.) * .4;
  vec3 col = vec3(.46, .48, .475) * (.84 + .26 * n);
  vec2 lp = vec2(mod(w.x, .7) - .35, mod(w.y, .62) - .31);
  vec2 lq = lp / vec2(.2, .028);
  col += exp(-dot(lq, lq)) * .12;

  float aisle = .62;
  float k = floor(w.y / aisle);
  float ay = mod(w.y, aisle) - aisle * .5;
  float aay = abs(ay);

  // shadow of racking on the floor
  col *= 1. - .35 * smoothstep(.19, .23, aay);
  if (aay > .222) {
    vec2 r = vec2(w.x, aay - .31);
    float bay = floor(w.x / .27);
    vec2 bf = vec2(mod(w.x, .27) - .135, r.y);
    vec3 rack = vec3(.13, .14, .16);
    float hb = hash12(vec2(bay, k + step(0., ay)));
    if (hb < .85) {
      float pal = sdRoundBox(bf, vec2(.118, .072), .006);
      vec3 box = mix(vec3(.58, .46, .31), vec3(.70, .58, .40), hash12(vec2(bay * 3., k)));
      box *= .9 + .1 * vnoise(bf * 90.);
      rack = mix(rack, box, fill(pal));
      rack = mix(rack, box * .8, stroke(bf.x, .0012) * fill(pal));
    }
    rack = mix(rack, vec3(.86, .38, .14), stroke(aay - .228, .004));
    rack = mix(rack, vec3(.15, .28, .58), fill(sdBox(vec2(mod(w.x + .135, .27) - .135, aay - .232), vec2(.012, .012))));
    col = rack;
  } else {
    col = mix(col, vec3(.95, .76, .16), stroke(aay - .19, .0035));
    float cross = mod(w.x + 1.3, 3.1);
    if (cross < .09) {
      float hatch = step(.5, fract((w.x + w.y) * 22.));
      col = mix(col, mix(col * .5, vec3(.95, .76, .16), hatch), .6);
    }
    float dash = step(.5, fract(w.x * 6.));
    col = mix(col, vec3(.86, .87, .85), stroke(ay, .0016) * dash * .55);

    for (int lane = -1; lane <= 1; lane += 2) {
      float dir = float(lane);
      float ly = ay - dir * .085;
      float sp = .045 + .02 * hash11(k * 1.3 + dir);
      float rx = mod(w.x - t * sp * dir - hash11(k + dir * 7.) * 2.4, 2.4) - 1.2;
      float ahead = rx * dir;
      if (ahead < -.07 && ahead > -.6) {
        float dsh = step(.5, fract(ahead * 30.));
        float a = smoothstep(-.6, -.1, ahead);
        col = mix(col, vec3(.25, .78, 1.), stroke(ly, .0022) * dsh * a);
      }
      vec2 rp = vec2(rx, ly);
      float sh = sdRoundBox(rp - vec2(.012, -.016), vec2(.064, .046), .02);
      col *= 1. - .45 * smoothstep(.02, -.01, sh);
      float body = sdRoundBox(rp, vec2(.062, .044), .018);
      vec3 bc = vec3(.90, .91, .92) * (.88 + .12 * smoothstep(.04, -.04, rp.y));
      col = mix(col, bc, fill(body));
      col = mix(col, vec3(.55, .57, .6), fill(body) * stroke(body + .008, .0012));
      col = mix(col, vec3(.1, .11, .12), fill(length(rp - vec2(-dir * .032, 0.)) - .014));
      float led = fill(length(rp - vec2(dir * .045, .028)) - .005);
      col = mix(col, vec3(.3, 1., .5), led * (.6 + .4 * sin(t * 4. + k)));
    }
  }
  col *= vec3(.96, 1., 1.03);

  // Dispatch overlay, in screen space. uParams.x = destination (1..4), uParams.y = progress 0..1.
  // With no page controls (x == 0) it loops on its own: a trip to each destination in turn, 7 s per trip.
  vec4 P = uParams;
  if (P.x < .5) {
    float trip = floor(t / 7.);
    float ph = fract(t / 7.);
    P.x = 1. + mod(trip, 4.);
    P.y = smoothstep(.08, .78, ph);
  }
  vec2 stations[5] = vec2[5](vec2(.18, -.36), vec2(.74, .3), vec2(.52, -.06), vec2(.8, -.28), vec2(.3, .32));
  vec3 cyan = vec3(.25, .78, 1.);
  for (int i = 0; i < 5; i++) {
    float sel = (i == 0 || float(i) == P.x) ? 1. : 0.;
    float ring = abs(length(uv - stations[i]) - .034) - .003;
    col = mix(col, cyan, fill(ring) * (.45 + .55 * sel));
    col = mix(col, mix(vec3(.08), cyan, sel), fill(sdBox(uv - stations[i], vec2(.012))));
  }
  int dest = int(P.x + .5);
  if (dest > 0 && dest < 5) {
    vec2 a = stations[0];
    vec2 c = stations[dest];
    vec2 b = vec2(a.x, c.y);
    float l1 = abs(c.y - a.y), l2 = abs(c.x - a.x);
    float d = min(sdSeg(uv, a, b), sdSeg(uv, b, c));
    float along = uv.y == a.y ? 0. : 1.;
    float dash = step(.5, fract((abs(uv.x - a.x) + abs(uv.y - a.y)) * 60. - uTime * 1.5));
    col = mix(col, cyan, stroke(d, .0022) * dash * .9);
    // The dispatched AMR: up the first leg, then across.
    float s = clamp(P.y, 0., 1.) * (l1 + l2);
    vec2 pos = s < l1 ? mix(a, b, s / max(l1, 1e-4)) : mix(b, c, (s - l1) / max(l2, 1e-4));
    vec2 dir = s < l1 ? vec2(0., sign(c.y - a.y)) : vec2(sign(c.x - a.x), 0.);
    vec2 q = uv - pos;
    q = vec2(dot(q, vec2(dir.y, -dir.x)), dot(q, dir));
    float body = sdRoundBox(q, vec2(.034, .046), .014);
    col *= 1. - .45 * smoothstep(.03, -.005, sdRoundBox(q - vec2(.008, -.01), vec2(.036, .048), .016));
    col = mix(col, vec3(.93, .95, .97), fill(body));
    col = mix(col, cyan, fill(body) * stroke(body + .006, .0025));
    col = mix(col, vec3(.1), fill(length(q - vec2(0., .022)) - .01));
    col += cyan * .25 * exp(-dot(uv - pos, uv - pos) * 400.) * (.6 + .4 * sin(uTime * 6.));
    along += 0.;
  }
  return col;
}
`;

export default MOVEL;
