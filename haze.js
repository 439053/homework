// Haze: reads the latest Singapore air readings from air.json (refreshed hourly by a GitHub Action)
// and turns them into the drifting, staining haze, the tightening weave, and the reading in the bottom bar.
(() => {
  'use strict';
  // what the visuals read every frame
  const AIR = window.AIR = { amt: 0, n: 1, s: 1, e: 1, w: 1, c: 1, vx: 0, vy: 0 };
  const target = { ...AIR };
  const REGIONS = ['north', 'south', 'east', 'west', 'central'];

  // 1-hour PM2.5 (µg/m³) -> haze strength, following NEA's bands: normal ≤55, elevated ≤150, high ≤250, very high above
  function strength(pm) {
    if (!(pm >= 0)) return 0;
    if (pm <= 55) return .04 + pm / 55 * .2;
    if (pm <= 150) return .24 + (pm - 55) / 95 * .36;
    if (pm <= 250) return .60 + (pm - 150) / 100 * .25;
    return .9;
  }

  function apply(d) {
    const pm = d.pm25 || {};
    const vals = REGIONS.map(k => pm[k]).filter(v => v >= 0);
    if (!vals.length) return false;
    const top = pm.east >= 0 ? pm.east : Math.max(...vals);   // Goodman Road is in the East region
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const rel = k => (pm[k] >= 0 && mean > 0) ? pm[k] / mean : 1;
    target.amt = strength(top);
    target.n = rel('north'); target.s = rel('south'); target.e = rel('east'); target.w = rel('west'); target.c = rel('central');
    // wind direction is where it blows FROM; the haze travels the other way
    const w = d.wind || {};
    if (w.dir >= 0) {
      const to = (w.dir + 180) * Math.PI / 180, k = .0035 * Math.max(1, Math.min(25, w.speed || 4));
      target.vx = Math.sin(to) * k; target.vy = Math.cos(to) * k;
    }
    const el = document.getElementById('airline');
    if (el) { el.textContent = Math.round(top) + ' \u00b5g/m\u00b3'; el.hidden = false; }
    return true;
  }

  // preview only: add #air=20, #air=90, #air=180 … to the address to simulate a 1-hour PM2.5 reading
  function sample(v) {
    const p = +v;
    return { pm25: { north: p * .75, south: p * .9, east: p * .85, west: p * .95, central: p }, wind: { dir: 150, speed: 8 } };
  }

  let first = true;
  function settle() { if (first) { Object.assign(AIR, target); first = false; } }   // first reading applies at once
  async function load() {
    const m = /air=(\d+)/.exec(location.hash);
    if (m) { apply(sample(m[1])); settle(); return; }
    try {
      const res = await fetch('air.json?t=' + Math.floor(Date.now() / 600000), { cache: 'no-store' });
      if (res.ok && apply(await res.json())) settle();
    } catch (e) { /* no reading yet: the piece stays clear */ }
  }
  load(); setInterval(load, 15 * 60 * 1000);

  // ease toward new readings so nothing jumps
  (function tick() {
    for (const k in target) AIR[k] += (target[k] - AIR[k]) * .01;
    requestAnimationFrame(tick);
  })();
})();
