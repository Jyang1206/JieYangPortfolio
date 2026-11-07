// Crossings. uMode is the index of the world being entered; 9 is the reduced-motion crossfade.

export default /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uRes;
uniform float uT;
uniform int uMode;
out vec4 outColor;
#define PI 3.14159265
#define TAU 6.28318531
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }

vec3 A(vec2 s) { return texture(uA, clamp(s, 0., 1.)).rgb; }
vec3 B(vec2 s) { return texture(uB, clamp(s, 0., 1.)).rgb; }

void main() {
  vec2 st = gl_FragCoord.xy / uRes;
  vec2 uv = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  float px = 1. / uRes.y;
  float t = uT;
  vec3 col;

  if (uMode == 0) {
    // IRIS: a seven-blade diaphragm closes on the old world and opens on the new one
    bool opening = t > .5;
    float k = opening ? (t - .5) * 2. : 1. - t * 2.;
    float R = length(vec2(uRes.x / uRes.y, 1.)) * .5 + .08;
    float r = R * pow(k, 1.15);
    const float n = 7.;
    float seg = TAU / n;
    float rotA = t * 1.8;
    float a = atan(uv.y, uv.x) + rotA;
    float sa = mod(a, seg) - seg * .5;
    float apo = r * cos(PI / n);
    float dPoly = length(uv) * cos(sa) - apo;
    vec3 inside = opening ? B(st) : A(st);
    inside *= mix(1., .55, smoothstep(-.08, 0., dPoly));
    float sector = floor(mod(a, TAU) / seg);
    vec2 nd = normalize(uv + 1e-4);
    vec3 blade = vec3(.075 + .03 * hash11(sector + 1.) + .05 * dot(nd, vec2(-.6, .8)));
    blade *= vec3(.95, .97, 1.02);
    float halfSide = apo * tan(PI / n);
    for (float j = 0.; j < n; j++) {
      float th = j * seg + seg * .5 - rotA;
      vec2 nn = vec2(cos(th), sin(th));
      vec2 tg = vec2(-sin(th), cos(th));
      float sd = dot(uv, nn) - apo;
      if (dot(uv, tg) > halfSide && sd > 0.) {
        blade += (1. - smoothstep(.0, 1.6 * px, abs(sd))) * .16;
        blade *= 1. - .25 * (1. - smoothstep(0., .03, sd));
      }
    }
    blade += (1. - smoothstep(0., 1.5 * px, abs(dPoly))) * .22;
    col = dPoly < 0. ? inside : blade;
  } else if (uMode == 1) {
    // Tarii: the roster turns over cell by cell, day by day
    float aspect = uRes.x / uRes.y;
    vec2 grid = vec2(floor(7. * aspect / 1.2), 6.);
    vec2 gid = floor(st * grid);
    vec2 gf = fract(st * grid);
    float order = (gid.x / grid.x) * .55 + ((grid.y - 1. - gid.y) / grid.y) * .3 + hash12(gid) * .15;
    float local = clamp((t - order * .6) / .4, 0., 1.);
    float s = cos(local * PI);
    float sy = abs(s);
    float y = (gf.y - .5) / max(sy, 1e-3) + .5;
    vec3 back = vec3(.12, .11, .1);
    if (y < 0. || y > 1.) col = back;
    else {
      vec2 ss = (gid + vec2(gf.x, y)) / grid;
      col = local < .5 ? A(ss) : B(ss);
      col *= .55 + .45 * sy;
    }
    float edge = min(min(gf.x, 1. - gf.x) * uRes.x / grid.x, min(gf.y, 1. - gf.y) * uRes.y / grid.y);
    col = mix(col, back, (1. - smoothstep(0., 1.5, edge)) * sin(PI * t) * .9);
  } else if (uMode == 2) {
    // Movel AI: a lidar sweep fills an occupancy grid with the new floor
    vec2 c = vec2(0., -.12);
    float cs = .034;
    vec2 cc = (floor((uv - c) / cs) + .5) * cs;
    float a01 = fract((atan(cc.x, cc.y)) / TAU + 1.);
    float aPix = fract((atan(uv.x - c.x, uv.y - c.y)) / TAU + 1.);
    bool shown = a01 < t;
    col = shown ? B(st) : A(st);
    float lag = t - a01;
    if (lag > 0. && lag < .07) {
      vec2 cf = mod(uv - c, cs);
      float border = 1. - smoothstep(0., 1.5 * px, min(min(cf.x, cs - cf.x), min(cf.y, cs - cf.y)));
      float occ = step(.55, hash12(floor((uv - c) / cs)));
      float fade = 1. - lag / .07;
      col = mix(col, vec3(.25, .78, 1.), fade * (.18 + .3 * occ));
      col = mix(col, vec3(.6, .9, 1.), border * fade * .6);
    }
    float dr = length(uv - c);
    float angDist = abs(aPix - t) * TAU * dr;
    float beam = (1. - smoothstep(0., 2. * px, angDist)) * step(.001, t) * step(t, .999);
    col = mix(col, vec3(.7, .95, 1.), beam);
    float rings = 1. - smoothstep(0., 1.4 * px, abs(mod(dr, .16) - .08) - .079 + 0.);
    col = mix(col, vec3(.25, .78, 1.), (1. - smoothstep(0., px * 1.2, abs(mod(dr + .08, .16) - .08))) * sin(PI * t) * .35);
  } else if (uMode == 3) {
    // ST Engineering: optical-flow streaks out of the vanishing point
    vec2 vp = vec2(.5, .63);
    vec2 d = st - vp;
    float e = smoothstep(0., 1., t);
    vec3 ca = vec3(0.), cb = vec3(0.);
    float zoomA = 1. / (1. + e * 1.4);
    float blurA = e * .28;
    float zoomB = 1. + (1. - e) * 2.2;
    float blurB = (1. - e) * .28;
    for (int i = 0; i < 18; i++) {
      float f = float(i) / 17.;
      ca += A(vp + d * zoomA * (1. - blurA * f));
      cb += B(vp + d / zoomB * (1. - blurB * f) );
    }
    ca /= 18.; cb /= 18.;
    col = mix(ca, cb, smoothstep(.38, .62, t));
    float ang = atan(d.y * uRes.y, d.x * uRes.x);
    float bin = floor((ang + PI) / TAU * 900.);
    float h = hash11(bin * 1.7);
    float rr = length(d * vec2(uRes.x / uRes.y, 1.));
    float head = fract(h * 3. + t * 1.6) * 1.3;
    float streak = step(.86, h) * smoothstep(head - .18, head, rr) * step(rr, head);
    col = mix(col, vec3(.55, 1., .82), streak * sin(PI * t) * .55);
  } else if (uMode == 4) {
    // Guitar: each band of the screen is plucked like a string, from the high string down
    float bands = 6.;
    float bi = floor(st.y * bands);
    float order = (bands - 1. - bi) / bands;
    float local = clamp((t - order * .55) / .45, 0., 1.);
    float amp = sin(PI * local) * .035;
    float wave = sin(PI * st.x) * sin(local * PI * 7.);
    float dy = amp * wave;
    float split = amp * .25;
    vec2 s0 = vec2(st.x, st.y + dy);
    vec3 ca = vec3(A(s0 + vec2(split, 0.)).r, A(s0).g, A(s0 - vec2(split, 0.)).b);
    vec3 cb = vec3(B(s0 + vec2(split, 0.)).r, B(s0).g, B(s0 - vec2(split, 0.)).b);
    col = mix(ca, cb, smoothstep(.35, .65, local));
    float lineY = (bi) / bands + amp * wave * .6;
    float ld = abs(st.y - lineY) * uRes.y;
    col = mix(col, vec3(1., .82, .5), (1. - smoothstep(.5, 2., ld)) * sin(PI * local));
  } else if (uMode == 5) {
    // Battlecode: the old world sinks into fog of war, then three champions' vision lifts it tile by tile
    float aspect = uRes.x / uRes.y;
    float cs = 1. / 26.;
    vec2 cid = floor(uv / cs);
    vec2 cc = (cid + .5) * cs;
    vec2 cf = uv / cs - cid - .5;
    float ox = max(0., aspect * .5 - .56);
    vec2 s0 = vec2(ox - .16, -.2) + vec2(.1, .06) * t;
    vec2 s1 = vec2(ox + .22, .17) - vec2(.06, .08) * t;
    vec2 s2 = vec2(ox + .05, -.02);
    float d0 = length(cc - s0), d1 = length(cc - s1), d2 = length(cc - s2);
    float d = min(min(d0, d1), d2) + hash12(cid) * .07;
    // A tile turns when the nearest champion's sight passes it; dmax bounds every tile's d, so t = 1 is all B.
    float w = .09;
    float dmax = length(vec2(aspect * .5 + ox + .12, .6)) + .08;
    float R = mix(-w, dmax + w, smoothstep(0., 1., t));
    float local = clamp((R - d) / w, 0., 1.);
    local = local * local * (3. - 2. * local);
    vec3 ca = A(st);
    float fogIn = smoothstep(0., .3, t);
    vec3 fogA = mix(vec3(dot(ca, vec3(.3, .55, .15))), ca, .3) * .4 + vec3(.012, .016, .03);
    float seam = smoothstep(.5 - 1.5 * px / cs, .5, max(abs(cf.x), abs(cf.y)));
    vec3 under = mix(ca, fogA * (1. - .35 * seam), fogIn);
    col = mix(under, B(st), local);
    vec3 red = vec3(.94, .36, .26), blue = vec3(.27, .58, 1.), gold = vec3(1., .8, .42);
    vec3 tc = d0 < d1 ? (d0 < d2 ? red : gold) : (d1 < d2 ? blue : gold);
    float rim = local * (1. - local) * 4.;
    col = mix(col, tc, rim * (.25 + .5 * seam));
    float env = sin(PI * t);
    float rr = R - .5 * w;
    float ring = min(min(abs(length(uv - s0) - rr), abs(length(uv - s1) - rr)), abs(length(uv - s2) - rr));
    col = mix(col, vec3(.9, .92, .95), (1. - smoothstep(0., 1.6 * px, ring)) * .3 * env);
    col = mix(col, red, (1. - smoothstep(.009, .009 + px * 1.5, length(uv - s0))) * env);
    col = mix(col, blue, (1. - smoothstep(.009, .009 + px * 1.5, length(uv - s1))) * env);
    col = mix(col, gold, (1. - smoothstep(.009, .009 + px * 1.5, length(uv - s2))) * env);
  } else {
    col = mix(A(st), B(st), smoothstep(0., 1., t));
  }
  outColor = vec4(col, 1.);
}
`;
