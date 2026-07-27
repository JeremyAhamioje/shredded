'use client';
// ---------------------------------------------------------------------------
//  WebGLCycleCard
// ---------------------------------------------------------------------------
//  Same in-shader "showcase lighting" as WebGLHoverCard (tinted spotlight,
//  grounded contact shadow, rim light, moving sheen) for transparent product
//  cutouts — but instead of a FRONT<->BACK flip it CYCLES through the
//  product's images while hovered ("hover till next image"), crossfading each.
//
//  Because the studio cutouts are fairly low-res, we (a) contain-fit so they
//  render near 1:1 rather than being blown up, and (b) apply a light in-shader
//  unsharp mask to crisp the edges.
//
//  Props:  images = [url, ...]   transparent product cutouts (>= 1)
//          hex    = '#rrggbb'    tint for the lighting
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexA, uTexB;
uniform float uHasA, uHasB, uAspectA, uAspectB, uProgress, uHover, uTime;
uniform vec2  uMouse, uRes;
uniform vec3  uColor;

float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

vec4 sampleFit(sampler2D tex, float aspect, float has, vec2 uv, vec2 offset){
  if (has < 0.5) return vec4(0.0);
  float qa = uRes.x / uRes.y;
  vec2 c = uv - vec2(0.5, 0.545);
  if (qa > aspect) c.x *= qa / aspect; else c.y *= aspect / qa;
  c /= 0.88;                                   // product occupies ~88%
  vec2 tuv = c + 0.5 + offset;
  if (tuv.x < 0.0 || tuv.x > 1.0 || tuv.y < 0.0 || tuv.y > 1.0) return vec4(0.0);
  return texture2D(tex, tuv);
}

// crossfaded product (A -> B) with a small parallax slide
vec4 product(vec2 uv, vec2 par){
  vec2 slideA = vec2( uProgress * 0.045, 0.0);
  vec2 slideB = vec2(-(1.0 - uProgress) * 0.045, 0.0);
  vec4 a = sampleFit(uTexA, uAspectA, uHasA, uv, par * 1.0 + slideA);
  vec4 b = sampleFit(uTexB, uAspectB, uHasB, uv, par * 1.4 + slideB);
  return mix(a, b, uProgress);
}

void main(){
  vec2 uv = vUv;
  vec2 par = uMouse * 0.012;

  // backdrop: tinted spotlight + vignette + faint floor + de-band grain
  vec2 lp = vec2(0.5 + uMouse.x * 0.10, 0.34);
  float d = distance(uv, lp);
  vec3 glow = mix(uColor * 0.30 + 0.02, vec3(0.015), smoothstep(0.0, 0.95, d));
  float vig = smoothstep(1.20, 0.30, distance(uv, vec2(0.5)));
  vec3 bg = glow * (0.45 + 0.55 * vig);
  bg += vec3(0.018) * smoothstep(0.0, 0.55, uv.y);
  bg += (hash(uv * uRes) - 0.5) * 0.02;

  // neighbour taps (reused for sharpen + rim)
  vec2 px = 1.4 / uRes;
  vec4 p0 = product(uv, par);
  vec4 pL = product(uv - vec2(px.x, 0.0), par);
  vec4 pR = product(uv + vec2(px.x, 0.0), par);
  vec4 pU = product(uv - vec2(0.0, px.y), par);
  vec4 pD = product(uv + vec2(0.0, px.y), par);

  // grounded contact shadow
  float presence = product(vec2(0.5, 0.52), vec2(0.0)).a;
  vec2 sc = (uv - vec2(0.5, 0.135));
  sc.x /= 0.32; sc.y /= 0.055;
  float ground = (1.0 - clamp(dot(sc, sc), 0.0, 1.0));
  bg *= 1.0 - smoothstep(0.0, 1.0, ground) * 0.6 * presence;

  // very light unsharp — just a hint of edge definition, gentle enough to
  // leave faces undistorted (sharpening was too aggressive before).
  vec4 prod = p0;
  vec3 hp = p0.rgb * 4.0 - pL.rgb - pR.rgb - pU.rgb - pD.rgb;
  prod.rgb = clamp(prod.rgb + hp * 0.04 * p0.a, 0.0, 1.0);

  // moving specular sheen while hovered
  if (uHover > 0.001){
    float band = uv.x + uv.y * 0.35 - fract(uTime * 0.28) * 2.2 + 0.6;
    float sheen = smoothstep(0.05, 0.0, abs(band)) * uHover * 0.45;
    prod.rgb += sheen * prod.a;
  }

  vec3 col = bg * (1.0 - prod.a) + prod.rgb;

  // tinted rim light along the silhouette edge
  float edge = clamp((abs(p0.a - pR.a) + abs(p0.a - pD.a)) * 1.4, 0.0, 1.0);
  col += mix(vec3(1.0), uColor, 0.45) * edge * 0.5;

  gl_FragColor = vec4(col, 1.0);
}`;

function hexToRgb(hex) {
  const h = (hex || '#888888').replace('#', '');
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}
function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error('[cycle shader]', gl.getShaderInfoLog(s)); return null; }
  return s;
}

const STEP_MS = 750;   // dwell before advancing to the next image while hovered

export default function WebGLCycleCard({ images = [], hex = '#888888' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [supported, setSupported] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [idx, setIdx] = useState(0);
  const [active, setActive] = useState(false); // only hold a GL context near the viewport

  // Mount/unmount the WebGL context based on proximity to the viewport, so a
  // page with many cards never exceeds the browser's ~16 live-context limit.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '350px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
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
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { setSupported(false); return; }
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {};
    ['uTexA', 'uTexB', 'uHasA', 'uHasB', 'uAspectA', 'uAspectB', 'uProgress', 'uHover', 'uTime', 'uMouse', 'uColor', 'uRes']
      .forEach((n) => { u[n] = gl.getUniformLocation(program, n); });
    gl.uniform1i(u.uTexA, 0); gl.uniform1i(u.uTexB, 1);

    const st = {
      gl, program, u, quad,
      textures: [],                     // { tex, aspect, loaded }
      cur: 0, nxt: 0, progress: 0, phase: 'idle', stepAt: 0,
      hover: 0, hoverTarget: 0,
      mouse: { x: 0, y: 0 }, mouseT: { x: 0, y: 0 },
      color: hexToRgb(hex),
      running: false, inView: true, destroyed: false, t0: performance.now(),
    };
    sceneRef.current = st;

    const resize = () => {
      const r = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      kick();
    };
    const ro = new ResizeObserver(resize); ro.observe(container); resize();
    const io = new IntersectionObserver(([e]) => { st.inView = e.isIntersecting; if (e.isIntersecting) kick(); }, { threshold: 0.05 });
    io.observe(container);

    function draw() {
      if (st.destroyed) return;
      const now = performance.now();
      const A = st.textures[st.cur], B = st.textures[st.nxt];
      gl.useProgram(program);
      gl.uniform1f(u.uProgress, st.progress);
      gl.uniform1f(u.uHover, st.hover);
      gl.uniform1f(u.uTime, (now - st.t0) / 1000);
      gl.uniform2f(u.uMouse, st.mouse.x, st.mouse.y);
      gl.uniform3f(u.uColor, st.color[0], st.color[1], st.color[2]);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uHasA, A && A.loaded ? 1 : 0);
      gl.uniform1f(u.uHasB, B && B.loaded ? 1 : 0);
      gl.uniform1f(u.uAspectA, A ? A.aspect : 1);
      gl.uniform1f(u.uAspectB, B ? B.aspect : 1);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A ? A.tex : null);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, B ? B.tex : null);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop() {
      if (st.destroyed) return;
      const now = performance.now();
      const N = st.textures.length;

      // decide transitions
      if (st.phase === 'idle') {
        if (st.hoverTarget > 0.5 && N > 1 && now - st.stepAt > STEP_MS) {
          const n = (st.cur + 1) % N;
          if (st.textures[n] && st.textures[n].loaded) { st.nxt = n; st.progress = 0; st.phase = 'fade'; }
          else st.stepAt = now; // wait for it to load
        } else if (st.hoverTarget < 0.5 && st.cur !== 0) {
          if (st.textures[0] && st.textures[0].loaded) { st.nxt = 0; st.progress = 0; st.phase = 'fade'; }
        }
      }
      if (st.phase === 'fade') {
        st.progress += (1 - st.progress) * 0.09;
        if (st.progress > 0.992) { st.cur = st.nxt; st.progress = 0; st.phase = 'idle'; st.stepAt = now; setIdx(st.cur); }
      }

      // ease hover + mouse
      st.hover += (st.hoverTarget - st.hover) * 0.12;
      st.mouse.x += (st.mouseT.x - st.mouse.x) * 0.10;
      st.mouse.y += (st.mouseT.y - st.mouse.y) * 0.10;

      draw();

      const active = st.phase === 'fade' || st.hover > 0.01 || st.cur !== 0 ||
        Math.abs(st.mouseT.x - st.mouse.x) > 0.001 || Math.abs(st.mouseT.y - st.mouse.y) > 0.001;
      if (active) st.raf = requestAnimationFrame(loop);
      else { st.running = false; }
    }
    function kick() { if (st.running || st.destroyed || !st.inView) return; st.running = true; st.raf = requestAnimationFrame(loop); }
    st.kick = kick;

    return () => {
      st.destroyed = true; cancelAnimationFrame(st.raf);
      ro.disconnect(); io.disconnect();
      st.textures.forEach((t) => t.tex && gl.deleteTexture(t.tex));
      gl.deleteBuffer(quad); gl.deleteProgram(program);
      sceneRef.current = null;
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // (re)load textures when the image set changes (or the context (re)mounts)
  useEffect(() => {
    const st = sceneRef.current;
    if (!st) return;
    st.color = hexToRgb(hex);
    st.cur = 0; st.nxt = 0; st.progress = 0; st.phase = 'idle'; setIdx(0);
    const gl = st.gl;
    st.textures = images.map((url) => {
      const slot = { tex: gl.createTexture(), aspect: 1, loaded: false };
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (st.destroyed) return;
        gl.bindTexture(gl.TEXTURE_2D, slot.tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        slot.aspect = img.width / img.height; slot.loaded = true;
        st.kick && st.kick();
      };
      img.src = url;
      return slot;
    });
    st.kick && st.kick();
  }, [images, hex, active]);

  const enter = () => { const st = sceneRef.current; setHovered(true); if (st) { st.hoverTarget = 1; st.stepAt = performance.now(); st.kick && st.kick(); } };
  const leave = () => { const st = sceneRef.current; setHovered(false); if (st) { st.hoverTarget = 0; st.mouseT = { x: 0, y: 0 }; st.kick && st.kick(); } };
  const move = (e) => {
    const st = sceneRef.current; if (!st) return;
    const r = containerRef.current.getBoundingClientRect();
    st.mouseT.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    st.mouseT.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    st.kick && st.kick();
  };

  if (!supported) {
    return (
      <div ref={containerRef} onMouseEnter={enter} onMouseLeave={leave}
           className="relative w-full h-full overflow-hidden"
           style={{ background: `radial-gradient(60% 55% at 50% 34%, ${hex}30, #050505 80%)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt="" className="absolute inset-0 w-full h-full object-contain p-6" />
      </div>
    );
  }

  return (
    <div ref={containerRef} onMouseEnter={enter} onMouseLeave={leave} onMouseMove={move} className="relative w-full h-full">
      {active ? (
        <canvas ref={canvasRef} className="block w-full h-full" />
      ) : (
        // lightweight static poster while the GL context isn't mounted
        <div className="absolute inset-0" style={{ background: `radial-gradient(62% 55% at 50% 40%, ${hex}26, #060606 80%)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0]} alt="" className="absolute inset-0 w-full h-full object-contain p-3" />
        </div>
      )}
      {images.length > 1 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/35'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
