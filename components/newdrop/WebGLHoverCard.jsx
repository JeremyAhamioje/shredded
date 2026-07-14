'use client';
// ---------------------------------------------------------------------------
//  WebGLHoverCard
// ---------------------------------------------------------------------------
//  A dependency-free WebGL1 canvas that showcases one product colorway.
//
//   • Crossfades  FRONT -> BACK  on hover (dissolve + slight parallax slide).
//   • Generates the backdrop in-shader: a colorway-tinted spotlight + vignette,
//     so your transparent (no-background) product art gets "showcase lighting".
//   • Adds a grounded contact shadow, a moving specular sheen on hover, and a
//     tinted rim light along the silhouette edge.
//   • Renders on-demand (rAF only while animating / hovered) and pauses when
//     scrolled out of view, so many cards can coexist cheaply.
//   • Falls back to a CSS crossfade if WebGL is unavailable.
//
//  Props:
//     angles  = { front, back, side? }   image URLs (or data URIs)
//     hex     = '#rrggbb'                colorway color (tints the lighting)
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from 'react';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;

uniform sampler2D uTexA;   // rest angle (premultiplied alpha)
uniform sampler2D uTexB;   // hover angle
uniform float uHasA;
uniform float uHasB;
uniform float uAspectA;
uniform float uAspectB;
uniform float uProgress;   // 0 = A, 1 = B (eased)
uniform float uHover;      // 0..1 hover amount
uniform float uTime;
uniform vec2  uMouse;      // -1..1
uniform vec3  uColor;      // colorway rgb 0..1
uniform vec2  uRes;        // drawing buffer px

float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

// Contain-fit sample of a transparent product image, premultiplied.
vec4 sampleFit(sampler2D tex, float aspect, float has, vec2 uv, vec2 offset){
  if (has < 0.5) return vec4(0.0);
  float qa = uRes.x / uRes.y;
  vec2 c = uv - vec2(0.5, 0.545);          // nudge up -> leave floor room
  if (qa > aspect) c.x *= qa / aspect; else c.y *= aspect / qa;
  c /= 0.86;                                // product occupies ~86%
  vec2 tuv = c + 0.5 + offset;
  if (tuv.x < 0.0 || tuv.x > 1.0 || tuv.y < 0.0 || tuv.y > 1.0) return vec4(0.0);
  return texture2D(tex, tuv);
}

// Current (crossfaded) product at uv, with a subtle slide + depth parallax.
vec4 product(vec2 uv, vec2 par){
  vec2 slideA = vec2( uProgress * 0.05, 0.0);
  vec2 slideB = vec2(-(1.0 - uProgress) * 0.05, 0.0);
  vec4 a = sampleFit(uTexA, uAspectA, uHasA, uv, par * 1.0 + slideA);
  vec4 b = sampleFit(uTexB, uAspectB, uHasB, uv, par * 1.7 + slideB);
  return mix(a, b, uProgress);
}

void main(){
  vec2 uv = vUv;
  vec2 par = uMouse * 0.012;

  // ---- backdrop: tinted spotlight + vignette + floor + grain --------------
  vec2 lp = vec2(0.5 + uMouse.x * 0.10, 0.34);
  float d = distance(uv, lp);
  vec3 glow = mix(uColor * 0.30 + 0.02, vec3(0.015), smoothstep(0.0, 0.95, d));
  float vig = smoothstep(1.20, 0.30, distance(uv, vec2(0.5)));
  vec3 bg = glow * (0.45 + 0.55 * vig);
  bg += vec3(0.018) * smoothstep(0.0, 0.55, uv.y);          // faint floor lift
  bg += (hash(uv * uRes) - 0.5) * 0.02;                     // de-banding grain

  // ---- grounded contact shadow -------------------------------------------
  float presence = product(vec2(0.5, 0.52), vec2(0.0)).a;
  vec2 sc = (uv - vec2(0.5, 0.135));
  sc.x /= 0.32; sc.y /= 0.055;
  float ground = (1.0 - clamp(dot(sc, sc), 0.0, 1.0));
  bg *= 1.0 - smoothstep(0.0, 1.0, ground) * 0.6 * presence;

  // ---- product ------------------------------------------------------------
  vec4 prod = product(uv, par);

  // moving specular sheen while hovered
  if (uHover > 0.001) {
    float band = uv.x + uv.y * 0.35 - fract(uTime * 0.28) * 2.2 + 0.6;
    float sheen = smoothstep(0.05, 0.0, abs(band)) * uHover * 0.5;
    prod.rgb += sheen * prod.a;
  }

  vec3 col = bg * (1.0 - prod.a) + prod.rgb;                // premultiplied over

  // tinted rim light along the silhouette edge
  vec2 px = 2.0 / uRes;
  float aC = prod.a;
  float aX = product(uv + vec2(px.x, 0.0), par).a;
  float aY = product(uv + vec2(0.0, px.y), par).a;
  float edge = clamp((abs(aC - aX) + abs(aC - aY)) * 1.4, 0.0, 1.0);
  col += mix(vec3(1.0), uColor, 0.45) * edge * 0.5;

  gl_FragColor = vec4(col, 1.0);
}`;

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('[newdrop shader]', gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function WebGLHoverCard({ angles, hex }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [restAngle, setRestAngle] = useState('front');
  const [supported, setSupported] = useState(true);
  const [hovered, setHovered] = useState(false);

  const angleOrder = useMemo(
    () => ['front', 'side', 'back'].filter((a) => angles && angles[a]),
    [angles]
  );
  // Reveal the back on hover; if a colorway has no back image, reveal the side.
  const hoverAngle =
    restAngle === 'back'
      ? 'front'
      : angles?.back
      ? 'back'
      : angles?.side
      ? 'side'
      : 'front';

  // Reset to front whenever the colorway (angles set) changes.
  useEffect(() => { setRestAngle('front'); }, [angles]);

  // ---- one-time WebGL setup ----------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: true, premultipliedAlpha: false })
      || canvas.getContext('experimental-webgl');
    if (!gl) { setSupported(false); return; }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setSupported(false); return; }
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { setSupported(false); return; }
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {};
    ['uTexA', 'uTexB', 'uHasA', 'uHasB', 'uAspectA', 'uAspectB', 'uProgress',
     'uHover', 'uTime', 'uMouse', 'uColor', 'uRes'].forEach((n) => { u[n] = gl.getUniformLocation(program, n); });
    gl.uniform1i(u.uTexA, 0);
    gl.uniform1i(u.uTexB, 1);

    const st = {
      gl, program, u, quad,
      A: { tex: null, aspect: 1, loaded: false, url: null },
      B: { tex: null, aspect: 1, loaded: false, url: null },
      progress: 0, target: 0, hover: 0,
      mouse: { x: 0, y: 0 }, mouseT: { x: 0, y: 0 },
      color: hexToRgb(hex || '#888888'),
      dpr: 1, cssW: 0, cssH: 0,
      running: false, inView: true, destroyed: false, t0: performance.now(),
    };
    sceneRef.current = st;

    const resize = () => {
      const r = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.dpr = dpr; st.cssW = r.width; st.cssH = r.height;
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      kick();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const io = new IntersectionObserver(
      ([e]) => { st.inView = e.isIntersecting; if (e.isIntersecting) kick(); },
      { threshold: 0.05 }
    );
    io.observe(container);

    function draw() {
      if (st.destroyed) return;
      const now = performance.now();
      gl.useProgram(program);
      gl.uniform1f(u.uProgress, st.progress);
      gl.uniform1f(u.uHover, st.hover);
      gl.uniform1f(u.uTime, (now - st.t0) / 1000);
      gl.uniform2f(u.uMouse, st.mouse.x, st.mouse.y);
      gl.uniform3f(u.uColor, st.color[0], st.color[1], st.color[2]);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uHasA, st.A.loaded ? 1 : 0);
      gl.uniform1f(u.uHasB, st.B.loaded ? 1 : 0);
      gl.uniform1f(u.uAspectA, st.A.aspect);
      gl.uniform1f(u.uAspectB, st.B.aspect);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, st.A.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, st.B.tex);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop() {
      if (st.destroyed) return;
      // ease progress + mouse toward targets
      st.progress += (st.target - st.progress) * 0.12;
      st.hover += ((st.target > 0.5 ? 1 : 0) - st.hover) * 0.12;
      st.mouse.x += (st.mouseT.x - st.mouse.x) * 0.10;
      st.mouse.y += (st.mouseT.y - st.mouse.y) * 0.10;

      draw();

      const settled =
        Math.abs(st.target - st.progress) < 0.001 &&
        Math.abs(st.mouseT.x - st.mouse.x) < 0.001 &&
        Math.abs(st.mouseT.y - st.mouse.y) < 0.001;
      // keep animating while hovered (sheen) or until everything settles
      if (!settled || st.hover > 0.01) {
        st.raf = requestAnimationFrame(loop);
      } else {
        st.progress = st.target; st.hover = st.target > 0.5 ? 1 : 0;
        draw();
        st.running = false;
      }
    }

    function kick() {
      if (st.running || st.destroyed || !st.inView) return;
      st.running = true;
      st.raf = requestAnimationFrame(loop);
    }
    st.kick = kick;

    return () => {
      st.destroyed = true;
      cancelAnimationFrame(st.raf);
      ro.disconnect();
      io.disconnect();
      if (st.A.tex) gl.deleteTexture(st.A.tex);
      if (st.B.tex) gl.deleteTexture(st.B.tex);
      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
      sceneRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- load / swap textures when the colorway or rest angle changes -------
  useEffect(() => {
    const st = sceneRef.current;
    if (!st || !angles) return;
    st.color = hexToRgb(hex || '#888888');

    const load = (url, slot) => {
      if (slot.url === url && slot.loaded) return;
      slot.url = url; slot.loaded = false;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (st.destroyed || slot.url !== url) return;
        const gl = st.gl;
        const tex = slot.tex || gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        slot.tex = tex; slot.aspect = img.width / img.height; slot.loaded = true;
        st.kick && st.kick();
      };
      img.src = url;
    };

    load(angles[restAngle], st.A);
    load(angles[hoverAngle], st.B);
    st.kick && st.kick();
  }, [angles, hex, restAngle, hoverAngle]);

  const enter = () => {
    const st = sceneRef.current;
    setHovered(true);
    if (st) { st.target = 1; st.kick && st.kick(); }
  };
  const leave = () => {
    const st = sceneRef.current;
    setHovered(false);
    if (st) { st.target = 0; st.mouseT = { x: 0, y: 0 }; st.kick && st.kick(); }
  };
  const move = (e) => {
    const st = sceneRef.current;
    if (!st) return;
    const r = containerRef.current.getBoundingClientRect();
    st.mouseT.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    st.mouseT.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    st.kick && st.kick();
  };

  // ---- CSS fallback (no WebGL) -------------------------------------------
  if (!supported) {
    return (
      <div
        ref={containerRef}
        onMouseEnter={enter}
        onMouseLeave={leave}
        className="relative w-full h-full overflow-hidden"
        style={{ background: `radial-gradient(60% 55% at 50% 34%, ${hex}30, #050505 80%)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={angles?.front} alt="" className="absolute inset-0 w-full h-full object-contain p-6 transition-opacity duration-500"
             style={{ opacity: hovered ? 0 : 1 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={angles?.back} alt="" className="absolute inset-0 w-full h-full object-contain p-6 transition-opacity duration-500"
             style={{ opacity: hovered ? 1 : 0 }} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onMouseMove={move}
      className="relative w-full h-full"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* front/back hint */}
      <div className="pointer-events-none absolute top-3 left-3 text-[10px] tracking-[0.2em] uppercase text-white/50">
        {hovered ? hoverAngle : restAngle}
      </div>

      {/* angle dots (only if a side view exists) */}
      {angleOrder.length > 2 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {angleOrder.map((a) => (
            <button
              key={a}
              onClick={(e) => { e.stopPropagation(); setRestAngle(a); }}
              aria-label={a}
              className={`w-2 h-2 rounded-full transition-all ${
                restAngle === a ? 'bg-white scale-125' : 'bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
