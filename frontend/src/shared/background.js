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
precision mediump float;

uniform float u_time;
uniform vec2  u_resolution;

uniform vec3 u_fire;       // orb colour — left edge
uniform vec3 u_water;      // orb colour — right edge
uniform vec3 u_earth;      // orb colour — bottom edge
uniform vec3 u_air;        // orb colour — top edge

uniform vec3 u_metal;      // reaction: fire + earth
uniform vec3 u_electric;   // reaction: fire + air
uniform vec3 u_plant;      // reaction: water + earth
uniform vec3 u_ice;        // reaction: water + air

uniform float u_orb_size;
uniform float u_reaction_intensity;

// ── Noise ────────────────────────────────────────────────

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(41.1, 289.3))) * 21718.345);
}

float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.877, 0.479, -0.479, 0.877);
    for (int i = 0; i < 4; i++) {
        v += a * vnoise(p);
        p = rot * p * 2.0;
        a *= 0.5;
    }
    return v;
}

// ── Orb trajectories ────────────────────────────────────
// Each orb drifts in slow Lissajous-like curves biased toward
// its origin edge but reaching past centre so pairs can meet.

vec2 orbPos(int id, float t) {
    if (id == 0) {
        return vec2(
            0.32 + sin(t * 0.037) * 0.28 + sin(t * 0.019 + 1.0) * 0.08,
            0.50 + cos(t * 0.049) * 0.35 + sin(t * 0.023 + 2.0) * 0.06);
    } else if (id == 1) {
        return vec2(
            0.68 + sin(t * 0.043) * 0.28 + sin(t * 0.021 + 3.0) * 0.08,
            0.50 + cos(t * 0.039) * 0.35 + sin(t * 0.027 + 4.0) * 0.06);
    } else if (id == 2) {
        return vec2(
            0.50 + sin(t * 0.051) * 0.35 + sin(t * 0.017 + 5.0) * 0.06,
            0.32 + cos(t * 0.041) * 0.28 + sin(t * 0.025 + 6.0) * 0.08);
    } else {
        return vec2(
            0.50 + sin(t * 0.033) * 0.35 + sin(t * 0.029 + 7.0) * 0.06,
            0.68 + cos(t * 0.047) * 0.28 + sin(t * 0.015 + 8.0) * 0.08);
    }
}

// ── Orb glow (energy ball) ──────────────────────────────
// Bright white-hot core → coloured body → soft halo

vec3 orbGlow(vec2 pixel, vec2 centre, vec3 colour, float r, float t, float seed) {
    float d = length(pixel - centre);

    float core = exp(-d * d / (r * r * 0.10)) * 0.20;   // hot white centre
    float body = exp(-d * d / (r * r * 0.55)) * 0.10;   // coloured mid
    float halo = exp(-d * d / (r * r * 3.00)) * 0.035;  // wide glow

    float pulse = 0.85 + 0.15 * sin(t * 0.4 + seed * 2.3);
    float surf  = 0.85 + 0.15 * vnoise(pixel * 18.0 + t * 0.12 + seed * 10.0);

    return (colour * (body + halo) * surf + vec3(core * 0.7)) * pulse;
}

// ── Reaction between two orbs ───────────────────────────
// 1. Tendril — faint energy arc connecting orbs as they approach
// 2. Bloom  — bright flash at midpoint when they touch

vec3 reaction(vec2 pixel, vec2 pA, vec2 pB, vec3 rCol, float t, float ri) {
    float dist = length(pA - pB);
    vec3 result = vec3(0.0);

    // Tendril (appears when orbs drift within range)
    float tp = smoothstep(0.45, 0.10, dist);
    if (tp > 0.0) {
        vec2 ab = pB - pA;
        float seg2 = dot(ab, ab);
        if (seg2 > 0.0001) {
            float proj  = clamp(dot(pixel - pA, ab) / seg2, 0.0, 1.0);
            float seg_d = length(pixel - (pA + proj * ab));
            float w     = 0.005 + tp * 0.004;
            float glow  = exp(-seg_d * seg_d / (w * w)) * tp * 0.18;
            glow *= 0.7 + 0.3 * vnoise(vec2(proj * 8.0, t * 0.4));
            result += rCol * glow;
        }
    }

    // Bloom (peaks when orbs nearly overlap)
    float bp = smoothstep(0.25, 0.01, dist);
    if (bp > 0.0) {
        vec2 mid   = (pA + pB) * 0.5;
        float rd   = length(pixel - mid);
        float br   = 0.012 + bp * 0.055;
        float bloom = exp(-rd * rd / (br * br)) * bp;
        float spark = 0.7 + 0.3 * sin(t * 2.2 + fbm(pixel * 10.0) * 5.0);
        result += rCol * bloom * spark;
    }

    return result * ri;
}

// ── Main ─────────────────────────────────────────────────

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv_a = vec2(uv.x * aspect, uv.y);
    float t = u_time;

    // ── Deep void (purple/blue nebula) ──
    // Slow-drifting large-scale nebula clouds
    float neb1 = fbm(uv_a * 3.0 + t * 0.012 + vec2(0.0, 1.3));
    float neb2 = fbm(uv_a * 5.0 - t * 0.009 + vec2(2.7, 0.0));
    float neb3 = fbm(uv_a * 1.8 + t * 0.007 + vec2(4.1, 3.2));

    // Base void colour — deep indigo
    vec3 col = vec3(0.015, 0.012, 0.040);

    // Layer 1: broad purple wash
    col += neb1 * vec3(0.06, 0.02, 0.10);

    // Layer 2: blue wisps drifting the other way
    col += neb2 * vec3(0.02, 0.04, 0.09);

    // Layer 3: very slow, large-scale violet glow
    col += neb3 * neb3 * vec3(0.08, 0.03, 0.12);

    // Stars
    vec2 sc = floor(uv_a * 200.0);
    float sr = hash21(sc);
    float star = step(0.991, sr);
    float tw = 0.3 + 0.7 * sin(t * 0.25 * (1.0 + sr * 2.0) + sr * 6.28);
    col += star * tw * 0.14 * vec3(0.65, 0.70, 1.0);

    // Faint edge glows (whisper of element origin)
    col += u_fire  * exp(-uv.x         * 14.0) * 0.006;
    col += u_water * exp(-(1.0 - uv.x) * 14.0) * 0.006;
    col += u_earth * exp(-uv.y         * 14.0) * 0.006;
    col += u_air   * exp(-(1.0 - uv.y) * 14.0) * 0.006;

    // ── Orb positions ──
    vec2 p0 = orbPos(0, t);  // fire
    vec2 p1 = orbPos(1, t);  // water
    vec2 p2 = orbPos(2, t);  // earth
    vec2 p3 = orbPos(3, t);  // air

    // Aspect-correct for circular distance calcs
    vec2 a0 = vec2(p0.x * aspect, p0.y);
    vec2 a1 = vec2(p1.x * aspect, p1.y);
    vec2 a2 = vec2(p2.x * aspect, p2.y);
    vec2 a3 = vec2(p3.x * aspect, p3.y);

    // ── Orb glows ──
    float r = u_orb_size;
    col += orbGlow(uv_a, a0, u_fire,  r, t, 0.0);
    col += orbGlow(uv_a, a1, u_water, r, t, 1.0);
    col += orbGlow(uv_a, a2, u_earth, r, t, 2.0);
    col += orbGlow(uv_a, a3, u_air,   r, t, 3.0);

    // ── Reactions (6 element pairs) ──
    float ri = u_reaction_intensity;
    col += reaction(uv_a, a0, a2, u_metal,    t, ri);          // fire+earth → metal
    col += reaction(uv_a, a0, a3, u_electric, t, ri);          // fire+air   → electric
    col += reaction(uv_a, a1, a2, u_plant,    t, ri);          // water+earth→ plant
    col += reaction(uv_a, a1, a3, u_ice,      t, ri);          // water+air  → ice
    col += reaction(uv_a, a0, a1, mix(u_fire,  u_water, 0.5), t, ri * 0.35); // fire+water
    col += reaction(uv_a, a2, a3, mix(u_earth, u_air,   0.5), t, ri * 0.35); // earth+air

    // Vignette
    float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    col *= smoothstep(0.0, 0.04, vig * 16.0);

    // Tone-map (prevent clipping, keep it dark)
    col = col / (1.0 + col);

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
  fire:     [0.90, 0.25, 0.15],
  water:    [0.15, 0.45, 0.80],
  earth:    [0.65, 0.40, 0.15],
  air:      [0.60, 0.75, 0.90],
  metal:    [0.95, 0.80, 0.25],
  electric: [0.95, 0.92, 0.50],
  plant:    [0.20, 0.75, 0.30],
  ice:      [0.70, 0.92, 1.00],
  orbSize:            0.07,
  reactionIntensity:  1.5,
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
    'u_metal', 'u_electric', 'u_plant', 'u_ice',
    'u_orb_size', 'u_reaction_intensity',
  ]);

  return effects.swirl && effects.forge;
}

// ── Render loop ─────────────────────────────────────────────────────────────

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(window.innerWidth  * dpr * 0.5);
  const h = Math.round(window.innerHeight * dpr * 0.5);
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
  gl.uniform3fv(u.u_metal, c.metal);
  gl.uniform3fv(u.u_electric, c.electric);
  gl.uniform3fv(u.u_plant, c.plant);
  gl.uniform3fv(u.u_ice, c.ice);
  gl.uniform1f(u.u_orb_size, c.orbSize);
  gl.uniform1f(u.u_reaction_intensity, c.reactionIntensity);
}

function frame(now) {
  if (!running) return;
  resize();
  const t = (now - startTime) / 1000;

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
  rafId = requestAnimationFrame(frame);
}

function stop() {
  running = false;
  currentMode = 'off';
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  if (canvas) canvas.style.display = 'none';
}

// ── Public API ──────────────────────────────────────────────────────────────

export function initBackground() {
  if (canvas) return;

  canvas = document.createElement('canvas');
  canvas.id = 'bg-effect';
  canvas.style.cssText = `
    position: fixed; inset: 0; width: 100%; height: 100%;
    z-index: -1; display: none; pointer-events: none;
  `;
  document.body.prepend(canvas);

  gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) { console.warn('WebGL not available — background effects disabled'); return; }
  if (!buildAllEffects()) return;

  window.addEventListener('resize', resize);

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

export function toggleBackground(force) {
  if (typeof force === 'boolean') {
    setBackground(force ? 'swirl' : 'off');
    return force;
  }
  cycleBackground();
  return running;
}
