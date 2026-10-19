// Chrome title: the big "Home(work)" drawn in WebGL, bursting into ridged chrome streaks
// on load and on touch, then reforming into readable type after 3–5 seconds.
(() => {
  'use strict';
  const door = document.getElementById('door');
  const h1 = door && door.querySelector('h1');
  if (!h1) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // title stays still and readable

  const cv = document.createElement('canvas');
  cv.className = 'chrome-title';
  cv.setAttribute('aria-hidden', 'true');
  const gl = cv.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return;    // no WebGL: plain title remains
  door.insertBefore(cv, door.firstChild);
  h1.classList.add('chromed');                                         // keeps its place, text made invisible

  const VS = 'attribute vec2 p; varying vec2 uv; void main(){ uv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }';
  const FS = `precision highp float;
  uniform sampler2D tex; uniform vec2 size; uniform vec2 c; uniform float A; uniform float time; uniform float fs;
  varying vec2 uv;
  float hash(float x){ return fract(sin(x * 127.1) * 43758.5453); }
  void main(){
    vec2 p = uv * size;
    vec2 d = p - c; float r = length(d) + .001;
    vec2 dir = d / r, perp = vec2(-dir.y, dir.x);
    float ang = atan(d.y, d.x);
    float aa = ang * 22.; float spike = .3 + .7 * mix(hash(floor(aa) + 3.), hash(floor(aa) + 4.), smoothstep(0., 1., fract(aa)));   // uneven ray lengths, softly blended
    vec2 w = vec2(sin(p.y * .05 + time * 1.4), cos(p.x * .043 - time * 1.1)) * A * fs * .1;
    float a = 0., h = 0., wk = 0.;
    for (int i = 0; i < 18; i++) {
      float f = float(i) / 17.;
      vec2 q = c + d * (1. - f * A * .55 * spike) + w;
      q += perp * sin(r * .045 + ang * 3. + time * 1.6) * A * fs * .22 * f;   // broad zigzag along each ray
      vec2 t = q / size;
      float fall = 1. - f * .5;
      vec4 sh = texture2D(tex, t);
      vec4 so = texture2D(tex, t, 3.6);
      a = max(a, sh.r * fall);
      wk = max(wk, sh.g * fall);
      h += so.r * fall;
    }
    h = min(1., h / 18. * 2.4);
    float ridge = .5 + .5 * sin(r * .16 - time * 1.4);
    float hh = h * (1. - A * .45 * ridge) + a * .12;
    vec2 tp = (p + w) / size, ex = vec2(3. / size.x, 0.), ey = vec2(0., 3. / size.y);
    float gx = texture2D(tex, tp + ex, 3.2).r - texture2D(tex, tp - ex, 3.2).r;
    float gy = texture2D(tex, tp + ey, 3.2).r - texture2D(tex, tp - ey, 3.2).r;
    vec2 g = vec2(gx, gy) * 2.2 * (1. - A * .6);
    g += dir * cos(r * .16 - time * 1.4) * A * 1.1 * h;              // the burst's ridges
    g += perp * cos(r * .045 + ang * 3. + time * 1.6) * A * .5 * h;  // and its zigzag
    vec3 n = normalize(vec3(-g, 1.));
    vec3 rv = reflect(vec3(0., 0., -1.), n);
    float b = fract(rv.y * 1.1 + rv.x * .45 + time * .1 + h * .6);
    vec3 dark = vec3(.09, .0, .015), ox = vec3(.36, .02, .06), ivory = vec3(.97, .95, .91), lime = vec3(.878, .996, 0.);
    vec3 env = mix(dark, ox, smoothstep(.0, .22, b));
    env = mix(env, ivory, smoothstep(.32, .46, b) * (1. - smoothstep(.58, .72, b)));
    env = mix(env, lime, smoothstep(.74, .83, b) * (1. - smoothstep(.92, 1., b)) * .85);
    env += pow(max(0., dot(n, normalize(vec3(-.4, .55, 1.)))), 36.) * .9;
    float isWork = smoothstep(.3, .7, wk / max(a, .001));
    vec3 flatc = mix(vec3(.965, .945, .918), lime, isWork);
    vec3 tint = mix(env, env * vec3(.85, 1., .3) + lime * .3, isWork);
    vec3 col = mix(flatc, tint, .32 + .68 * A);
    float alpha = mix(smoothstep(.36, .62, a), smoothstep(.12, .45, max(a, h * .9)), A);
    gl_FragColor = vec4(col * alpha, alpha);
  }`;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { console.warn('Chrome title off:', e); cv.remove(); h1.classList.remove('chromed'); return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const uSize = U('size'), uC = U('c'), uA = U('A'), uT = U('time'), uFs = U('fs');
  const tex = gl.createTexture();

  // text texture: R = whole title, G = the word "work"
  const tc = document.createElement('canvas');
  const tctx = tc.getContext('2d');
  let band = { x: 0, y: 0, w: 1, h: 1 }, fs = 100, centre = [0, 0];
  function layout() {
    const r = h1.getBoundingClientRect();
    const cs = getComputedStyle(h1);
    fs = parseFloat(cs.fontSize);
    const pad = r.height * 1.4;
    band = { x: 0, y: Math.max(0, r.top - pad), w: innerWidth, h: r.height + pad * 2 };
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    cv.style.cssText = `left:0;top:${band.y}px;width:${band.w}px;height:${band.h}px`;
    cv.width = Math.round(band.w * dpr); cv.height = Math.round(band.h * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    const big = innerWidth > 700;
    tc.width = big ? 2048 : 1024; tc.height = big ? 1024 : 512;
    tctx.setTransform(tc.width / band.w, 0, 0, tc.height / band.h, 0, 0);
    tctx.clearRect(0, 0, band.w, band.h);
    const weight = cs.fontWeight || 340, fam = cs.fontFamily;
    const ls = parseFloat(cs.letterSpacing) || 0;
    if ('letterSpacing' in tctx) tctx.letterSpacing = ls + 'px';
    tctx.textBaseline = 'alphabetic';
    const x0 = r.left - band.x, base = r.top - band.y + r.height * .5 + fs * .3;
    // the title's words, taken from the heading itself; italic parts (<em>) get the accent colour
    const parts = [...h1.childNodes].map(n => n.nodeType === 3 ? [n.textContent, 'normal', false] : [n.textContent, 'italic', true]).filter(p => p[0].length);
    let x = x0;
    for (const [t, style, isWork] of parts) {
      tctx.font = `${style} ${weight} ${fs}px ${fam}`;
      tctx.fillStyle = isWork ? 'rgb(255,255,0)' : 'rgb(255,0,0)';
      tctx.fillText(t, x, base);
      x += tctx.measureText(t).width;
    }
    centre = [(x0 + x) / 2, band.h - (base - fs * .35)];         // GL y runs upward
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // burst state: a strong burst eases back over 3–5 s; moving over the title disturbs it lightly
  let t0 = performance.now(), dur = 4200, cx = 0, cy = 0, tx = 0, ty = 0, nudge = 0;
  const ease = k => 1 - (1 - k) * (1 - k) * (1 - k);
  function burst(px, py) { t0 = performance.now(); dur = 3000 + Math.random() * 2000; if (px != null) { tx = cx = px; ty = cy = py; } }
  function toBand(e) { return [e.clientX - band.x, band.h - (e.clientY - band.y)]; }
  function inBand(e) { return e.clientY > band.y && e.clientY < band.y + band.h; }
  door.addEventListener('pointerdown', e => { if (e.target.closest('button, a') || !inBand(e)) return; const [x, y] = toBand(e); burst(x, y); });
  door.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || !inBand(e)) return; [tx, ty] = toBand(e); nudge = Math.min(.32, nudge + .03); });

  let running = true;
  function frame(now) {
    if (!running) return;
    if (door.classList.contains('gone')) { running = false; return; }
    const k = Math.min(1, (now - t0) / dur);
    const A = Math.max(1 - ease(k), nudge);
    nudge *= .96;
    cx += (tx - cx) * .08; cy += (ty - cy) * .08;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uSize, band.w, band.h); gl.uniform2f(uC, cx, cy);
    gl.uniform1f(uA, A); gl.uniform1f(uT, now / 1000); gl.uniform1f(uFs, fs);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  function start() {
    layout(); tx = cx = centre[0]; ty = cy = centre[1];
    t0 = performance.now(); dur = 4200;                          // arrives broken, reads clearly by ~4 s
    requestAnimationFrame(frame);
  }
  let resizeT = 0;
  addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { layout(); }, 150); });
  const ready = document.fonts && document.fonts.load
    ? Promise.race([Promise.all([document.fonts.load('340 100px "Fraunces"'), document.fonts.load('italic 340 100px "Fraunces"')]), new Promise(r => setTimeout(r, 2500))])
    : Promise.resolve();
  ready.then(start, start);
})();
