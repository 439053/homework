// Fetches Singapore's latest air readings from data.gov.sg and writes air.json for the site.
// Run hourly by .github/workflows/air.yml. Needs the DATA_GOV_SG_KEY secret.
import { writeFileSync, readFileSync } from 'node:fs';

const KEY = process.env.DATA_GOV_SG_KEY || '';
const BASE = 'https://api-open.data.gov.sg/v2/real-time/api/';
const REGIONS = ['north', 'south', 'east', 'west', 'central'];

async function get(name) {
  const res = await fetch(BASE + name, { headers: KEY ? { 'x-api-key': KEY } : {} });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const j = await res.json();
  return j.data || j;
}
const pick = (o, keys) => Object.fromEntries(keys.filter(k => typeof o?.[k] === 'number').map(k => [k, o[k]]));

// average reading across weather stations
function stationMean(d) {
  const r = (d.readings || [])[0];
  const vals = (r?.data || []).map(x => x.value).filter(v => typeof v === 'number');
  return vals.length ? vals : null;
}
// average of compass directions done properly (as vectors)
function meanDirection(degs) {
  let x = 0, y = 0;
  for (const d of degs) { x += Math.sin(d * Math.PI / 180); y += Math.cos(d * Math.PI / 180); }
  return Math.round((Math.atan2(x, y) * 180 / Math.PI + 360) % 360);
}

const out = { updated: new Date().toISOString() };
try {
  const d = await get('pm25');
  const item = (d.items || [])[0];
  out.pm25 = pick(item?.readings?.pm25_one_hourly, REGIONS);
  out.pm25Time = item?.updatedTimestamp || item?.timestamp || item?.date;
} catch (e) { console.error(e.message); }
try {
  const d = await get('psi');
  const item = (d.items || [])[0];
  out.psi24 = pick(item?.readings?.psi_twenty_four_hourly, [...REGIONS, 'national']);
} catch (e) { console.error(e.message); }
try {
  const dir = stationMean(await get('wind-direction'));
  const spd = stationMean(await get('wind-speed'));
  if (dir) out.wind = { dir: meanDirection(dir), speed: spd ? +(spd.reduce((a, b) => a + b, 0) / spd.length).toFixed(1) : undefined };
} catch (e) { console.error(e.message); }

if (!out.pm25 || !Object.keys(out.pm25).length) {
  console.error('No PM2.5 reading this hour; keeping the previous air.json.');
  process.exit(0);
}
let prev = '';
try { prev = readFileSync('air.json', 'utf8'); } catch {}
const next = JSON.stringify(out, null, 2) + '\n';
writeFileSync('air.json', next);
console.log(next);
