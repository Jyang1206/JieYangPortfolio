// The hub: six worlds cut like a pizza. Each slice samples that world's own full-frame texture, so a
// wedge shows the part of the world that would sit there if the world were full-bleed.
//
// uLayout 0: wedges by polar angle from the centre, clockwise from the top.
// uLayout 1: horizontal bands, top first.
// uLayout 2: side-by-side strips with slightly slanted seams, left first (phones: a swipeable row).
// uBounds[k]..uBounds[k+1] is slice k's share of the turn (or of the height), as fractions of 1.
// uHover is the slice drawn live and bright; -1 when nothing is hovered.

export const HUB_UNIFORMS = ["uS0", "uS1", "uS2", "uS3", "uS4", "uS5", "uLive", "uRes", "uCount", "uHover", "uBounds", "uLayout", "uGap", "uDisc", "uRotate"];

export default /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uS0;
uniform sampler2D uS1;
uniform sampler2D uS2;
uniform sampler2D uS3;
uniform sampler2D uS4;
uniform sampler2D uS5;
uniform sampler2D uLive;
uniform vec2 uRes;
uniform int uCount;
uniform int uHover;
uniform float uBounds[7];
uniform int uLayout;
uniform vec3 uGap;
uniform float uDisc;
uniform float uRotate; // turn offset, 0..1: the whole pizza rotates
out vec4 outColor;
#define TAU 6.28318531

vec3 pick(int k, vec2 st) {
  if (k == uHover) return texture(uLive, st).rgb;
  if (k == 0) return texture(uS0, st).rgb;
  if (k == 1) return texture(uS1, st).rgb;
  if (k == 2) return texture(uS2, st).rgb;
  if (k == 3) return texture(uS3, st).rgb;
  if (k == 4) return texture(uS4, st).rgb;
  return texture(uS5, st).rgb;
}

void main() {
  vec2 st = gl_FragCoord.xy / uRes;
  vec2 p = gl_FragCoord.xy - .5 * uRes;
  float f, scale;
  if (uLayout == 0) {
    // Fraction of the turn, clockwise from the top.
    f = fract((atan(p.x, p.y)) / TAU - uRotate + 2.);
    scale = length(p) * TAU; // one unit of f equals this many pixels at this radius
  } else if (uLayout == 2) {
    // Lean the seams: the strip edge sits further right at the top than at the bottom.
    f = st.x - .09 * (st.y - .5) * uRes.y / uRes.x;
    scale = uRes.x;
  } else {
    f = 1. - st.y;
    scale = uRes.y;
  }
  int k = 0;
  for (int i = 0; i < 6; i++) if (i < uCount && f >= uBounds[i]) k = i;
  float edge = min(f - uBounds[k], uBounds[k + 1] - f) * scale;
  // Slice boundaries that wrap around the top share one seam.
  if (uLayout == 0) edge = min(edge, min(f, 1. - f) * scale);

  vec3 col = pick(k, st);
  float lum = dot(col, vec3(.299, .587, .114));
  if (uHover >= 0 && k != uHover) col = mix(col, vec3(lum), .35) * .62;
  else if (uHover == k) col *= 1.04;

  // Paper seams between slices and the paper hub in the middle.
  float gapW = uLayout == 0 ? 3. : 4.;
  float seam = 1. - smoothstep(gapW - 1., gapW + 1., edge);
  col = mix(col, uGap, seam);
  if (uLayout == 0) {
    float r = length(p);
    float disc = 1. - smoothstep(uDisc - 1., uDisc + 1., r);
    float ring = 1. - smoothstep(0., 2., abs(r - uDisc - 10.));
    col = mix(col, uGap, max(disc, ring * .9));
    // Soft vignette so the corners read as desk.
    col *= 1. - .35 * pow(length(p / uRes.y) * 1.1, 2.4);
  }
  outColor = vec4(clamp(col, 0., 1.), 1.);
}
`;
