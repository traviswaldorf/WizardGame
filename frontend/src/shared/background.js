/**
 * Background effects manager (WebGL).
 * Two effects that cycle via toggle: Off → Swirl → Forge → Off.
 *
 *   • Swirl  — Balatro-style liquid-metal paint (localthunk)
 *   • Forge  — Void Forge: elemental orbs drift through deep space,
 *              forming energy tendrils and reaction blooms when they converge
 *
 * Usage:
 *   import { initBackground, cycleBackground, getBackgroundMode } from './background.js';
 *   initBackground();       // creates canvas, restores saved mode
 *   cycleBackground();      // off → swirl → forge → off
 *   getBackgroundMode();    // 'off' | 'swirl' | 'forge'
 */

// ── Shared vertex shader ────────────────────────────────────────────────────

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// ── Effect 1: Swirl (Balatro) ───────────────────────────────────────────────

const FRAG_SWIRL = `
precision mediump float;

uniform float u_time;
uniform vec2  u_resolution;
uniform float u_spin_rotation;
uniform float u_spin_speed;
uniform float u_spin_amount;
uniform float u_spin_ease;
uniform bool  u_is_rotate;
uniform float u_contrast;
uniform float u_lighting;
uniform float u_pixel_filter;
uniform vec4  u_corner_tl;
uniform vec4  u_corner_tr;
uniform vec4  u_corner_bl;
uniform vec4  u_corner_br;
uniform vec4  u_shadow;

void main() {
    vec2 screenSize = u_resolution;
    vec2 screen_coords = gl_FragCoord.xy;

    float pixel_size = length(screenSize) / u_pixel_filter;
    vec2 uv = (floor(screen_coords * (1.0 / pixel_size)) * pixel_size
               - 0.5 * screenSize) / length(screenSize);
    float uv_len = length(uv);
    vec2 screen_uv = (floor(screen_coords * (1.0 / pixel_size)) * pixel_size) / screenSize;

    float speed = u_spin_rotation * u_spin_ease * 0.2;
    if (u_is_rotate) { speed = u_time * speed; }
    speed += 302.2;

    float new_pixel_angle = atan(uv.y, uv.x) + speed
        - u_spin_ease * 20.0 * (u_spin_amount * uv_len + (1.0 - u_spin_amount));

    vec2 mid = (screenSize / length(screenSize)) / 2.0;
    uv = vec2(uv_len * cos(new_pixel_angle) + mid.x,
              uv_len * sin(new_pixel_angle) + mid.y) - mid;

    uv *= 30.0;
    float spd = u_time * u_spin_speed;
    vec2 uv2 = vec2(uv.x + uv.y);

    for (int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv  += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + spd * 0.131121),
                           sin(uv2.x - 0.113 * spd));
        uv  -= 1.0 * cos(uv.x + uv.y) - 1.0 * sin(uv.x * 0.711 - uv.y);
    }

    float contrast_mod = 0.25 * u_contrast + 0.5 * u_spin_amount + 1.2;
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);

    float distort_strength = 0.35;
    vec2 blend_uv = clamp(screen_uv + vec2(c1p - c2p, c2p - c1p) * distort_strength, 0.0, 1.0);
    vec4 local_colour = mix(mix(u_corner_bl, u_corner_br, blend_uv.x),
                            mix(u_corner_tl, u_corner_tr, blend_uv.x), blend_uv.y);

    vec2 blend_uv2 = clamp(screen_uv - vec2(c1p - c2p, c2p - c1p) * distort_strength, 0.0, 1.0);
    vec4 local_colour2 = mix(mix(u_corner_bl, u_corner_br, blend_uv2.x),
                             mix(u_corner_tl, u_corner_tr, blend_uv2.x), blend_uv2.y);

    float light = (u_lighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0)
                + u_lighting * max(c2p * 5.0 - 4.0, 0.0);

    gl_FragColor = (0.3 / u_contrast) * local_colour
                 + (1.0 - 0.3 / u_contrast) * (
                     local_colour * c1p + local_colour2 * c2p
                   + vec4(c3p * u_shadow.rgb, c3p * local_colour.a)
                 ) + light;
}
`;

// ── Effect 2: Void Forge ────────────────────────────────────────────────────
//
// Four elemental orbs drift through a near-black void.  When two orbs of
// different elements converge, an energy tendril connects them and a
// reaction bloom flashes at their midpoint in the secondary type colour.

const FRAG_FORGE = `
precision highp float;

uniform float u_time;
uniform vec2  u_resolution;

// Edge glow colours
uniform vec3 u_fire;       // left edge
uniform vec3 u_water;      // right edge
uniform vec3 u_earth;      // bottom edge
uniform vec3 u_air;        // top edge

// Mouse fluid interaction
uniform vec2 u_mouse;     // smoothed cursor position (0-1)
uniform vec2 u_drift;     // accumulated flow displacement from mouse velocity

// Black hole / Cell
uniform vec2 u_blackhole;  // slowly drifting position (0-1)

// Morph: 0.0 = space, 1.0 = cellular
uniform float u_morph;

// Pixelation: 1.0 = no effect, higher = chunkier pixels
uniform float u_pixel_size;

// Warp drive: 0 = normal, >0 = hyperspace radial motion
uniform float u_warp;

// ── Noise (integer-style hash — no sin() precision issues) ──

float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}

// Gradient noise (Perlin-style) — no grid artifacts
vec2 ghash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

float gnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float a = dot(ghash(i + vec2(0, 0)), f - vec2(0, 0));
    float b = dot(ghash(i + vec2(1, 0)), f - vec2(1, 0));
    float c = dot(ghash(i + vec2(0, 1)), f - vec2(0, 1));
    float d = dot(ghash(i + vec2(1, 1)), f - vec2(1, 1));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 0.5 + 0.5;
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.877, 0.479, -0.479, 0.877);
    for (int i = 0; i < 4; i++) {
        v += a * gnoise(p);
        p = rot * p * 2.0;
        a *= 0.5;
    }
    return v;
}

// ── Star / microbe field — bounded grid ──────────────────
// O(1) per pixel: each pixel checks only its own cell.
// Stars/microbes stay within their cell (drift + dot < 0.5 cell).
// density = grid cells per unit, threshold = star probability,
// dotScale = dot size relative to cell (0-0.5).

vec3 starField(vec2 uv_a, float t, float density, float seed,
               float threshold, float brightness, float dotScale, float morph_raw) {
    // morph_raw: -1=quantum, 0=space, +1=cellular
    float morph = max(0.0, morph_raw);  // cell blend
    float qmorph = max(0.0, -morph_raw); // quantum blend
    vec3 result = vec3(0.0);
    vec2 sc = floor(uv_a * density);
    float sr = hash21(sc + seed);
    if (sr < threshold) return result;

    float cell = 1.0 / density;
    vec2 id = sc + seed;

    // Position: centered in cell with random offset
    vec2 sp = (sc + 0.2 + vec2(hash(id), hash(id + 71.0)) * 0.6) / density;

    // Per-star drift — gentle in space, lively swimming in cellular
    float maxD = cell * mix(0.10, 0.42, morph);
    float s1 = hash(id + 5.0) * 6.28;
    float s2 = hash(id + 8.0) * 6.28;
    float f1 = mix(0.5, 1.4, hash(id + 14.0));
    float f2 = mix(1.2, 3.0, hash(id + 17.0));
    float s3 = hash(id + 12.0) * 6.28;
    float f3 = mix(1.8, 4.5, hash(id + 20.0));
    vec2 drift = vec2(
        sin(t * f1 + s1) * 0.45 + sin(t * f2 + s2) * 0.3 + sin(t * f3 + s3) * 0.25,
        cos(t * f1 * 0.9 + s1 + 1.0) * 0.45 + cos(t * f2 * 0.85 + s2 + 2.0) * 0.3
        + cos(t * f3 * 1.1 + s3 + 0.7) * 0.25
    ) * maxD;
    sp += drift;

    // Quantum: rapid vibration in place (molecules/atoms jittering)
    if (qmorph > 0.01) {
        float vib_f1 = 8.0 + hash(id + 35.0) * 12.0; // 8-20 Hz
        float vib_f2 = 15.0 + hash(id + 36.0) * 20.0; // faster secondary
        float vib_amp = cell * 0.06 * qmorph;
        sp += vec2(
            sin(t * vib_f1 + hash(id + 37.0) * 6.28) + sin(t * vib_f2 + hash(id + 38.0) * 6.28) * 0.5,
            cos(t * vib_f1 * 1.1 + hash(id + 39.0) * 6.28) + cos(t * vib_f2 * 0.9 + hash(id + 40.0) * 6.28) * 0.5
        ) * vib_amp;
    }

    // Velocity for microbe orientation
    vec2 vel = vec2(
        cos(t * f1 + s1) * f1 * 0.45 + cos(t * f2 + s2) * f2 * 0.3
        + cos(t * f3 + s3) * f3 * 0.25,
        -sin(t * f1 * 0.9 + s1 + 1.0) * f1 * 0.9 * 0.45
        - sin(t * f2 * 0.85 + s2 + 2.0) * f2 * 0.85 * 0.3
        - sin(t * f3 * 1.1 + s3 + 0.7) * f3 * 1.1 * 0.25
    ) * maxD;

    vec2 delta = uv_a - sp;

    // Per-cell size variation (0.5x to 1.8x) — some tiny, some fat
    float sizeVar = 0.5 + hash(id + 25.0) * 1.3;

    // Cell mode: rounder base shape that elongates with speed
    float spd = length(vel);
    float speedStretch = spd / (maxD * f1 * 0.6 + 0.0001);
    float elongation = 1.0 + morph * (0.15 + speedStretch * 0.45);
    float rot_a = morph > 0.05 ? atan(vel.y, vel.x + 0.0001) : hash(id + 30.0) * 6.28;
    float cr = cos(rot_a), sr2 = sin(rot_a);
    vec2 rd = vec2(delta.x * cr + delta.y * sr2,
                  (-delta.x * sr2 + delta.y * cr) / elongation);
    float d = length(rd);

    // Dot size proportional to cell, with per-cell variation
    float ds = cell * dotScale * mix(1.0, sizeVar, morph);

    // Warp: streak star radially from screen center
    if (u_warp > 0.01) {
        float ws2 = u_warp * u_warp;
        vec2 wctr = vec2(u_resolution.x / u_resolution.y * 0.5, 0.5);
        vec2 wrad = normalize(sp - wctr + 0.001);
        float wa = atan(wrad.y, wrad.x);
        float wcr = cos(wa), wsr = sin(wa);
        vec2 wrd = vec2(delta.x * wcr + delta.y * wsr,
                       (-delta.x * wsr + delta.y * wcr) / (1.0 + ws2 * 12.0));
        d = length(wrd);
        ds *= 1.0 + ws2 * 2.0;
    }

    float dot_ = exp(-d * d / (ds * ds));

    // Lifecycle
    float period = mix(8.0, 4.0, morph) + hash(id + 50.0) * mix(20.0, 8.0, morph);
    float phase  = hash(id + 60.0) * 6.28;
    float life   = sin(t / period * 3.14159 + phase);
    life = smoothstep(-0.2, 0.6, life);
    float tw = 0.85 + 0.15 * sin(t * (0.5 + sr * 1.2) + sr * 12.0);

    // Colour morphs: space → cell (warm), space → quantum (cool/neutral)
    float w = hash(id + 70.0);
    vec3 space_c, cell_c, quantum_c;
    if (w < 0.3)       { space_c = vec3(0.5, 0.55, 0.95); cell_c = vec3(0.3, 0.85, 0.4); quantum_c = vec3(0.6, 0.6, 0.75); }
    else if (w < 0.5)  { space_c = vec3(0.95, 0.75, 0.5); cell_c = vec3(0.9, 0.8, 0.2); quantum_c = vec3(0.75, 0.7, 0.8); }
    else if (w < 0.65) { space_c = vec3(0.9, 0.55, 0.6);  cell_c = vec3(0.8, 0.3, 0.7); quantum_c = vec3(0.7, 0.65, 0.85); }
    else if (w < 0.78) { space_c = vec3(0.6, 0.9, 0.7);   cell_c = vec3(0.4, 0.9, 0.6); quantum_c = vec3(0.65, 0.7, 0.75); }
    else               { space_c = vec3(0.9, 0.88, 0.82);  cell_c = vec3(0.7, 0.95, 0.5); quantum_c = vec3(0.8, 0.8, 0.85); }
    vec3 c = mix(space_c, cell_c, morph) + (quantum_c - space_c) * qmorph;

    result = dot_ * life * tw * brightness * c;
    return result;
}

// Bright star / organelle — bounded grid, single-cell lookup
vec3 brightStar(vec2 uv_a, float t, float density, float seed, float morph) {
    vec3 result = vec3(0.0);
    vec2 sc = floor(uv_a * density);
    float sr = hash21(sc + seed);
    if (sr < 0.96) return result;

    float cell = 1.0 / density;
    vec2 id = sc + seed;

    vec2 sp = (sc + 0.2 + vec2(hash(id + 33.0), hash(id + 57.0)) * 0.6) / density;

    // Per-organelle drift
    float maxD = cell * 0.15;
    float of1 = 0.25 + hash(id + 46.0) * 0.35;
    float os1 = hash(id + 40.0) * 6.28;
    vec2 odrift = vec2(
        sin(t * of1 + os1) * 0.7 + sin(t * of1 * 1.3 + os1 + 2.0) * 0.3,
        cos(t * of1 * 0.85 + os1 + 1.5) * 0.7 + cos(t * of1 * 1.1 + os1 + 3.5) * 0.3
    ) * maxD;
    sp += odrift * morph;

    vec2 ovel = vec2(
        cos(t * of1 + os1) * of1 * maxD * 0.7,
        -sin(t * of1 * 0.85 + os1 + 1.5) * of1 * 0.85 * maxD * 0.7
    );

    vec2 delta = uv_a - sp;
    float elong = 1.0 + morph * 0.8;
    float ra = morph > 0.05 ? atan(ovel.y, ovel.x + 0.0001) : hash(id + 70.0) * 6.28;
    float cr2 = cos(ra), sr3 = sin(ra);
    vec2 rd = vec2(delta.x * cr2 + delta.y * sr3,
                  (-delta.x * sr3 + delta.y * cr2) / elong);
    float d = length(rd);

    // Warp: streak bright star radially
    if (u_warp > 0.01) {
        float ws2 = u_warp * u_warp;
        vec2 wctr = vec2(u_resolution.x / u_resolution.y * 0.5, 0.5);
        vec2 wrad = normalize(sp - wctr + 0.001);
        float wa = atan(wrad.y, wrad.x);
        float bwcr = cos(wa), bwsr = sin(wa);
        vec2 wrd = vec2(delta.x * bwcr + delta.y * bwsr,
                       (-delta.x * bwsr + delta.y * bwcr) / (1.0 + ws2 * 12.0));
        d = length(wrd);
    }

    float cs = cell * 0.08;
    float gs = cell * 0.25;
    float core = exp(-d * d / (cs * cs));
    float glow = exp(-d * d / (gs * gs));

    float period = mix(12.0, 5.0, morph) + hash(id + 90.0) * mix(23.0, 8.0, morph);
    float phase  = hash(id + 100.0) * 6.28;
    float pulse  = sin(t / period * 3.14159 + phase);
    pulse = smoothstep(-0.3, 0.4, pulse);
    float flicker = 1.0 - 0.12 * pulse * sin(t * (1.5 + sr * 2.0) + sr * 20.0);

    float w = hash(id + 110.0);
    vec3 space_c = mix(vec3(0.6, 0.7, 1.0), vec3(1.0, 0.95, 0.85), w);
    vec3 cell_c  = mix(vec3(0.3, 0.8, 0.4), vec3(0.9, 0.85, 0.2), w);
    vec3 c = mix(space_c, cell_c, morph);

    float b = pulse * flicker;
    result = core * b * 0.6 * c + glow * b * 0.12 * c;
    return result;
}

// ── Comet / Flagellate helpers ────────────────────────────
// Shared position computation — used by both rendering and displacement.

vec4 cometCenter(float t, float morph, float aspect, float ci_seed) {
    // Returns vec4(center.xy, bodyRadius, active) — active=0 means skip
    float cycle = mix(12.0, 5.0, morph) + hash(vec2(ci_seed, 50.0)) * mix(8.0, 3.0, morph);
    float duration = mix(0.8, 4.5, morph) + hash(vec2(ci_seed, 52.0)) * mix(0.4, 2.0, morph);
    float offset_t = hash(vec2(ci_seed, 51.0)) * cycle;
    float local_t = mod(t + offset_t, cycle);
    if (local_t > duration) return vec4(0.0);

    float epoch = floor((t + offset_t) / cycle);
    float raw_phase = local_t / duration;
    float strokes = 4.0 + hash(vec2(epoch * 23.1 + ci_seed, 55.0)) * 4.0;
    float phase = raw_phase + sin(raw_phase * strokes * 6.28318) * 0.025 * morph;
    phase = clamp(phase, 0.0, 1.0);

    float h1 = hash(vec2(epoch * 17.3 + ci_seed, 1.0));
    float h2 = hash(vec2(epoch * 11.7 + ci_seed, 2.0));
    float h3 = hash(vec2(epoch * 7.1 + ci_seed, 3.0));
    float h4 = hash(vec2(epoch * 13.9 + ci_seed, 4.0));

    vec2 startPt, endPt;
    if (h1 < 0.25) startPt = vec2(0.0, h2);
    else if (h1 < 0.5) startPt = vec2(1.0, h2);
    else if (h1 < 0.75) startPt = vec2(h2, 0.0);
    else startPt = vec2(h2, 1.0);
    if (h3 < 0.25) endPt = vec2(0.0, h4);
    else if (h3 < 0.5) endPt = vec2(1.0, h4);
    else if (h3 < 0.75) endPt = vec2(h4, 0.0);
    else endPt = vec2(h4, 1.0);
    startPt.x *= aspect;
    endPt.x *= aspect;

    float pathLen = mix(0.2, 0.50, morph) + hash(vec2(epoch * 29.7 + ci_seed, 8.0)) * 0.2;
    float pathStart = hash(vec2(epoch * 31.3 + ci_seed, 9.0)) * (1.0 - pathLen);
    float along_path = pathStart + phase * pathLen;
    vec2 base_pos = mix(startPt, endPt, along_path);
    vec2 dir = normalize(endPt - startPt);
    vec2 perp_dir = vec2(-dir.y, dir.x);

    float drift_freq = 2.5 + hash(vec2(epoch * 37.1 + ci_seed, 10.0)) * 2.0;
    float drift_amp = 0.025 * morph * (0.7 + hash(vec2(epoch * 41.3 + ci_seed, 11.0)) * 0.6);
    float lateral = sin(along_path * drift_freq + hash(vec2(ci_seed, 60.0)) * 6.28) * drift_amp;
    vec2 center = base_pos + perp_dir * lateral;

    float sizeScale = 0.3 + hash(vec2(epoch * 19.3 + ci_seed, 6.0)) * 2.2;
    float bodyR = mix(0.006, 0.010, morph) * sizeScale;

    float vis = smoothstep(0.0, 0.1, raw_phase) * smoothstep(1.0, 0.85, raw_phase);
    return vec4(center, bodyR, vis);
}

// Displacement field — outward push from all active flagellates.
// Like something swimming through water, nudging nearby things aside.
vec2 cometWarp(vec2 pt, float t, float morph, float aspect) {
    vec2 total = vec2(0.0);
    if (morph < 0.05) return total; // no displacement in pure space mode
    for (int ci = 0; ci < 6; ci++) {
        float ci_seed = float(ci) * 73.0;
        float extra = ci == 0 ? 1.0 : smoothstep(0.15, 0.5, morph);
        if (extra < 0.001) continue;

        vec4 info = cometCenter(t, morph, aspect, ci_seed);
        if (info.w < 0.01) continue; // not active

        vec2 center = info.xy;
        float bodyR = info.z;
        float vis = info.w;

        vec2 delta = pt - center;
        float dist = length(delta);
        // Push radius: extends a few body-widths out
        float pushR = bodyR * 5.0;
        if (dist > pushR || dist < 0.0001) continue;

        vec2 outDir = delta / dist;
        // Strength peaks just outside the body, fades to zero at pushR
        float strength = smoothstep(pushR, bodyR * 0.8, dist)
                       * smoothstep(0.0, bodyR * 0.5, dist);
        float pushStr = bodyR * 0.6 * morph;
        total += outDir * strength * pushStr * vis * extra;
    }
    return total;
}

// ── Comet / Flagellate ───────────────────────────────────
// Space (morph≈0): original comet — sharp pinpoint head + thin tail streak,
//   straight path, off-angle tilt, single at a time.
// Cell (morph≈1): fat oval flagellates — stop-and-go swimming, size variation,
//   gentle curves, multiple concurrent for teeming feel.
// morph blends smoothly between the two renderings.

vec3 cometSingle(vec2 uv_a, float t, float aspect, float morph,
                 float ci_seed, float creature_id) {
    // Extra creatures (id>0) fade in with morph — only 1 comet in space mode
    float extra_vis = creature_id < 0.5 ? 1.0 : smoothstep(0.15, 0.5, morph);
    if (extra_vis < 0.001) return vec3(0.0);

    // Timing: space = rare & brief, cell = frequent & sustained
    float cycle = mix(12.0, 5.0, morph) + hash(vec2(ci_seed, 50.0)) * mix(8.0, 3.0, morph);
    float duration = mix(0.8, 4.5, morph) + hash(vec2(ci_seed, 52.0)) * mix(0.4, 2.0, morph);
    float offset = hash(vec2(ci_seed, 51.0)) * cycle;
    float local_t = mod(t + offset, cycle);

    if (local_t > duration) return vec3(0.0);

    float epoch = floor((t + offset) / cycle);
    float raw_phase = local_t / duration;

    float h1 = hash(vec2(epoch * 17.3 + ci_seed, 1.0));
    float h2 = hash(vec2(epoch * 11.7 + ci_seed, 2.0));
    float h3 = hash(vec2(epoch * 7.1 + ci_seed, 3.0));
    float h4 = hash(vec2(epoch * 13.9 + ci_seed, 4.0));

    // ── Stop-and-go swimming (cell mode, fades in with morph) ──
    float strokes = 4.0 + hash(vec2(epoch * 23.1 + ci_seed, 55.0)) * 4.0;
    float stroke_phase = fract(raw_phase * strokes);
    float swim_effort = smoothstep(0.5, 0.15, stroke_phase)
                      * smoothstep(0.0, 0.08, stroke_phase) * morph;
    // Phase: linear in space, pulsed in cell
    float phase = raw_phase + sin(raw_phase * strokes * 6.28318) * 0.025 * morph;
    phase = clamp(phase, 0.0, 1.0);

    // Start / end points (shared)
    vec2 startPt, endPt;
    if (h1 < 0.25) startPt = vec2(0.0, h2);
    else if (h1 < 0.5) startPt = vec2(1.0, h2);
    else if (h1 < 0.75) startPt = vec2(h2, 0.0);
    else startPt = vec2(h2, 1.0);
    if (h3 < 0.25) endPt = vec2(0.0, h4);
    else if (h3 < 0.5) endPt = vec2(1.0, h4);
    else if (h3 < 0.75) endPt = vec2(h4, 0.0);
    else endPt = vec2(h4, 1.0);

    startPt.x *= aspect;
    endPt.x *= aspect;

    float pathLen = mix(0.2, 0.50, morph) + hash(vec2(epoch * 29.7 + ci_seed, 8.0)) * 0.2;
    float pathStart = hash(vec2(epoch * 31.3 + ci_seed, 9.0)) * (1.0 - pathLen);
    float along_path = pathStart + phase * pathLen;
    vec2 base_pos = mix(startPt, endPt, along_path);
    vec2 dir = normalize(endPt - startPt);
    vec2 perp_dir = vec2(-dir.y, dir.x);

    // ── Lateral drift: none in space, gentle curves in cell ──
    float drift_freq = 2.5 + hash(vec2(epoch * 37.1 + ci_seed, 10.0)) * 2.0;
    float drift_amp = 0.025 * morph * (0.7 + hash(vec2(epoch * 41.3 + ci_seed, 11.0)) * 0.6);
    float lateral = sin(along_path * drift_freq + hash(vec2(ci_seed, 60.0)) * 6.28) * drift_amp;
    lateral += sin(raw_phase * strokes * 6.28 + 1.5) * drift_amp * 0.4 * swim_effort;

    vec2 center = base_pos + perp_dir * lateral;

    // Direction: path tangent in space, velocity-based in cell
    vec2 cur_dir = dir;
    if (morph > 0.05) {
        float dp = 0.002;
        float phase_n = clamp(raw_phase + dp, 0.0, 1.0)
                      + sin((raw_phase + dp) * strokes * 6.28318) * 0.025 * morph;
        phase_n = clamp(phase_n, 0.0, 1.0);
        float along_n = pathStart + phase_n * pathLen;
        float lat_n = sin(along_n * drift_freq + hash(vec2(ci_seed, 60.0)) * 6.28) * drift_amp
                    + sin((raw_phase + dp) * strokes * 6.28 + 1.5) * drift_amp * 0.4
                      * smoothstep(0.5, 0.15, fract((raw_phase + dp) * strokes))
                      * smoothstep(0.0, 0.08, fract((raw_phase + dp) * strokes)) * morph;
        vec2 ctr_n = mix(startPt, endPt, along_n) + perp_dir * lat_n;
        vec2 vd = ctr_n - center;
        float vm = length(vd);
        if (vm > 0.00001) cur_dir = vd / vm;
    }

    // ── Colour (shared) ──
    vec3 space_col = mix(vec3(0.7, 0.8, 1.0), vec3(0.5, 0.6, 0.9), h2);
    vec3 cell_col  = mix(vec3(0.3, 0.85, 0.4), vec3(0.55, 0.9, 0.3), h2);
    vec3 col = mix(space_col, cell_col, morph);

    // ────────────────────────────────────────────────────────
    // SPACE COMET rendering (fades out with morph)
    // ────────────────────────────────────────────────────────
    float space_weight = 1.0 - smoothstep(0.0, 0.5, morph);
    vec3 comet_result = vec3(0.0);
    if (space_weight > 0.001) {
        // Off-angle tilt for 3D depth
        float tilt_angle = hash(vec2(epoch * 19.3 + ci_seed, 6.0)) * 6.28;
        float tilt_squash = 0.2 + hash(vec2(epoch * 23.1 + ci_seed, 7.0)) * 0.3;
        float tc = cos(tilt_angle), ts = sin(tilt_angle);

        vec2 toPixel = uv_a - center;
        float along_t = dot(toPixel, -cur_dir);
        vec2 perpVec = toPixel - along_t * (-cur_dir);
        vec2 tiltedPerp = vec2(perpVec.x * tc + perpVec.y * ts,
                              (-perpVec.x * ts + perpVec.y * tc) * tilt_squash);
        float perp = length(tiltedPerp);

        // Sharp pinpoint head
        float head_d = length(uv_a - center);
        float head_glow = exp(-head_d * head_d / 0.0000008) * 0.8;

        // Thin tail behind the head
        float tail_len = 0.03 + h3 * 0.03;
        float tail = 0.0;
        if (along_t > 0.0 && along_t < tail_len) {
            float tail_fade = exp(-along_t / (tail_len * 0.25));
            float tail_width = 0.0006 + along_t * 0.002;
            tail = exp(-perp * perp / (tail_width * tail_width)) * tail_fade * 0.3;
        }

        float vis_c = smoothstep(0.0, 0.08, raw_phase) * smoothstep(1.0, 0.6, raw_phase);
        comet_result = (head_glow + tail) * vis_c * col;
    }

    // ────────────────────────────────────────────────────────
    // CELL FLAGELLATE rendering (fades in with morph)
    // ────────────────────────────────────────────────────────
    float cell_weight = smoothstep(0.15, 0.6, morph);
    vec3 cell_result = vec3(0.0);
    if (cell_weight > 0.001) {
        // Size variation: 0.3x to 2.5x
        float sizeScale = 0.3 + hash(vec2(epoch * 19.3 + ci_seed, 6.0)) * 2.2;
        float bodyR = mix(0.006, 0.010, morph) * sizeScale;

        // Elongation: round when coasting, stretches during swim strokes
        float elongation = 1.2 + swim_effort * 0.45;

        // Body-local space (major axis = velocity direction)
        float rot_a = atan(cur_dir.y, cur_dir.x);
        float cr = cos(rot_a), sr2 = sin(rot_a);
        vec2 delta = uv_a - center;
        vec2 lp = vec2(
            delta.x * cr + delta.y * sr2,
            -delta.x * sr2 + delta.y * cr
        );

        // Elliptical distance
        float ex = lp.x / (bodyR * elongation);
        float ey = lp.y / bodyR;
        float ed = sqrt(ex * ex + ey * ey);

        // Solid body — holds brightness, sharp-ish edge
        float body = 1.0 - smoothstep(0.55, 1.0, ed);

        // Nucleus near front-center
        float nuc_off = bodyR * elongation * 0.12;
        vec2 nd = lp - vec2(nuc_off, 0.0);
        float nx = nd.x / (bodyR * elongation * 0.45);
        float ny = nd.y / (bodyR * 0.55);
        float nucleus = exp(-(nx * nx + ny * ny) * 3.0) * 0.35;

        float vis_f = smoothstep(0.0, 0.1, raw_phase) * smoothstep(1.0, 0.85, raw_phase);
        vec3 nuc_col = col * 1.6;
        cell_result = (body * 0.55 * col + nucleus * nuc_col) * vis_f;
    }

    // Blend comet → flagellate with morph
    return (comet_result * space_weight + cell_result * cell_weight) * extra_vis;
}

vec3 comet(vec2 uv_a, float t, float aspect, float morph) {
    vec3 result = vec3(0.0);
    for (int ci = 0; ci < 6; ci++) {
        result += cometSingle(uv_a, t, aspect, morph, float(ci) * 73.0, float(ci));
    }
    return result;
}

// ── Supernova ────────────────────────────────────────────
// A distant star randomly explodes every ~60-90 seconds.
// Bright flash → expanding ring → fade to nothing.

vec3 supernova(vec2 uv_a, float t, float aspect, float morph) {
    // Each supernova cycle lasts ~8 seconds, repeats every ~70s
    float cycle = 70.0;
    float duration = 14.0;
    float epoch = floor(t / cycle);
    float local_t = mod(t, cycle);

    // Skip most of the cycle (only active during the burst window)
    if (local_t > duration) return vec3(0.0);

    // Deterministic random position + tilt for this epoch
    float ex = hash(vec2(epoch * 13.7, 1.0));
    float ey = hash(vec2(epoch * 7.3, 2.0));
    vec2 pos = vec2((0.15 + ex * 0.7) * aspect, 0.15 + ey * 0.7);

    // Random tilt angle and eccentricity — viewed from an angle
    float angle = hash(vec2(epoch * 5.1, 3.0)) * 6.28318;
    float tilt  = 0.18 + hash(vec2(epoch * 9.9, 4.0)) * 0.35; // 0.18-0.53 squash
    // Random apparent size (distance) — 0.4 = far/small, 1.0 = near/large
    float scale = 0.4 + hash(vec2(epoch * 11.3, 5.0)) * 0.6;

    // Rotated elliptical distance from center
    vec2 delta = uv_a - pos;
    float ca = cos(angle), sa = sin(angle);
    vec2 rd = vec2(delta.x * ca + delta.y * sa,
                  (-delta.x * sa + delta.y * ca) / tilt);
    float d = length(rd);    // elliptical distance
    float d_raw = length(delta);  // true distance (for core/glow)

    float phase = local_t / duration;  // 0-1 over lifetime

    // Exponential fade — starts dimming immediately, very long tail
    float fade = exp(-phase * 2.5);

    // Bright core flash — brighter when closer
    float core_bright = exp(-phase * 3.5) * 1.2 * scale;
    float core = exp(-d_raw * d_raw / ((0.00001 + phase * 0.00015) * scale)) * core_bright * fade;

    // Expanding ring — size and width scale with distance
    float ring_radius = phase * 0.10 * scale;
    float ring_width = (0.002 + phase * 0.005) * scale;
    float ring = exp(-pow(d - ring_radius, 2.0) / (ring_width * ring_width));
    ring *= fade * fade * 0.8 * scale;

    // Wider dim glow
    float glow = exp(-d_raw * d_raw / ((0.0005 + phase * 0.004) * scale)) * fade * 0.15 * scale;

    // Colour: space (blue→warm) morphs to cell (green→magenta for mitosis)
    vec3 space_core = mix(vec3(0.8, 0.85, 1.0), vec3(1.0, 0.95, 0.9), phase);
    vec3 space_ring = mix(vec3(0.6, 0.7, 1.0), vec3(1.0, 0.5, 0.2), phase);
    vec3 cell_core  = mix(vec3(0.4, 0.9, 0.5), vec3(0.9, 0.9, 0.3), phase);
    vec3 cell_ring  = mix(vec3(0.3, 0.8, 0.6), vec3(0.8, 0.3, 0.7), phase);
    vec3 core_col = mix(space_core, cell_core, morph);
    vec3 ring_col = mix(space_ring, cell_ring, morph);

    return core_col * (core + glow) + ring_col * ring;
}

// ── Oblong clip mask ─────────────────────────────────────
// Returns 0 outside, 1 inside, soft edge at boundary.
// centre: ellipse centre (in uv 0-1 space)
// radii:  half-width, half-height
// angle:  rotation in radians
// edge:   softness of boundary (0 = hard, higher = softer)

float oblongMask(vec2 uv, vec2 centre, vec2 radii, float angle, float edge) {
    vec2 d = uv - centre;
    float c = cos(angle), s = sin(angle);
    vec2 r = vec2(d.x * c + d.y * s, -d.x * s + d.y * c);
    float e = length(r / radii);   // 1.0 at the ellipse boundary
    return 1.0 - smoothstep(1.0 - edge, 1.0 + edge, e);
}

vec3 particlePair(vec2 uv_a, float t, float aspect, float qm) {
    if (qm < 0.01) return vec3(0.0);
    vec3 result = vec3(0.0);
    for (int pi = 0; pi < 4; pi++) {
        float pi_f = float(pi);
        float pi_seed = pi_f * 47.0;
        float cycle = 3.0 + hash(vec2(pi_seed, 80.0)) * 4.0;
        float stagger = hash(vec2(pi_seed, 81.0)) * cycle;
        float local_t = mod(t + stagger, cycle);
        float epoch = floor((t + stagger) / cycle);
        float duration = 0.6 + hash(vec2(epoch * 5.0 + pi_seed, 86.0)) * 0.6;
        if (local_t > duration) continue;
        float phase = local_t / duration;
        float ox = hash(vec2(epoch * 13.7 + pi_seed, 82.0));
        float oy = hash(vec2(epoch * 9.3 + pi_seed, 83.0));
        vec2 origin = vec2((0.1 + ox * 0.8) * aspect, 0.1 + oy * 0.8);
        float R = (0.015 + hash(vec2(epoch * 7.1 + pi_seed, 84.0)) * 0.025) * qm;
        float arc_angle = hash(vec2(epoch * 11.3 + pi_seed, 85.0)) * 6.28318;
        vec2 along = vec2(cos(arc_angle), sin(arc_angle));
        vec2 perp = vec2(-sin(arc_angle), cos(arc_angle));
        float theta = 3.14159 + phase * 2.0 * 3.14159;
        float lx = R * (1.0 + cos(theta));
        float ly = R * sin(theta);
        vec2 e_pos = origin + along * lx + perp * ly;
        vec2 p_pos = origin - along * lx - perp * ly;
        float e_dist = length(uv_a - e_pos);
        float p_dist = length(uv_a - p_pos);
        float dot_size = 0.0000012;
        float electron = exp(-e_dist * e_dist / dot_size);
        float positron = exp(-p_dist * p_dist / dot_size);
        float vis = smoothstep(0.0, 0.06, phase) * smoothstep(1.0, 0.92, phase);
        float o_dist = length(uv_a - origin);
        float flash_t = smoothstep(0.88, 1.0, phase);
        float flash = exp(-o_dist * o_dist / 0.00003) * flash_t * 2.0;
        float create_t = 1.0 - smoothstep(0.0, 0.10, phase);
        float create = exp(-o_dist * o_dist / 0.00002) * create_t * 0.8;
        vec3 e_col = vec3(0.3, 0.5, 1.0);
        vec3 p_col = vec3(1.0, 0.3, 0.3);
        vec3 flash_col = vec3(1.0, 0.95, 0.8);
        result += electron * vis * e_col * 0.7;
        result += positron * vis * p_col * 0.7;
        result += flash * flash_col;
        result += create * flash_col * 0.5;
    }
    return result;
}

// ── Main ─────────────────────────────────────────────────

void main() {
    // Pixelation — quantize screen coords so ALL elements get uniform chunky pixels
    vec2 coords = gl_FragCoord.xy;
    if (u_pixel_size > 1.5) {
        coords = floor(coords / u_pixel_size) * u_pixel_size + u_pixel_size * 0.5;
    }
    vec2 uv = coords / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv_a = vec2(uv.x * aspect, uv.y);
    // Morph: -1 = quantum, 0 = space, +1 = cellular
    float m_raw = u_morph;
    float m = max(0.0, m_raw);   // cell blend (all existing mix(space,cell,m) just work)
    float qm = max(0.0, -m_raw); // quantum blend

    // Time scale: space is slow/vast, cell is faster/twitchier, quantum = space speed
    float t = u_time * mix(1.0, 2.5, m);

    // ── Mouse fluid drift ──
    // Mouse movement pushes the gas; drift is strongest near cursor
    vec2 mouse_a = vec2(u_mouse.x * aspect, u_mouse.y);
    float mouse_dist = length(uv_a - mouse_a);
    // Soft quadratic falloff — strong near cursor, gentle fade at edges
    float influence = smoothstep(0.40, 0.0, mouse_dist);
    influence *= influence;  // square for softer outer falloff
    vec2 flow = -vec2(u_drift.x * aspect, u_drift.y) * influence;

    // ── Black hole / Amoeba ──
    // Space: wide gravitational lens.  Cell: tight amoeba-like displacement.
    vec2 bh_a = vec2(u_blackhole.x * aspect, u_blackhole.y);
    vec2 bh_delta = uv_a - bh_a;
    float bh_dist = length(bh_delta);
    float bh_radius = mix(0.28, 0.09, m);
    float bh_strength = mix(0.20, 0.06, m);
    float bh_inner = mix(0.035, 0.015, m);
    float bh_falloff = smoothstep(bh_radius, 0.0, bh_dist) * smoothstep(0.0, bh_inner, bh_dist);
    vec2 bh_dir = normalize(bh_delta + 0.0001);
    vec2 bh_tangent = vec2(-bh_dir.y, bh_dir.x);
    // Space: inward pull + swirl.  Cell: mostly outward push (displacing surroundings)
    float inward = mix(-0.4, 0.5, m);
    float tangent = mix(0.6, 0.15, m);
    vec2 bh_push = (bh_dir * inward + bh_tangent * tangent) * bh_strength * bh_falloff;

    // Slow autonomous drift — like drifting through space
    vec2 autoDrift = vec2(
        sin(t * 0.011) * 0.02 + t * 0.003,
        cos(t * 0.013) * 0.015 + t * 0.002
    );

    // Parallax: each depth layer gets progressively more mouse/bh warp.
    // depth 0.0 = infinitely far (no warp), 1.0 = closest (full warp).
    // Auto-drift also scales with depth for parallax.
    vec2 fullFlow = flow + bh_push;

    // Lensed star coordinates — Einstein ring effect (space), mild push (cell).
    float lens_mag = mix(0.28, 0.05, m);
    float lens_inner = mix(0.022, 0.012, m);
    float lens_str = lens_mag * smoothstep(bh_radius * 0.8, 0.03, bh_dist)
                              * smoothstep(lens_inner, lens_inner + 0.04, bh_dist);
    // Space: pull inward to rim.  Cell: gentle outward nudge.
    vec2 lens_dir = mix(-0.8, 0.4, m) * bh_dir + mix(0.2, 0.1, m) * bh_tangent;
    vec2 star_warp = lens_dir * lens_str;

    // Star lookup: undistorted grid + black hole lensing + flagellate displacement
    // (expansion/rotation caused grid-cell boundary artifacts)
    vec2 swim_warp = cometWarp(uv_a, t, m, aspect);
    vec2 lensed_uv = uv_a + star_warp + swim_warp;

    // ── Warp drive: radial outward star motion ──
    vec2 warped_uv = lensed_uv;
    if (u_warp > 0.01) {
        vec2 warp_c = vec2(aspect * 0.5, 0.5);
        vec2 to_c = lensed_uv - warp_c;
        float wdist = length(to_c);
        vec2 wdir = to_c / (wdist + 0.001);
        float ws = u_warp * u_warp;
        warped_uv = lensed_uv - wdir * t * ws * (0.15 + wdist * 0.5);
    }

    // Hard occlude: space=dark disc, cell=mostly transparent
    float occ_inner = mix(0.016, 0.006, m);
    float occ_outer = mix(0.022, 0.012, m);
    float bh_occlude = mix(smoothstep(occ_inner, occ_outer, bh_dist), 1.0, m * 0.7);

    // ════════════════════════════════════════════════════════
    // DEPTH 1 — deepest: base void + farthest stars (no parallax)
    // ════════════════════════════════════════════════════════
    // Base: space indigo → cell amber-brown → quantum white-grey
    vec3 base_space = vec3(0.012, 0.010, 0.032);
    vec3 col = mix(base_space, vec3(0.035, 0.028, 0.015), m)
             + (vec3(0.18, 0.18, 0.20) - base_space) * qm;
    // Ultra-faint background dust — very many, barely visible
    // Distant stars — soft, dim, many
    col += starField(warped_uv, t, 200.0, 0.0, 0.985, 0.06, 0.15, m_raw) * bh_occlude;

    // ════════════════════════════════════════════════════════
    // DEPTH 2 — far nebula: large violet/purple cloud, upper-right
    //           oblong clip, slow parallax (20%)
    // ════════════════════════════════════════════════════════
    vec2 w2 = uv_a + fullFlow * 0.2 + autoDrift * 0.2;
    float far_clip = oblongMask(uv, vec2(0.72, 0.65), vec2(0.38, 0.30), 0.3, 0.25);
    float far_neb = fbm(w2 * 2.5 + t * 0.025 + vec2(0.0, 1.3));
    float far_dark = fbm(w2 * 1.8 + t * 0.01 + vec2(9.2, 0.7));
    float far_void = smoothstep(0.3, 0.6, far_dark);
    float neb_fade = 1.0 - qm * 0.95; // clouds nearly vanish in quantum
    col += far_neb * far_void * far_clip * mix(vec3(0.06, 0.02, 0.10), vec3(0.04, 0.08, 0.03), m) * neb_fade;
    col += far_neb * far_neb * far_void * far_clip * mix(vec3(0.06, 0.02, 0.09), vec3(0.03, 0.07, 0.04), m) * neb_fade;

    // Stars between depth 2 and 3
    // Mid stars
    col += starField(warped_uv, t, 150.0, 50.0, 0.988, 0.12, 0.12, m_raw) * bh_occlude;

    // ════════════════════════════════════════════════════════
    // DEPTH 3 — mid nebula: blue/cyan cloud, right side
    //           oblong clip, medium parallax (45%)
    // ════════════════════════════════════════════════════════
    vec2 w3 = uv_a + fullFlow * 0.45 + autoDrift * 0.45;
    float mid_clip = oblongMask(uv, vec2(0.65, 0.40), vec2(0.30, 0.42), -0.25, 0.20);
    float mid_neb1 = fbm(w3 * 4.0 - t * 0.03 + vec2(2.7, 0.0));
    float mid_neb2 = fbm(w3 * 5.5 + t * 0.022 + vec2(7.3, 2.1));
    float mid_void = smoothstep(0.25, 0.55, fbm(w3 * 2.5 + t * 0.012 + vec2(5.1, 3.3)));
    float blue_band = smoothstep(0.35, 0.6, mid_neb1);
    col += blue_band * mid_void * mid_clip * mix(vec3(0.025, 0.05, 0.10), vec3(0.06, 0.09, 0.02), m) * neb_fade;
    float cyan_band = smoothstep(0.5, 0.7, mid_neb2) * mid_void;
    col += cyan_band * mid_clip * mix(vec3(0.02, 0.07, 0.08), vec3(0.08, 0.06, 0.03), m) * neb_fade;

    // Stars between depth 3 and 4
    // Near stars — sharper, brighter
    col += starField(warped_uv, t, 120.0, 100.0, 0.990, 0.20, 0.08, m_raw) * bh_occlude;
    col += brightStar(warped_uv, t, 80.0, 150.0, m_raw) * bh_occlude;

    // ── Deep lightning flash ──
    // Random flashes behind the near clouds, lighting them up from within.
    // Multiple independent flash sources so they overlap naturally.
    for (int fi = 0; fi < 3; fi++) {
        float f_seed = float(fi) * 47.0;
        // Each flash source has its own fast cycle (3-6s) with brief visibility
        float f_cycle = 3.0 + hash(vec2(f_seed, 91.0)) * 3.0;
        float f_epoch = floor(t / f_cycle);
        float f_local = mod(t, f_cycle);
        // Only flash for ~0.15s — a quick pop
        float f_dur = 0.12 + hash(vec2(f_epoch + f_seed, 92.0)) * 0.08;
        if (f_local < f_dur) {
            // Random position
            float fx = hash(vec2(f_epoch * 13.3 + f_seed, 93.0));
            float fy = hash(vec2(f_epoch * 9.7 + f_seed, 94.0));
            vec2 f_pos = vec2(fx * aspect, fy);
            float f_dist = length(uv_a - f_pos);
            // Soft glow radius — illuminates a patch of cloud
            float f_radius = 0.04 + hash(vec2(f_epoch + f_seed, 95.0)) * 0.06;
            float f_glow = exp(-f_dist * f_dist / (f_radius * f_radius));
            // Sharp attack, fast decay within the flash window
            float f_phase = f_local / f_dur;
            float f_bright = exp(-f_phase * 6.0) * 0.12;
            // Colour: space=cool violet flash, cell=warm amber bioluminescence
            vec3 f_col = mix(vec3(0.3, 0.25, 0.6), vec3(0.5, 0.4, 0.1), m);
            col += f_glow * f_bright * f_col * neb_fade;
        }
    }

    // ════════════════════════════════════════════════════════
    // DEPTH 4 — near nebula: rose/gold filaments, left side
    //           oblong clip, strong parallax (75%)
    // ════════════════════════════════════════════════════════
    vec2 w4 = uv_a + fullFlow * 0.75 + autoDrift * 0.75;
    float near_clip = oblongMask(uv, vec2(0.25, 0.50), vec2(0.28, 0.35), 0.15, 0.18);
    float near_neb1 = fbm(w4 * 5.0 - t * 0.02 + vec2(1.9, 5.8));
    float near_neb2 = fbm(w4 * 3.0 + t * 0.018 + vec2(3.6, 8.4));
    float near_void = smoothstep(0.3, 0.6, fbm(w4 * 2.0 + t * 0.008 + vec2(7.7, 1.2)));
    float rose = smoothstep(0.5, 0.72, near_neb1) * near_void * near_clip;
    col += rose * mix(vec3(0.10, 0.03, 0.04), vec3(0.05, 0.10, 0.06), m) * neb_fade;
    float gold = smoothstep(0.6, 0.8, near_neb2) * near_void * near_clip;
    col += gold * mix(vec3(0.08, 0.06, 0.01), vec3(0.09, 0.08, 0.02), m) * neb_fade;

    // Black hole → Amoeba (cell) / Zoomed nucleus (quantum)
    // Quantum zooms in: disc and ring scale up as we approach the nucleus
    float disc_radius = mix(0.02, 0.045, m);
    float disc_edge   = mix(0.014, 0.035, m);
    // Amoeba: irregular edge from noise (wobbles over time)
    float edge_noise = m > 0.05
        ? fbm(vec2(atan(bh_delta.y, bh_delta.x) * 2.5 + t * 0.3, bh_dist * 15.0 + t * 0.1))
          * 0.012 * m
        : 0.0;
    float bh_disc = smoothstep(disc_radius + edge_noise, disc_edge + edge_noise, bh_dist);
    // Space: dark (95%). Cell: translucent (20%). Quantum: dark again (space-like)
    float occlude_str = mix(0.95, 0.20, m);
    col *= 1.0 - bh_disc * occlude_str;
    // Cell body interior — soft cytoplasm glow
    if (m > 0.01) {
        float cyto = fbm(uv_a * 20.0 + t * 0.08) * bh_disc * m;
        col += cyto * 0.06 * vec3(0.25, 0.65, 0.35);
        float org = fbm(uv_a * 50.0 + t * 0.15) * bh_disc * m;
        col += smoothstep(0.55, 0.7, org) * 0.04 * vec3(0.5, 0.8, 0.3);
    }
    // Bright nucleus
    float nuc_r = mix(0.004, 0.014, m);
    float nuc_glow = exp(-bh_dist * bh_dist / (nuc_r * nuc_r));
    vec3 nuc_col_space = vec3(0.15, 0.10, 0.30);
    vec3 nuc_col_cell  = vec3(0.45, 0.95, 0.55);
    vec3 nuc_col_quantum = vec3(0.35, 0.25, 0.70);
    vec3 nuc_col = mix(nuc_col_space, nuc_col_cell, m) + nuc_col_quantum * qm;
    float nuc_bright = mix(0.15, 0.70, m) + qm * 0.50;
    col += nuc_glow * nuc_col * nuc_bright;
    // Ring: accretion ring → cell membrane
    float ring_pos = mix(0.02, 0.045, m);
    float ring_w   = mix(0.00006, 0.0003, m);
    float ring = exp(-pow(bh_dist - ring_pos - edge_noise, 2.0) / ring_w) * mix(0.12, 0.25, m);
    // Quantum: brighter ring
    ring += exp(-pow(bh_dist - ring_pos, 2.0) / (ring_w + 0.00008 * qm)) * qm * 0.20;
    vec3 ring_col_space = vec3(0.3, 0.2, 0.6);
    vec3 ring_col_cell  = vec3(0.25, 0.75, 0.40);
    vec3 ring_col_quantum = vec3(0.4, 0.3, 0.8);
    col += ring * (mix(ring_col_space, ring_col_cell, m) + ring_col_quantum * qm);

    // Faint edge glows
    col += u_fire  * exp(-uv.x         * 14.0) * 0.006;
    col += u_water * exp(-(1.0 - uv.x) * 14.0) * 0.006;
    col += u_earth * exp(-uv.y         * 14.0) * 0.006;
    col += u_air   * exp(-(1.0 - uv.y) * 14.0) * 0.006;

    // Supernova — rare distant explosion
    col += supernova(uv_a, t, aspect, m);

    // Comet / flagellate
    col += comet(uv_a, t, aspect, m);

    // Particle pair annihilation (quantum)
    col += particlePair(uv_a, t, aspect, qm);

    // Vignette + tone-map
    float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    col *= smoothstep(0.0, 0.04, vig * 16.0);
    col = col / (1.0 + col);

    // ════════════════════════════════════════════════════════
    // DEPTH 5 — foreground stars (in front of everything, full parallax)
    // ════════════════════════════════════════════════════════
    col += brightStar(warped_uv, t, 60.0, 200.0, m_raw) * bh_occlude;

    gl_FragColor = vec4(col, 1.0);
}
`;

// ── Modes ───────────────────────────────────────────────────────────────────

const MODES = ['off', 'swirl', 'forge'];
const STORAGE_KEY = 'wizardgame_bg_mode';

let canvas   = null;
let gl       = null;
let rafId    = null;
let running  = false;
let startTime = 0;
let currentMode = 'off';

// Mouse interaction state
let mouseX = 0.5, mouseY = 0.5;           // smoothed position
let targetMouseX = 0.5, targetMouseY = 0.5; // raw target
let driftX = 0, driftY = 0;               // accumulated flow displacement
let blackholeX = 0.5, blackholeY = 0.5;  // autonomous black hole position
let morphValue = 0.0;                    // -1=quantum, 0=space, +1=cell
let morphManual = null;                  // if set, overrides auto-cycle
let resolutionScale = 0.25;              // 0.25-1.0 render scale for forge
let warpValue = 0;                       // 0=normal, >0=hyperspace

const effects = {};

// ── Configs ─────────────────────────────────────────────────────────────────

export const swirlConfig = {
  spinRotation: -2.0,
  spinSpeed:     7.0,
  spinAmount:    0.25,
  spinEase:      1.0,
  isRotate:      false,
  contrast:      2.5,
  lighting:      0.4,
  pixelFilter:   745.0,
  cornerTL: [0.91, 0.30, 0.24, 1.0],   // Fire
  cornerTR: [0.68, 0.84, 0.95, 1.0],   // Air
  cornerBL: [0.63, 0.32, 0.18, 1.0],   // Earth
  cornerBR: [0.18, 0.53, 0.76, 1.0],   // Water
  shadow:   [0.06, 0.06, 0.10, 1.0],
};

export const forgeConfig = {
  fire:  [0.90, 0.25, 0.15],
  water: [0.15, 0.45, 0.80],
  earth: [0.65, 0.40, 0.15],
  air:   [0.60, 0.75, 0.90],
};

export const config = swirlConfig;

// ── WebGL helpers ───────────────────────────────────────────────────────────

function compileShader(type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function buildEffect(fragSrc, uniformNames) {
  const vs = compileShader(gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(prog));
    console.error('VS log:', gl.getShaderInfoLog(vs));
    console.error('FS log:', gl.getShaderInfoLog(fs));
    return null;
  }

  const unis = {};
  for (const name of uniformNames) {
    unis[name] = gl.getUniformLocation(prog, name);
  }

  gl.useProgram(prog);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  return { program: prog, uniforms: unis };
}

function buildAllEffects() {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1,
  ]), gl.STATIC_DRAW);

  effects.swirl = buildEffect(FRAG_SWIRL, [
    'u_time', 'u_resolution',
    'u_spin_rotation', 'u_spin_speed', 'u_spin_amount', 'u_spin_ease', 'u_is_rotate',
    'u_contrast', 'u_lighting', 'u_pixel_filter',
    'u_corner_tl', 'u_corner_tr', 'u_corner_bl', 'u_corner_br', 'u_shadow',
  ]);

  effects.forge = buildEffect(FRAG_FORGE, [
    'u_time', 'u_resolution',
    'u_fire', 'u_water', 'u_earth', 'u_air',
    'u_mouse', 'u_drift', 'u_blackhole', 'u_morph', 'u_pixel_size', 'u_warp',
  ]);

  return effects.swirl && effects.forge;
}

// ── Render loop ─────────────────────────────────────────────────────────────

function resize() {
  const dpr = window.devicePixelRatio || 1;
  // Swirl uses its own pixel filter so half-res is fine; forge needs full res
  const scale = currentMode === 'forge' ? 0.75 : 0.5;
  const w = Math.round(window.innerWidth  * dpr * scale);
  const h = Math.round(window.innerHeight * dpr * scale);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width  = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
}

function frameSwirl(t) {
  const e = effects.swirl, u = e.uniforms, c = swirlConfig;
  gl.useProgram(e.program);
  gl.uniform1f(u.u_time, t);
  gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
  gl.uniform1f(u.u_spin_rotation, c.spinRotation);
  gl.uniform1f(u.u_spin_speed, c.spinSpeed);
  gl.uniform1f(u.u_spin_amount, c.spinAmount);
  gl.uniform1f(u.u_spin_ease, c.spinEase);
  gl.uniform1f(u.u_contrast, c.contrast);
  gl.uniform1f(u.u_lighting, c.lighting);
  gl.uniform1f(u.u_pixel_filter, c.pixelFilter);
  gl.uniform1i(u.u_is_rotate, c.isRotate ? 1 : 0);
  gl.uniform4fv(u.u_corner_tl, c.cornerTL);
  gl.uniform4fv(u.u_corner_tr, c.cornerTR);
  gl.uniform4fv(u.u_corner_bl, c.cornerBL);
  gl.uniform4fv(u.u_corner_br, c.cornerBR);
  gl.uniform4fv(u.u_shadow, c.shadow);
}

function frameForge(t) {
  const e = effects.forge, u = e.uniforms, c = forgeConfig;
  gl.useProgram(e.program);
  gl.uniform1f(u.u_time, t);
  gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
  gl.uniform3fv(u.u_fire, c.fire);
  gl.uniform3fv(u.u_water, c.water);
  gl.uniform3fv(u.u_earth, c.earth);
  gl.uniform3fv(u.u_air, c.air);
  gl.uniform2f(u.u_mouse, mouseX, mouseY);
  gl.uniform2f(u.u_drift, driftX, driftY);
  gl.uniform2f(u.u_blackhole, blackholeX, blackholeY);
  gl.uniform1f(u.u_morph, morphValue);
  // Convert resolution scale (0.25-1.0) to pixel size (1.0 at full, up to ~8 at lowest)
  const pixSize = resolutionScale < 0.95 ? Math.round(1.0 / resolutionScale) : 1.0;
  gl.uniform1f(u.u_pixel_size, pixSize);
  gl.uniform1f(u.u_warp, warpValue);
}

function frame(now) {
  if (!running) return;
  resize();

  const t = (now - startTime) / 1000;

  // Smooth mouse and compute velocity
  const prevMX = mouseX, prevMY = mouseY;
  mouseX += (targetMouseX - mouseX) * 0.08;
  mouseY += (targetMouseY - mouseY) * 0.08;
  const velX = mouseX - prevMX;
  const velY = mouseY - prevMY;

  // Accumulate drift from mouse velocity, slow friction for long tail
  // Dampen high-speed input so fast swipes don't overwhelm
  const speed = Math.sqrt(velX * velX + velY * velY);
  const damped = speed > 0 ? Math.min(speed, 0.008) / speed : 0;
  driftX += velX * damped * 2.5;
  driftY += velY * damped * 2.5;
  // Cap total drift magnitude
  const driftMag = Math.sqrt(driftX * driftX + driftY * driftY);
  if (driftMag > 0.06) { driftX *= 0.06 / driftMag; driftY *= 0.06 / driftMag; }
  driftX *= 0.997;
  driftY *= 0.997;

  // Morph: manual slider overrides auto-cycle
  if (morphManual !== null) {
    morphValue = morphManual;
  } else {
    // Auto-cycle: smooth -1→0→+1→0→-1 over ~6 minutes (360s period)
    morphValue = Math.sin(t * 2 * Math.PI / 360);
  }

  // Autonomous black hole — slow Lissajous orbit
  const orbitX = 0.5 + Math.sin(t * 0.031) * 0.32 + Math.sin(t * 0.017) * 0.1;
  const orbitY = 0.5 + Math.cos(t * 0.023) * 0.28 + Math.cos(t * 0.013) * 0.1;
  // Quantum: pull toward screen center
  const qm = Math.max(0, -morphValue);
  blackholeX = orbitX + (0.5 - orbitX) * qm;
  blackholeY = orbitY + (0.5 - orbitY) * qm;

  if (currentMode === 'swirl') frameSwirl(t);
  else if (currentMode === 'forge') frameForge(t);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  rafId = requestAnimationFrame(frame);
}

function start(mode) {
  currentMode = mode;
  running = true;
  canvas.style.display = 'block';
  startTime = performance.now();
  syncSliderVisibility();
  rafId = requestAnimationFrame(frame);
}

function stop() {
  running = false;
  currentMode = 'off';
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  if (canvas) canvas.style.display = 'none';
  syncSliderVisibility();
}

function syncSliderVisibility() {
  const show = currentMode === 'forge';
  const d = show ? 'block' : 'none';
  ['morph-slider', 'morph-label', 'res-slider', 'res-label'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = d;
  });
}

// ── Public API ──────────────────────────────────────────────────────────────

export function initBackground() {
  if (canvas) return;

  canvas = document.createElement('canvas');
  canvas.id = 'bg-effect';
  canvas.style.cssText = `
    position: fixed; inset: 0; width: 100vw; height: 100vh;
    z-index: -1; display: none; pointer-events: none;
    image-rendering: auto;
  `;
  document.body.prepend(canvas);

  gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) { console.warn('WebGL not available — background effects disabled'); return; }
  if (!buildAllEffects()) return;

  window.addEventListener('resize', resize);

  // Track mouse for warp effect (convert to 0-1, flip Y for GL)
  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX / window.innerWidth;
    targetMouseY = 1.0 - e.clientY / window.innerHeight;
  });

  // Morph slider — fixed bottom-left, only visible in forge mode
  const slider = document.createElement('input');
  slider.id = 'morph-slider';
  slider.type = 'range';
  slider.min = '-100';
  slider.max = '100';
  slider.value = '0';
  slider.style.cssText = `
    position: fixed; bottom: 12px; left: 12px; width: 140px;
    z-index: 10; display: none; opacity: 0.6;
    accent-color: #F4D03F;
  `;
  document.body.appendChild(slider);

  const label = document.createElement('span');
  label.id = 'morph-label';
  label.textContent = 'Space';
  label.style.cssText = `
    position: fixed; bottom: 32px; left: 12px;
    z-index: 10; display: none; font-size: 11px;
    color: #8899aa; font-family: inherit;
  `;
  document.body.appendChild(label);

  slider.addEventListener('input', () => {
    const v = parseInt(slider.value) / 100;
    morphManual = v;
    label.textContent = v < -0.3 ? 'Quantum' : v > 0.3 ? 'Cellular' : 'Space';
  });

  // Resolution slider
  const resLabel = document.createElement('span');
  resLabel.id = 'res-label';
  resLabel.textContent = 'Resolution';
  resLabel.style.cssText = `
    position: fixed; bottom: 32px; left: 170px;
    z-index: 10; display: none; font-size: 11px;
    color: #8899aa; font-family: inherit;
  `;
  document.body.appendChild(resLabel);

  const resSlider = document.createElement('input');
  resSlider.id = 'res-slider';
  resSlider.type = 'range';
  resSlider.min = '25';
  resSlider.max = '100';
  resSlider.value = '25';
  resSlider.style.cssText = `
    position: fixed; bottom: 12px; left: 170px; width: 100px;
    z-index: 10; display: none; opacity: 0.6;
    accent-color: #F4D03F;
  `;
  document.body.appendChild(resSlider);

  resSlider.addEventListener('input', () => {
    resolutionScale = parseInt(resSlider.value) / 100;
  });

  let saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const legacy = localStorage.getItem('wizardgame_bg_enabled');
    if (legacy === 'true') saved = 'swirl';
    localStorage.removeItem('wizardgame_bg_enabled');
  }
  if (saved && saved !== 'off') start(saved);
}

export function cycleBackground() {
  const idx = MODES.indexOf(currentMode);
  const next = MODES[(idx + 1) % MODES.length];
  setBackground(next);
  return next;
}

export function setBackground(mode) {
  stop();
  if (mode !== 'off') start(mode);
  localStorage.setItem(STORAGE_KEY, mode);
}

export function getBackgroundMode() {
  return currentMode;
}

export function isBackgroundEnabled() {
  return running;
}

/** Set morph value manually (0=space, 1=cell), or null for auto-cycle */
export function setMorph(value) {
  morphManual = value;
  const s = document.getElementById('morph-slider');
  if (s && value !== null) s.value = String(Math.round(value * 100));
}

/** @returns {number} current morph value 0-1 */
export function getMorph() { return morphValue; }

export function toggleBackground(force) {
  if (typeof force === 'boolean') {
    setBackground(force ? 'swirl' : 'off');
    return force;
  }
  cycleBackground();
  return running;
}

/** Set warp intensity (0=normal, 0-1=hyperspace). Forces forge mode while active. */
export function setWarp(v) {
  warpValue = v;
  // Ensure forge is running while warp is active
  if (v > 0 && currentMode !== 'forge') {
    if (!running) {
      currentMode = 'forge';
      running = true;
      canvas.style.display = 'block';
      if (!startTime) startTime = performance.now();
      syncSliderVisibility();
      rafId = requestAnimationFrame(frame);
    } else {
      // Switch from swirl to forge without resetting time
      currentMode = 'forge';
    }
  }
}

/** @returns {number} current warp value */
export function getWarp() { return warpValue; }
