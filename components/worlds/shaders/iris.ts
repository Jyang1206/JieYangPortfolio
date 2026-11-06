// IRIS: steel tray under theatre light.
const IRIS = /* glsl */ `
// instrument: x,y centre, angle, length ; type 0 forceps, 1 scissors, 2 probe
const int N = 5;
vec4 INS[N] = vec4[N](
  vec4(-.30, .07, .22, .46), vec4(-.06, -.04, -.38, .52), vec4(.22, .09, .95, .38),
  vec4(.33, -.12, .08, .40), vec4(-.04, .17, 1.42, .30)
);
int TYP[N] = int[N](0, 1, 0, 2, 2);

float instrument(vec2 p, vec4 d, int typ, out float hl) {
  vec2 l = rot(-d.z) * (p - d.xy);
  float half_ = d.w * .5;
  float s = clamp((l.x + half_) / d.w, 0., 1.);
  float dist = 1e3; hl = 0.;
  if (typ == 0) {
    float spread = .004 + .016 * s;
    float w = mix(.0065, .003, s);
    for (int k = -1; k <= 1; k += 2) {
      float yy = l.y - float(k) * spread;
      float dd = max(abs(yy) - w, abs(l.x) - half_);
      if (dd < dist) { dist = dd; hl = 1. - abs(yy) / w; }
    }
  } else if (typ == 1) {
    float w = mix(.011, .0035, s);
    dist = max(abs(l.y) - w, abs(l.x) - half_); hl = 1. - abs(l.y) / w;
    for (int k = -1; k <= 1; k += 2) {
      vec2 rc = vec2(-half_ - .028, float(k) * .026);
      float ring = abs(length(l - rc) - .022) - .0055;
      if (ring < dist) { dist = ring; hl = 1. - abs(abs(length(l - rc) - .022)) / .0055; }
    }
  } else {
    float w = mix(.006, .0022, s);
    dist = max(abs(l.y) - w, abs(l.x) - half_); hl = 1. - abs(l.y) / w;
  }
  hl = clamp(hl, 0., 1.);
  return dist;
}

vec3 scene(vec2 uv) {
  float t = uTime;
  float folds = fbm(uv * vec2(2.2, 1.6) + vec2(0., t * .01));
  float weave = .5 + .5 * sin(uv.x * 1100.) * sin(uv.y * 1100.);
  vec3 drape = mix(vec3(.05, .17, .21), vec3(.12, .32, .37), folds) * (.94 + .06 * weave);

  vec2 tp = rot(-.06) * (uv - vec2(.2, -.01));
  vec2 tb = vec2(.64, .34);
  float dTray = sdRoundBox(tp, tb, .045);
  float brushed = vnoise(vec2(tp.x * 4., tp.y * 420.)) * .5 + vnoise(vec2(tp.x * 9., tp.y * 1300.)) * .5;
  vec3 steel = vec3(.56, .59, .61) + (brushed - .5) * .09;
  steel *= mix(.74, 1., smoothstep(0., -.035, dTray));
  steel += stroke(dTray + .014, .0028) * .2;
  float trayShadow = smoothstep(.07, -.02, sdRoundBox(tp - vec2(.025, -.03), tb, .06));
  vec3 col = drape * (1. - .6 * trayShadow);
  col = mix(col, steel, fill(dTray));

  vec2 p = tp;
  for (int i = 0; i < N; i++) {
    float hl;
    float sh = instrument(p - vec2(.012, -.017), INS[i], TYP[i], hl);
    col *= 1. - .38 * smoothstep(.016, -.004, sh) * fill(dTray);
    float d = instrument(p, INS[i], TYP[i], hl);
    vec3 metal = vec3(.70, .74, .78) * (.55 + .55 * pow(hl, 2.)) + pow(hl, 18.) * .35;
    col = mix(col, metal, fill(d));
  }

  vec2 lc = vec2(.22 + .05 * sin(t * .13), .05 + .03 * cos(t * .11));
  float pool = exp(-dot(uv - lc, uv - lc) * 3.);
  col *= .28 + 1.1 * pool;
  col += vec3(.85, .92, 1.) * pow(pool, 8.) * .07;

  // detections and the contact graph, in IRIS dashboard cobalt
  vec3 cobalt = vec3(.23, .49, 1.);
  for (int i = 0; i < N; i++) {
    vec2 l = rot(-INS[i].z) * (p - INS[i].xy);
    vec2 h = vec2(INS[i].w * .5 + .045, .05);
    float box = sdBox(l, h);
    float corner = step(h.x - .04, abs(l.x)) * step(h.y - .025, abs(l.y));
    float pulse = .55 + .45 * sin(t * 1.6 + float(i) * 1.3);
    float top = i == N - 1 ? 1. : 0.;
    col = mix(col, cobalt * (1.1 + top * .4), stroke(box, .0018) * corner * mix(pulse, 1., top));
    col = mix(col, cobalt, fill(sdBox(l - vec2(-h.x + .012, h.y + .012), vec2(.012, .008))) * (.6 + .4 * top));
  }
  for (int i = 0; i < N; i++) for (int j = i + 1; j < N; j++) {
    if (length(INS[i].xy - INS[j].xy) > .38) continue;
    float dl = sdSeg(p, INS[i].xy, INS[j].xy);
    float along = dot(p - INS[i].xy, normalize(INS[j].xy - INS[i].xy));
    float dash = step(.5, fract(along * 40. - t * 1.5));
    col = mix(col, cobalt * 1.25, stroke(dl, .0012) * dash * .9);
  }
  for (int i = 0; i < N; i++) col = mix(col, vec3(1.), fill(length(p - INS[i].xy) - .007));
  return col;
}
`;

export default IRIS;
