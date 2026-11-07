// ST Engineering: one car seen from above under sodium light, in three views of the internship work.
//
// uParams.x  mode, animated continuously by STControls: 0 downward view, 1 calibration and surround
//            view, 2 multi-camera stitching. Fractional values dissolve between the two neighbouring
//            modes through a noise pattern (one mode per pixel); the car stays in the same place in
//            modes 0 and 1 (mode 2 draws it lower and smaller to make room for the camera panes).
// uParams.y  the active mode's story, 0..1 (STControls loops it: ramp on, hold, ramp off, pause):
//            mode 0: stitching on. The car turns into an outline, tracked road features and their flow
//                    vectors appear ahead of it, and the area under it fills front-to-back with
//                    stitched road frames (hatched where nothing has been seen yet).
//            mode 1: 0..0.6 calibration progress: AprilTag boards are detected one by one (corner
//                    marks) with pose-graph edges from the anchor tag (paper bracket), each camera's
//                    estimated pose snaps onto its true pose, the reprojection-error meter at the
//                    right falls under the quality-gate line (then turns mint with a tick), and the
//                    time bar at the bottom compresses from a long amber bar to a short mint one.
//                    0.6..1 the calibrated surround view builds: the floor is replaced by four camera
//                    wedges that unbend from fisheye, start with hard seams and exposure steps, and end
//                    multi-band blended (flow streaks run along the seams while blending).
//            mode 2: the car sits lower and smaller, with three forward cameras on its front, their
//                    overlapping ground footprints, and their three image panes above it, each
//                    tilted, keystoned and offset by parallax. At 0 the overlaps are plain averages:
//                    ghosting (a vehicle ahead shows twice) and exposure steps.
//                    0..0.55 the dense-flow warp aligns the panes and bows them into one cylindrical
//                    band (flow arrows both ways in the overlaps, shrinking as they agree);
//                    0.3..0.6 fixed seams take over, with the moving vehicle kept whole from one
//                    camera (mint corner marks); 0.45..1 multi-band blending evens exposure;
//                    0.75..1 output packets leave the band.
// uParams.z, uParams.w  unused.
//
// Compile time: the compiler inlines every call, so the heavy road albedo and car roof are
// evaluated once in scene() for whichever mode the pixel shows, and the surround ground and the
// street view are each sampled at most twice per pixel.
//
// Layout: the action sits right of centre (uv.x ~ +0.3) because a paper card covers the left of the
// screen on desktop; narrow screens pull it back to the centre and scale it down.
export default /* glsl */ `
const float HW = .062;          // car half width
const float HL = .135;          // car half length (car points +y)
const float SPD = .22;          // mode 0 road speed, uv units per second
const vec3 SODIUM = vec3(1., .62, .26);
const vec3 MINT = vec3(.55, 1., .82);
const vec3 PAPER = vec3(.95, .93, .89);

// Cameras: front bumper, right mirror, rear bumper, left mirror. Angles are measured from +y towards +x.
const vec2 CAMP[4] = vec2[4](vec2(0., HL), vec2(HW + .006, .045), vec2(0., -HL), vec2(-HW - .006, .045));
const float CAMA[4] = float[4](0., 1.5707963, 3.1415927, -1.5707963);
// Calibration boards: two per camera, in camera order (tag i belongs to camera i / 2).
const vec2 TAGS[8] = vec2[8](vec2(-.07, .28), vec2(.07, .28), vec2(.215, .1), vec2(.215, -.1),
                             vec2(.07, -.28), vec2(-.07, -.28), vec2(-.215, -.1), vec2(-.215, .1));
// Detection order, so detections hop between cameras instead of sweeping round.
const int ORD[8] = int[8](0, 4, 2, 6, 1, 5, 3, 7);

vec2 dir2(float a) { return vec2(sin(a), cos(a)); }
float sdCar(vec2 p) { return sdRoundBox(p, vec2(HW, HL), .03); }
float carShadow(vec2 p) {
  return 1. - smoothstep(-.02, .03, sdRoundBox(p - vec2(.007, -.012), vec2(HW + .008, HL + .008), .04));
}

// Car roof view. rgb = colour, a = coverage.
vec4 carTop(vec2 p) {
  vec3 c = vec3(0.);
  vec2 wq = vec2(abs(p.x) - HW + .004, abs(p.y) - .085);
  float wheel = fill(sdRoundBox(wq, vec2(.012, .024), .006));
  c = mix(c, vec3(.018), wheel);
  float a = wheel;

  float d = sdCar(p);
  float body = fill(d);
  vec3 paint = vec3(.29, .32, .35) * (.78 + .32 * (1. - clamp(abs(p.x) / HW, 0., 1.)));
  paint *= 1. - .25 * stroke(abs(p.x) - .03, .0012) * step(.07, p.y);       // bonnet creases
  float roof = fill(sdRoundBox(p - vec2(0., -.012), vec2(.047, .046), .012));
  paint = mix(paint, vec3(.34, .37, .41), roof);
  float ws = fill(sdRoundBox(p - vec2(0., .047), vec2(max(.046 - (p.y - .047) * .35, .01), .019), .008));
  float rw = fill(sdRoundBox(p - vec2(0., -.072), vec2(.044, .014), .008));
  float side = fill(sdBox(vec2(abs(p.x) - .052, p.y + .008), vec2(.004, .058)));
  vec3 glass = vec3(.035, .045, .06) + .1 * SODIUM * (1. - smoothstep(0., .012, abs(p.x + p.y * .6 - .01)));
  paint = mix(paint, glass, max(max(ws, rw), side));
  float hlamp = fill(sdRoundBox(vec2(abs(p.x) - .04, p.y - .127), vec2(.014, .005), .003));
  float tlamp = fill(sdRoundBox(vec2(abs(p.x) - .043, p.y + .129), vec2(.013, .004), .002));
  paint = mix(paint, vec3(1., .93, .78), hlamp);
  paint = mix(paint, vec3(.85, .1, .06), tlamp);
  paint *= 1. - .45 * stroke(d + .002, .0015);
  c = mix(c, paint, body);
  float mir = fill(sdRoundBox(vec2(abs(p.x) - .068, p.y - .045), vec2(.008, .005), .003));
  c = mix(c, vec3(.22, .24, .27), mir * (1. - body));
  a = max(a, max(body, mir));
  return vec4(c, a);
}

float arrowMask(vec2 p, vec2 a, vec2 b, float w) {
  vec2 d = normalize(b - a);
  vec2 n = vec2(-d.y, d.x);
  float m = stroke(sdSeg(p, a, b), w);
  m = max(m, stroke(sdSeg(p, b, b - d * .016 + n * .011), w));
  m = max(m, stroke(sdSeg(p, b, b - d * .016 - n * .011), w));
  return m;
}

// ---------------------------------------------------------------- mode 0: downward view
// Lateral drift of the car in its lane, and its time derivative.
float ox(float t) { return .016 * sin(t * .37) + .006 * sin(t * .91 + 1.); }
float oxd(float t) { return .016 * .37 * cos(t * .37) + .006 * .91 * cos(t * .91 + 1.); }

// Road albedo in road coordinates g (x across, y along the road).
vec3 road0(vec2 g) {
  float ax = abs(g.x);
  float n1 = fbm(g * 9.);
  float n2 = vnoise(g * 140.);
  float n3 = vnoise(g * 380.);
  vec3 asph = vec3(.085, .08, .076) * (.7 + .45 * n1 + .25 * n2 + .18 * n3);

  // polished tyre tracks and an oil line down each lane centre
  float lane = g.x - floor(g.x / .22 + .5) * .22;
  float wv = (abs(lane) - .05) / .016;
  asph *= 1. - .18 * exp(-wv * wv) * step(ax, .33);
  float ov = lane / .012;
  asph *= 1. - .35 * exp(-ov * ov) * smoothstep(.45, .7, fbm(g * vec2(3., 1.2) + 4.));

  // repair patches: irregular, low-contrast resurfacing with a soft edge and a faint glossy seal.
  // (A hard-edged darker rectangle read as a black box between the light pools.)
  float py = floor(g.y / .9);
  vec2 ph = hash22(vec2(py, 3.7));
  vec2 pc = vec2((ph.x - .5) * .4, (py + .3 + .4 * ph.y) * .9);
  vec2 ps = vec2(.04 + .04 * hash11(py * 1.3 + .2), .06 + .06 * hash11(py * 2.1 + .7));
  float pd = sdRoundBox(g - pc, ps, .018) + (vnoise(g * 45. + py) - .5) * .012;
  float present = step(.45, hash11(py + 9.1));
  float pin = (1. - smoothstep(-.004, .004, pd)) * present;
  asph = mix(asph, vec3(.085, .08, .076) * (.86 + .22 * n1 + .1 * n2), pin * .8);
  asph *= 1. + .12 * stroke(pd, .0016) * present * step(.4, vnoise(g * 90.));

  // cracks: noise contour lines, only in weathered areas
  float c1 = (1. - smoothstep(0., .02, abs(vnoise(g * vec2(7., 4.) + 11.) - .5))) * smoothstep(.55, .7, fbm(g * 2. + 7.));
  float c2 = (1. - smoothstep(0., .03, abs(vnoise(g * 22. + 3.) - .5))) * smoothstep(.6, .75, fbm(g * 2.3 + 1.));
  asph *= 1. - .6 * max(c1, c2 * .8);

  // lane paint, worn
  float dashOn = step(fract(g.y / .32), .55);
  float laneL = (1. - smoothstep(.0045, .0045 + px, abs(ax - .11))) * dashOn;
  float edgeL = 1. - smoothstep(.005, .005 + px, abs(ax - .33));
  float paint = max(laneL, edgeL) * (.65 + .35 * smoothstep(.3, .7, vnoise(g * 60.)));
  vec3 col = mix(asph, vec3(.78, .76, .7), paint * .85);

  // manhole in the car's lane, so it passes under the car
  float mh = floor(g.y / 1.7);
  vec2 mq = g - vec2(.03 * (hash11(mh + .5) - .5) + .01, (mh + .5) * 1.7);
  float mr = length(mq);
  vec2 gq = abs(fract(rot(.785) * mq * 110.) - .5);
  float tread = smoothstep(.22, .3, min(gq.x, gq.y));
  vec3 metal = vec3(.12, .115, .11) * (.8 + .5 * tread) * (.85 + .3 * n2);
  metal *= 1. - .5 * stroke(mr - .022, .0012);
  col = mix(col, vec3(.16, .15, .14) * (.8 + .3 * n1), fill(mr - .038));
  col = mix(col, metal, fill(mr - .032));
  col = mix(col, vec3(.02), stroke(mr - .032, .0014));

  // amber road studs along the edge lines
  vec2 sq = vec2(ax - .345, g.y - (floor(g.y / .5) + .5) * .5);
  col = mix(col, vec3(1., .7, .25), fill(sdBox(sq, vec2(.0035, .0025))));

  // kerb and pavement
  vec3 kerb = vec3(.18, .17, .16) * (.8 + .3 * n1);
  kerb *= 1. - .5 * stroke((fract(g.y / .06 + .5) - .5) * .06, .0008);
  vec2 tq = (fract(g / .05 + .5) - .5) * .05;
  vec3 pave = vec3(.11, .105, .1) * (.75 + .4 * n1 + .2 * n2);
  pave *= 1. - .5 * max(stroke(tq.x, .0008), stroke(tq.y, .0008));
  col = ax < .355 ? col : (ax < .375 ? kerb : pave);
  return col;
}

float lamps0(vec2 g) {
  float I = 0.;
  for (int k = -1; k <= 1; k += 2) {
    for (int j = -1; j <= 1; j++) {
      vec2 L = vec2(float(k) * .43, (floor(g.y / .9 + .5) + float(j)) * .9 + float(k) * .22);
      vec2 d = g - L;
      I += exp(-dot(d, d) * 10.);
    }
  }
  return I;
}

vec3 mode0(vec2 p, float s, float t, vec3 base, vec4 car) {
  float o = ox(t);
  vec2 g = vec2(p.x - o, p.y + t * SPD);           // road coordinates under screen point p
  vec3 lit = base * (.32 + 2.4 * lamps0(g) * SODIUM);
  vec3 col = lit;

  // headlights ahead, tail-light glow behind
  float al = p.y - HL;
  float beam = smoothstep(0., .03, al) * exp(-max(al, 0.) * 2.6) * (1. - smoothstep(.03 + al * .3, .06 + al * .6, abs(p.x)));
  col += base * beam * vec3(1., .9, .74) * 3.;
  float tb = -p.y - HL;
  col += base * vec3(1., .12, .06) * smoothstep(0., .01, tb) * exp(-max(tb, 0.) * 14.) * (1. - smoothstep(.02, .07, abs(p.x))) * 1.5;

  float on = smoothstep(0., .3, s);
  col *= 1. - .6 * carShadow(p) * (1. - .5 * on);

  // under the car: stitched road frames from the front bumper backwards, hatched where unseen
  float cd = sdCar(p);
  float inside = fill(cd);
  float edgeY = HL + .012 - s * (2. * HL + .035);
  float seen = smoothstep(edgeY - .003, edgeY + .003, p.y);
  float band = floor(g.y / .036);                  // one band per stitched frame, carried with the road
  vec3 recon = (lit * 1.2 + base * .25) * (1. + (hash11(band * 1.7 + 3.) - .5) * .16) * vec3(.94, 1.02, 1.);
  recon = mix(recon, MINT, stroke((fract(g.y / .036 + .5) - .5) * .036, .0006) * .3);
  float hatch = smoothstep(.55, .62, fract((p.x + p.y) * 70.));
  vec3 unseen = vec3(.012, .013, .016) + hatch * .07;
  col = mix(col, mix(unseen, recon, seen), inside * on);

  col = mix(col, car.rgb, car.a * mix(1., .13, on));
  col = mix(col, PAPER, stroke(cd, .0011) * on * .85);
  col = mix(col, MINT, stroke(p.y - edgeY, .0014) * inside * on * (1. - smoothstep(.96, 1., s)));

  // front camera footprint and the frame being added
  float fa = smoothstep(.02, .2, s);
  if (fa > .001) {
    float fw = .04 + max(al, 0.) * .7;
    float fov = step(0., al) * (1. - smoothstep(.2, .24, al)) * (1. - smoothstep(-.003, .003, abs(p.x) - fw));
    col += MINT * fov * fa * .035;
    float fedge = stroke(sdSeg(vec2(abs(p.x), p.y), vec2(.04, HL), vec2(.18, HL + .2)), .0007);
    col = mix(col, MINT, fedge * fa * .35);
    col = mix(col, MINT, stroke(sdBox(p - vec2(0., HL + .042), vec2(.075, .03)), .001) * fa * .7);

    // tracked road features with flow vectors (trail = where each point was a moment ago)
    vec2 cs = vec2(.05);
    vec2 cid = floor(g / cs);
    for (int i = -1; i <= 1; i++) {
      for (int j = -2; j <= 1; j++) {
        vec2 id = cid + vec2(float(i), float(j));
        if (hash12(id + 5.) < .55) continue;
        vec2 gp = (id + .15 + .7 * hash22(id)) * cs;
        if (abs(gp.x) > .33) continue;
        vec2 sp = vec2(gp.x + o, gp.y - t * SPD);
        if (sdCar(sp) < .004) continue;
        vec2 prev = vec2(gp.x + ox(t - .18), gp.y - (t - .18) * SPD);
        float fl = sp.y - HL;
        float infov = smoothstep(-.005, .02, fl) * (1. - smoothstep(.2, .26, fl))
          * (1. - smoothstep(0., .02, abs(sp.x) - (.04 + max(fl, 0.) * .7)));
        col = mix(col, MINT, stroke(sdSeg(p, sp, prev), .0009) * fa * infov * .85);
        col = mix(col, MINT, fill(length(p - sp) - .0032) * fa * mix(.16, 1., infov));
      }
    }
  }

  // ego-motion readout over the outline: translation arrow and heading arc
  float eg = smoothstep(.45, .8, s);
  if (eg > .001) {
    float vd = oxd(t);
    vec2 v = normalize(vec2(-vd * 8., SPD));
    vec2 a0 = vec2(0., -.035);
    col = mix(col, MINT, arrowMask(p, a0, a0 + v * .075, .0013) * eg);
    float head = atan(-vd, SPD) * 6.;              // exaggerated so it is visible
    vec2 q = p - a0;
    float ang = length(q) > .001 ? atan(q.x, q.y) : 0.;
    float arc = stroke(length(q) - .026, .0012) * step(min(0., head), ang) * step(ang, max(0., head));
    col = mix(col, MINT, arc * eg * .9);
    col = mix(col, MINT, fill(length(q) - .004) * eg);
  }
  return col;
}

// ---------------------------------------------------------------- mode 1, first half: calibration
float lamps1(vec2 p) {
  float I = 0.;
  for (int i = 0; i < 4; i++) {
    vec2 L = vec2(i < 2 ? -.17 : .17, (i == 0 || i == 2) ? .2 : -.2);
    vec2 d = p - L;
    I += exp(-dot(d, d) * 9.);
  }
  return I;
}

vec3 floor1(vec2 p) {
  float n1 = fbm(p * 7. + 20.);
  float n2 = vnoise(p * 160.);
  vec3 c = vec3(.105, .1, .095) * (.75 + .4 * n1 + .15 * n2);
  vec2 q = (fract(p / .16 + .5) - .5) * .16;       // slab joints
  c *= 1. - .45 * max(stroke(q.x, .0008), stroke(q.y, .0008));
  c = mix(c, vec3(.75, .6, .2), stroke(sdBox(p, vec2(.27, .38)), .0035) * .8);   // bay outline
  vec2 wq = vec2(abs(p.x) - .045, abs(p.y) - .085);                               // wheel marks
  c = mix(c, vec3(.75, .6, .2), stroke(sdBox(wq, vec2(.016, .03)), .001) * .5);
  return c;
}

// Camera pose estimate during calibration: wrong and jittering until its tags are in, then snapped.
void camPose(int k, float c, float t, out vec2 cp, out float a, out float snap) {
  float fk = float(k);
  snap = smoothstep(.56 + .06 * fk, .7 + .06 * fk, c);
  float u = 1. - snap;
  float run = step(.005, c);
  a = CAMA[k] + (hash11(fk * 7.3 + 2.) - .5) * .8 * u + sin(t * 2.3 + fk * 1.7) * .04 * u * run;
  cp = CAMP[k] + (hash22(vec2(fk, 4.)) - .5) * .05 * u;
}

float frustumEdges(vec2 p, vec2 cp, float a, float R, float spread) {
  vec2 f = dir2(a);
  vec2 r = vec2(f.y, -f.x);
  vec2 e1 = cp + (f + r * spread) * R;
  vec2 e2 = cp + (f - r * spread) * R;
  float m = stroke(sdSeg(p, cp, e1), .001);
  m = max(m, stroke(sdSeg(p, cp, e2), .001));
  return max(m, stroke(sdSeg(p, e1, e2), .001));
}

float frustumFill(vec2 p, vec2 cp, float a, float R, float spread) {
  vec2 f = dir2(a);
  vec2 v = p - cp;
  float al = dot(v, f);
  float sd = dot(v, vec2(f.y, -f.x));
  return step(0., al) * step(abs(sd), al * spread) * step(al, R);
}

vec3 calib(vec2 p, float c, float t, vec4 car) {
  float I = lamps1(p);
  vec3 light = .5 + 1.7 * I * SODIUM;
  vec3 col = floor1(p) * light;
  col *= 1. - .6 * carShadow(p);
  float run = step(.005, c);

  // camera frustums: amber estimates converge on the faint true poses, then turn mint.
  // Poses are kept for the markers drawn over the car (the compiler unrolls each loop, so each
  // pose is computed once).
  vec2 cps[4];
  float snaps[4];
  for (int k = 0; k < 4; k++) {
    vec2 cp; float a; float snap;
    camPose(k, c, t, cp, a, snap);
    cps[k] = cp;
    snaps[k] = snap;
    vec3 fc = mix(SODIUM, MINT, snap);
    col += fc * frustumFill(p, cp, a, .13, 1.3) * (.025 + .03 * snap);
    col = mix(col, PAPER, frustumEdges(p, CAMP[k], CAMA[k], .13, 1.3) * .14 * run * (1. - snap));
    col = mix(col, fc, frustumEdges(p, cp, a, .13, 1.3) * (.45 + .4 * snap));
  }

  // detection rays (camera to tag, dashed) and pose-graph edges (anchor tag to each tag) as tags
  // are detected; also find the nearest board, the only one this pixel can be on
  float hs = .036;
  float fadeG = 1. - smoothstep(.85, 1., c);
  int nt = 0;
  float nd = 1e3;
  for (int i = 0; i < 8; i++) {
    vec2 tc = TAGS[i];
    float thr = .04 + .065 * float(ORD[i]);
    float det = smoothstep(thr, thr + .04, c);
    vec2 cp = CAMP[i / 2];
    vec2 rd = normalize(tc - cp);
    float dash = step(.5, fract(dot(p - cp, rd) * 70. - t * 3.));
    col = mix(col, MINT, stroke(sdSeg(p, cp, tc), .0007) * det * dash * .5 * fadeG);
    if (i > 0) col = mix(col, PAPER, stroke(sdSeg(p, TAGS[0], tc), .0006) * smoothstep(thr + .02, thr + .06, c) * .22 * fadeG);
    vec2 q = abs(p - tc);
    float dd = max(q.x, q.y);
    if (dd < nd) { nd = dd; nt = i; }
  }

  // AprilTag board: quiet zone, black border, 4x4 data bits; corner marks once detected
  if (nd < .06) {
    vec2 q = p - TAGS[nt];
    float thr = .04 + .065 * float(ORD[nt]);
    float det = smoothstep(thr, thr + .04, c);
    col *= 1. - .5 * (1. - smoothstep(-.004, .008, sdBox(q - vec2(.003, -.004), vec2(hs))));
    vec2 cell = clamp(floor((q / hs + 1.) * 4.), 0., 7.);
    float e = min(min(cell.x, cell.y), min(7. - cell.x, 7. - cell.y));
    float bit = step(.5, hash12(cell + float(nt) * 13.1));
    float white = e < .5 ? 1. : (e < 1.5 ? 0. : bit);
    vec3 tagc = mix(vec3(.025), vec3(.86, .85, .81), white) * (.7 + .9 * I);
    float board = fill(sdBox(q, vec2(hs)));
    col = mix(col, tagc, board);
    col += MINT * board * det * (1. - det) * 4. * .25;     // flash on detection
    col = mix(col, MINT, stroke(sdBox(q, vec2(hs + .007)), .0016) * det);
    col = mix(col, MINT, fill(length(abs(q) - hs * .75) - .0048) * det);
    col = mix(col, vec3(.02), fill(length(abs(q) - hs * .75) - .002) * det);
  }

  // anchor tag (detected first): the pose graph starts here and it stays fixed during the solve
  float anc = smoothstep(.04, .08, c);
  vec2 aq = p - TAGS[0];
  col = mix(col, PAPER, stroke(sdBox(aq, vec2(hs + .013)), .001) * anc * .9);
  col = mix(col, PAPER, fill(sdBox(aq - vec2(0., hs + .02), vec2(.006, .003))) * anc);

  // reprojection error meter: falls while the global solve runs; the quality gate (paper line)
  // accepts the result only once the error is under it, and the meter turns mint
  float opt = smoothstep(.55, .92, c);
  float err = mix(.9, .12, opt) + .05 * sin(t * 7.) * opt * (1. - opt) * 4.;
  float gate = .25;
  float ok = step(err, gate);
  vec2 mq = p - vec2(.305, -.3);
  float mh = .3 * err * run;
  vec3 mc = mix(SODIUM, MINT, ok);
  col = mix(col, PAPER, stroke(sdBox(mq - vec2(0., .15), vec2(.006, .15)), .0006) * .3);
  col = mix(col, mc, fill(sdBox(mq - vec2(0., mh * .5), vec2(.0045, mh * .5))) * .9 * run);
  col = mix(col, PAPER, fill(sdBox(mq - vec2(0., .3 * gate), vec2(.012, .0009))) * .8);
  col = mix(col, MINT, ok * run * max(stroke(sdSeg(mq, vec2(-.008, -.025), vec2(-.003, -.031)), .0012),
                                     stroke(sdSeg(mq, vec2(-.003, -.031), vec2(.008, -.017)), .0012)));

  col = mix(col, car.rgb, car.a);

  for (int k = 0; k < 4; k++) {
    vec3 fc = mix(SODIUM, MINT, snaps[k]);
    col = mix(col, fc, fill(sdBox(p - cps[k], vec2(.0055))));
    col = mix(col, MINT, stroke(length(p - cps[k]) - .011, .0009) * snaps[k]);
  }

  // time bar: a long amber bar (manual, about an hour) compresses into a short mint one (minutes)
  float comp = smoothstep(.12, .95, c);
  float full = .5;
  float x0 = -.25;
  float yb = -.37;
  float Lb = mix(full, full / 12., comp);
  vec3 bc = mix(SODIUM, MINT, comp);
  col = mix(col, PAPER, stroke(sdBox(p - vec2(x0 + full * .5, yb), vec2(full * .5, .005)), .0007) * .25);
  col = mix(col, bc, fill(sdBox(p - vec2(x0 + Lb * .5, yb), vec2(Lb * .5, .005))) * .9);
  float tq = (p.x - x0) / Lb * 12.;
  float tick = stroke((fract(tq + .5) - .5) * Lb / 12., .0006) * step(-.02, tq) * step(tq, 12.02)
    * step(abs(p.y - yb + .011), .004);
  col = mix(col, bc, tick * .8);
  return col;
}

// ---------------------------------------------------------------- mode 1, second half: surround view
// Car-park ground in car coordinates, lighting baked in.
vec3 ground2(vec2 g) {
  float n1 = fbm(g * 8. + 40.);
  float n2 = vnoise(g * 150. + 3.);
  vec3 c = vec3(.09, .085, .08) * (.7 + .45 * n1 + .2 * n2);
  float ax = abs(g.x);
  float paint = 1. - smoothstep(.004, .004 + px, abs(ax - .17));
  float by = (fract(g.y / .12 + .5) - .5) * .12;
  paint = max(paint, (1. - smoothstep(.0035, .0035 + px, abs(by))) * step(.17, ax) * step(ax, .4));
  paint = max(paint, 1. - smoothstep(.004, .004 + px, abs(ax - .4)));
  paint = max(paint, step(.5, fract(g.x / .04)) * step(.24, g.y) * step(g.y, .32) * step(ax, .16));   // zebra
  paint = max(paint, stroke(sdSeg(vec2(ax, g.y), vec2(0., -.24), vec2(.04, -.275)), .004));            // chevrons
  paint = max(paint, stroke(sdSeg(vec2(ax, g.y), vec2(0., -.29), vec2(.04, -.325)), .004));
  paint *= .7 + .3 * vnoise(g * 50.);
  c = mix(c, vec3(.8, .78, .72), paint * .85);
  float I = 0.;
  for (int i = 0; i < 4; i++) {
    vec2 L = vec2(i < 2 ? -.3 : .3, (i == 0 || i == 2) ? .22 : -.22);
    vec2 d = g - L;
    I += exp(-dot(d, d) * 8.);
  }
  return c * (.4 + 1.25 * I * SODIUM);
}

// Camera k's view of the ground under p, with residual fisheye fe and misalignment mis.
vec3 surroundSample(int k, vec2 p, float mis, float fe) {
  vec2 cp = CAMP[k];
  vec2 rel = p - cp;
  float r = length(rel);
  vec2 g = cp + rel * (1. + (.35 * mis + 1.4 * fe) * r) + (hash22(vec2(float(k), 9.)) - .5) * .07 * mis;
  return ground2(g);
}

// b: blending 0..1. fe: residual fisheye distortion (1 right after calibration, 0 when settled).
vec3 surround(vec2 p, float b, float t, float fe, vec4 car) {
  float Lr = length(vec2(HW, HL));
  // Signed distance into each camera's wedge; wedges are split along the car's diagonals.
  float sc[4];
  sc[0] = (p.y * HW - abs(p.x) * HL) / Lr;
  sc[1] = (p.x * HL - abs(p.y) * HW) / Lr;
  sc[2] = (-p.y * HW - abs(p.x) * HL) / Lr;
  sc[3] = (-p.x * HL - abs(p.y) * HW) / Lr;
  float mxs = max(max(sc[0], sc[1]), max(sc[2], sc[3]));
  float mis = 1. - b;
  // Multi-band: image detail blends over a narrow band, exposure and colour over a wide one.
  float hardK = .0025 + .01 * b;
  float softK = .0025 + .09 * b;
  vec3 low = vec3(0.);
  float ws = 0.;
  int k1 = 0;                                      // strongest and second-strongest wedge
  int k2 = 1;
  for (int k = 0; k < 4; k++) {
    vec2 rel = p - CAMP[k];
    vec2 h = hash22(vec2(float(k), 2.));
    float gain = k == 0 ? 1.3 : (k == 1 ? .62 : (k == 2 ? 1.05 : .78));   // per-camera exposure
    vec3 tint = gain * vec3(1., .85 + .3 * h.x, .75 + .45 * h.y);
    tint = mix(tint, vec3(1.), b * .55);
    tint *= 1. - .5 * mis * smoothstep(.06, .42, length(rel));            // lens vignette
    float bw = exp((sc[k] - mxs) / softK);
    low += bw * tint;
    ws += bw;
    if (sc[k] > sc[k1]) { k2 = k1; k1 = k; }
    else if (k != k1 && (k2 == k1 || sc[k] > sc[k2])) k2 = k;
  }
  if (k2 == k1) k2 = (k1 + 1) % 4;
  // Image detail comes from the two nearest wedges only (the other two weigh nothing near here);
  // ground2 is inlined once per call, so two calls keep the shader quick to compile.
  float w2 = exp((sc[k2] - sc[k1]) / hardK);
  vec3 col = (surroundSample(k1, p, mis, fe) + w2 * surroundSample(k2, p, mis, fe)) / (1. + w2) * (low / ws);

  float region = fill(sdRoundBox(p, vec2(.34, .4), .03));
  vec2 gq = (fract(p / .04 + .5) - .5) * .04;
  vec3 outside = vec3(.018, .02, .024) + .02 * max(stroke(gq.x, .0005), stroke(gq.y, .0005));
  col = mix(outside, col, region);
  col = mix(col, PAPER, stroke(sdRoundBox(p, vec2(.34, .4), .03), .0008) * .35);

  // seams from the car corners, then dense-flow streaks along them while blending
  vec2 a2 = abs(p);
  float perp = (a2.x * HL - a2.y * HW) / Lr;
  float along = dot(a2, vec2(HW, HL)) / Lr;
  float beyond = smoothstep(Lr, Lr + .01, along) * region;
  col = mix(col, SODIUM, stroke(perp, .0012) * beyond * mis * .75 * step(.5, fract(along * 40.)));
  float fs = smoothstep(.03, .3, b) * (1. - .7 * smoothstep(.7, 1., b));
  if (fs > .001) {
    float rid = floor(perp / .006);
    vec2 qid = vec2(rid, sign(p.x) * 2. + sign(p.y));
    float ph = fract(along * 12. - t * (.8 + .8 * hash12(qid)) + hash12(qid + 7.));
    float dash = smoothstep(0., .08, ph) * (1. - smoothstep(.2, .35, ph));
    float streak = stroke(perp - (rid + .5) * .006, .0008) * dash * exp(-abs(perp) * 55.) * beyond;
    col = mix(col, MINT, streak * fs * 1.4);
  }

  col *= 1. - .5 * carShadow(p);
  col = mix(col, car.rgb, car.a);
  for (int k = 0; k < 4; k++) {
    col = mix(col, mix(SODIUM, MINT, b), fill(sdBox(p - CAMP[k], vec2(.005))));
  }
  return col;
}

// Per-pixel threshold for dissolves between two views. Each pixel draws one view only, which keeps
// the shader small enough to compile quickly (evaluating both and mixing doubles the inlined code).
float dissolve(vec2 p) { return clamp((fbm(p * 3.5 + 7.) - .25) * 2., .02, .98); }

// Calibration first (y 0..0.6), then the calibrated surround view settles (y 0.6..1).
vec3 mode1(vec2 p, float y, float t, float th, vec4 car) {
  // the switch from bay to surround view is a dissolve, so only one of the two is drawn per pixel
  if (y < .6 || smoothstep(.6, .72, y) < th) return calib(p, min(y / .6, 1.), t, car);
  return surround(p, smoothstep(.66, 1., y), t, 1. - smoothstep(.6, .85, y), car);
}

// ---------------------------------------------------------------- mode 2: multi-camera stitching
// Three cameras on the front of the vehicle, all facing forward from slightly different positions and
// yaw. Their image panes sit above the car; the toggle warps them into one cylindrical panorama.
const vec3 CAMC[3] = vec3[3](vec3(1., .62, .26), vec3(.95, .93, .89), vec3(.55, .78, 1.));
const float PANE_H = .2;        // pane height in p units; panes are 1.3 x 1 in pane units
const float PANE_Y = .2;        // pane row centre
const float SEAM = .1;          // fixed seams at screen x = +-SEAM, the middle of each overlap
const vec2 M2C = vec2(0., -.21);  // car centre in this mode (lower, so the panes fit above)
const float M2S = 1.5;          // the car and road are drawn 1 / M2S size in this mode
const float BEND = .22;         // cylindrical bow of the stitched band at its ends, in pane units

// Vehicle ahead: lateral position and depth in street units. It drives across the middle overlap.
vec2 leadCar(float t) { return vec2(2.4 * sin(t * .3), 4.5); }

// Forward street view at night in pane units (y in [-.5, .5]); x spans the whole panorama.
vec3 street(vec2 s, float t) {
  float hz = .1;
  vec3 col;
  if (s.y < hz) {
    float z = min(.3 / (hz - s.y), 60.);
    float x = s.x * z;
    float zz = z + t * 2.;
    float det = exp(-z * .06);
    vec3 base = vec3(.08, .075, .07) * (.75 + .5 * mix(.5, vnoise(vec2(x, zz) * 3.), det));
    float lw = .04 + .0045 * z;
    float lane = (1. - smoothstep(lw, lw * 1.4, abs(abs(x) - .9))) * step(fract(zz / 4.), .45);
    float edge = 1. - smoothstep(.05, .08, abs(abs(x) - 2.6));
    base = mix(base, vec3(.72, .7, .64), max(lane, edge) * .8);
    base = abs(x) > 2.8 ? vec3(.07, .068, .065) * (.8 + .4 * vnoise(vec2(x, zz) * 2.)) : base;
    float dx = abs(x) - 3.2;                       // nearest street-light pool, both sides
    float dz = (fract(zz / 12. + .5) - .5) * 12.;
    float I = exp(-(dx * dx * .15 + dz * dz * .04));
    col = base * (.3 + 3.5 * I * SODIUM);
    col = mix(col, vec3(.2, .1, .055), 1. - exp(-z * .03));
  } else {
    float h = s.y - hz;
    col = mix(vec3(.22, .11, .06), vec3(.015, .022, .05), smoothstep(0., .35, h));
    float bx = floor(s.x * 9.);
    float hb = hash11(bx * 1.37 + .5);
    float bh = .04 + .2 * hb * hb;
    if (h < bh) {
      col = vec3(.016, .016, .022);
      vec2 wq = vec2(s.x * 70., h * 70.);
      float win = step(.82, hash12(floor(wq))) * step(.25, fract(wq.x)) * step(.3, fract(wq.y));
      col += win * vec3(1., .72, .38) * .55;
    }
  }
  // the vehicle ahead (the moving foreground object), seen from behind
  vec2 L = leadCar(t);
  vec2 b = vec2(L.x / L.y, hz - .3 / L.y);
  vec2 hw = vec2(.85, .5) / L.y;
  vec2 cq = s - b - vec2(0., hw.y * .5);
  float body = 1. - smoothstep(-.002, .002, sdRoundBox(cq, vec2(hw.x, hw.y * .5), .012));
  vec3 car = vec3(.13, .125, .12) * (.7 + .8 * smoothstep(-hw.y * .2, hw.y * .5, cq.y));
  float tl = 1. - smoothstep(-.002, .002, sdBox(vec2(abs(cq.x) - hw.x * .72, cq.y + hw.y * .12), vec2(hw.x * .18, hw.y * .07)));
  car = mix(car, vec3(1., .16, .08), tl);
  col = mix(col, car, body);
  vec2 gq = cq + vec2(0., hw.y * .1);
  col += vec3(1., .12, .05) * .3 * exp(-dot(gq, gq) / (hw.x * hw.x * .2));
  return col;
}

// Screen point q -> pane-local coordinates of camera k. mis = 1 unaligned, 0 aligned; cyl bows the
// band like an unrolled cylindrical projection.
vec2 paneLocal(int k, vec2 q, float mis, float cyl) {
  float fk = float(k) - 1.;
  vec2 P = vec2(fk * .2, PANE_Y + (k == 1 ? -.014 : .012) * mis);
  float r = fk * .09 * mis;
  vec2 v = (q - P) / PANE_H;
  v = vec2(cos(r) * v.x + sin(r) * v.y, -sin(r) * v.x + cos(r) * v.y);
  v.x /= 1. + fk * .3 * mis * v.y;                // keystone from the different viewing angle
  float gx = q.x / .33;
  v.y += cyl * BEND * gx * gx;
  return v;
}

// Approximate inverse of paneLocal, for drawing lines to pane corners.
vec2 paneScreen(int k, vec2 v, float mis, float cyl) {
  float fk = float(k) - 1.;
  vec2 P = vec2(fk * .2, PANE_Y + (k == 1 ? -.014 : .012) * mis);
  float r = fk * .09 * mis;
  v.x *= 1. + fk * .3 * mis * v.y;
  v = vec2(cos(r) * v.x - sin(r) * v.y, sin(r) * v.x + cos(r) * v.y);
  vec2 s = P + v * PANE_H;
  float gx = s.x / .33;
  s.y -= cyl * BEND * gx * gx * PANE_H;
  return s;
}

// Where camera k's pixel v lands in the panorama: offset per camera, plus parallax on the near
// road (each camera sits at a different spot) until the flow-based warp removes it.
vec2 paneSample(int k, vec2 v, float mis) {
  float fk = float(k) - 1.;
  return v + vec2(fk + fk * .55 * mis * max(.1 - v.y, 0.), fk * .03 * mis);
}

// Short flow arrow from a to b (a dot marks the head); empty when the flow is zero.
float flowArrow(vec2 p, vec2 a, vec2 b) {
  if (dot(b - a, b - a) < 1e-8) return 0.;
  return max(stroke(sdSeg(p, a, b), .0007), fill(length(p - b) - .0022));
}

vec3 mode2(vec2 p, float y, float t, vec3 base, vec4 car) {
  float warp = smoothstep(0., .55, y);             // flow-based warp into alignment
  float mis = 1. - warp;
  float cyl = warp;                                // cylindrical projection of the joined band
  float seamOn = smoothstep(.3, .6, y);            // fixed seams replace plain averaging
  float blend = smoothstep(.45, 1., y);            // multi-band blending across the seams
  float flowOn = sin(PI * smoothstep(.04, .7, y));

  // road and the parked car, drawn smaller and lower
  vec2 c = (p - M2C) * M2S;
  px *= M2S;
  vec3 col = base * (.3 + 1.6 * lamps0(c) * SODIUM);
  col *= 1. - .6 * carShadow(c);
  // ground footprints of the three forward cameras; where they overlap the road brightens
  float nIn = 0.;
  for (int k = 0; k < 3; k++) {
    float fk = float(k) - 1.;
    vec2 cp = vec2(fk * .034, HL + .004);
    float a = fk * .28;
    float f = frustumFill(c, cp, a, .27, .62);
    nIn += f;
    col += CAMC[k] * f * .035;
    col = mix(col, CAMC[k], frustumEdges(c, cp, a, .27, .62) * .45 * (1. - .6 * blend));
  }
  col += MINT * step(1.5, nIn) * .03 * (1. - blend);
  col = mix(col, car.rgb, car.a);
  px /= M2S;

  // camera markers and sight lines to their panes
  for (int k = 0; k < 3; k++) {
    float fk = float(k) - 1.;
    vec2 cp = M2C + vec2(fk * .034, HL + .004) / M2S;
    vec3 cc = CAMC[k];
    vec2 c0 = paneScreen(k, vec2(-.65, -.5), mis, cyl);
    vec2 c1 = paneScreen(k, vec2(.65, -.5), mis, cyl);
    float ln = max(stroke(sdSeg(p, cp, c0), .0006), stroke(sdSeg(p, cp, c1), .0006));
    col = mix(col, cc, ln * (.45 - .35 * blend));
    col = mix(col, cc, fill(sdBox(p - cp, vec2(.0042))));
  }

  // The moving vehicle is foreground: it is taken whole from one camera (its seam side), so the
  // fixed seam never cuts through it. Its screen box once aligned:
  vec2 L = leadCar(t);
  float fgX = L.x / L.y * PANE_H;
  float fgW = .85 / L.y * PANE_H + .008;
  float fgB = PANE_Y + (.1 - .3 / L.y) * PANE_H - .006;
  float fgT = fgB + .5 / L.y * PANE_H + .012;
  float inFg = step(abs(p.x - fgX), fgW) * step(fgB, p.y) * step(p.y, fgT) * seamOn;
  float qx = mix(p.x, fgX, inFg);

  // panes -> panorama. Unstitched, overlaps are plain averages: the parallax shows as ghosting
  // and each camera's exposure shows as a step. Stitched, image detail switches over a narrow
  // band at the fixed seam and exposure/colour over a wide one (multi-band).
  vec3 low = vec3(0.);
  float wl = 0.;
  float cover = 0.;
  float w1 = 0.;                                    // the two strongest panes here
  float w2 = 0.;
  vec2 s1 = vec2(0.);
  vec2 s2 = vec2(0.);
  float dW = .0025;
  float lW = mix(.0025, .028, blend);
  vec2 vs[3];
  for (int k = 0; k < 3; k++) {
    vec2 v = paneLocal(k, p, mis, cyl);
    vs[k] = v;
    float m = fill(sdBox(v, vec2(.65, .5)) * PANE_H);
    cover = max(cover, m);
    if (m < .001) continue;
    float terr = k == 0 ? -SEAM - qx : (k == 1 ? SEAM - abs(qx) : qx - SEAM);
    float wh = m * mix(1., smoothstep(-dW, dW, terr) + .001, seamOn);
    float wsf = m * mix(1., smoothstep(-lW, lW, terr) + .001, seamOn);
    float gain = k == 0 ? 1.3 : (k == 1 ? .8 : 1.12);
    vec3 tint = mix(gain * vec3(1., k == 2 ? 1.05 : .9, k == 0 ? .76 : 1.06), vec3(1.), blend * .85);
    vec2 sp = paneSample(k, v, mis);
    if (wh > w1) { w2 = w1; s2 = s1; w1 = wh; s1 = sp; }
    else if (wh > w2) { w2 = wh; s2 = sp; }
    low += wsf * tint;
    wl += wsf;
  }
  if (cover > .001) {
    // panes overlap only in pairs, so two street samples cover every pixel; street is inlined
    // once per call, so two calls keep the shader quick to compile
    vec3 detail = street(s1, t) * w1;
    if (w2 > 1e-4) detail += street(s2, t) * w2;
    vec3 pano = detail / max(w1 + w2, 1e-4) * (low / max(wl, 1e-4));
    col = mix(col, pano, cover);
  }

  // dense flow in each overlap, computed both ways (A to B mint, B to A amber); the two agree and
  // shrink to nothing as the warp converges
  if (flowOn > .001) {
    vec2 cell = (floor(p / .026) + .5) * .026;
    for (int k = 0; k < 2; k++) {
      vec2 va = paneLocal(k, cell, mis, cyl);
      vec2 vb = paneLocal(k + 1, cell, mis, cyl);
      float both = step(max(abs(va.x), abs(vb.x)), .62) * step(max(abs(va.y), abs(vb.y)), .47);
      if (both < .5) continue;
      vec2 e = (paneSample(k + 1, vb, mis) - paneSample(k, va, mis)) * PANE_H * .5;
      e = clamp(e, vec2(-.009), vec2(.009));
      vec2 c1 = cell + vec2(0., .0045);
      vec2 c2 = cell - vec2(0., .0045);
      col = mix(col, MINT, flowArrow(p, c1 - e * .5, c1 + e * .5) * flowOn * .95);
      col = mix(col, SODIUM, flowArrow(p, c2 + e * .5, c2 - e * .5) * flowOn * .85);
    }
  }

  // frames: one per camera while separate, then one for the stitched band
  for (int k = 0; k < 3; k++) {
    float fr = stroke(sdBox(vs[k], vec2(.65, .5)) * PANE_H, .0011);
    col = mix(col, CAMC[k], fr * (1. - blend) * .9);
  }
  float band = step(abs(vs[1].y), .5) * step(abs(vs[1].x), 1.65);
  col = mix(col, PAPER, stroke(sdBox(vs[1], vec2(1.65, .5)) * PANE_H, .001) * blend * .7);
  // fixed seams, dashed, with a gap where the foreground vehicle is kept whole; its mask in mint
  float sd = step(.5, fract(p.y * 90.));
  col = mix(col, PAPER, stroke(abs(p.x) - SEAM, .0006) * band * sd * (1. - inFg) * seamOn * (1. - .55 * blend) * .7);
  vec2 fq = p - vec2(fgX, (fgB + fgT) * .5);
  vec2 fh = vec2(fgW, (fgT - fgB) * .5);
  float corner = stroke(sdBox(fq, fh), .0007) * step(fh.x - .007, abs(fq.x)) * step(fh.y - .007, abs(fq.y));
  col = mix(col, MINT, corner * seamOn * .9);

  // live output: packets leave the right end of the stitched band
  float out0 = smoothstep(.75, 1., y);
  if (out0 > .001) {
    for (int i = 0; i < 3; i++) {
      float ph = fract(t * .6 + float(i) / 3.);
      vec2 pp = vec2(.345 + ph * .07, PANE_Y - .04);
      col = mix(col, MINT, fill(sdBox(p - pp, vec2(.0035, .0022))) * out0 * (1. - ph));
    }
  }
  return col;
}

vec3 scene(vec2 uv) {
  float t = uTime;
  float aspect = uRes.x / uRes.y;
  // Centre-right on wide screens (a card covers the left), centred and smaller on narrow ones.
  float cx = clamp(.5 * aspect - .55, 0., .3);
  float zoom = 1.15 * clamp(.5 * aspect / .4, .55, 1.);
  px /= zoom;
  vec2 p = (uv - vec2(cx, 0.)) / zoom;

  float mx = clamp(uParams.x, 0., 2.);
  float y = clamp(uParams.y, 0., 1.);
  float m0 = min(floor(mx), 1.);
  float f = mx - m0;
  // Mode changes dissolve through a noise pattern with a faint mint edge, one mode per pixel.
  float th = dissolve(p);
  float k = smoothstep(0., 1., f);
  float m = k > th ? m0 + 1. : m0;

  // The road albedo and the car roof are the heaviest pieces; the compiler inlines every call, so
  // they are evaluated here once for whichever mode this pixel shows and passed in.
  bool small = m > 1.5;
  vec2 cp = small ? (p - M2C) * M2S : p;
  float pxs = px;
  if (small) px *= M2S;
  vec3 base = vec3(0.);
  if (m < .5 || small) base = road0(small ? cp * .8 + vec2(0., 3.) : vec2(p.x - ox(t), p.y + t * SPD));
  vec4 car = carTop(cp);
  px = pxs;
  vec3 col = m < .5 ? mode0(p, y, t, base, car) : (m < 1.5 ? mode1(p, y, t, th, car) : mode2(p, y, t, base, car));
  return col + MINT * .35 * (1. - smoothstep(0., .03, abs(k - th))) * step(.002, f) * step(f, .998);
}
`;
