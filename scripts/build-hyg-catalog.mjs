import fs from 'node:fs';
import path from 'node:path';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/build-hyg-catalog.mjs <hygdata_v41.csv>');

function parseRow(line) {
  const fields = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      fields.push(value); value = '';
    } else value += char;
  }
  fields.push(value);
  return fields;
}

const lines = fs.readFileSync(input, 'utf8').split(/\r?\n/);
const headers = parseRow(lines.shift());
const column = Object.fromEntries(headers.map((header, index) => [header, index]));
const curatedNames = new Set([
  'sirius', 'canopus', 'arcturus', 'vega', 'capella', 'rigel', 'procyon', 'betelgeuse',
  'altair', 'aldebaran', 'spica', 'antares', 'pollux', 'fomalhaut', 'deneb', 'regulus',
  'castor', 'polaris', 'mizar', 'algol',
]);

const stars = [];
for (const line of lines) {
  if (!line) continue;
  const row = parseRow(line);
  const magnitude = Number(row[column.mag]);
  const id = Number(row[column.id]);
  const raHours = Number(row[column.ra]);
  const dec = Number(row[column.dec]);
  const distancePc = Number(row[column.dist]);
  if (!Number.isFinite(magnitude) || magnitude > 6 || !Number.isFinite(id) || id === 0) continue;
  if (!Number.isFinite(raHours) || !Number.isFinite(dec)) continue;
  const proper = (row[column.proper] ?? '').trim();
  if (curatedNames.has(proper.toLocaleLowerCase('en'))) continue;
  const designation = (row[column.bf] ?? '').trim();
  const name = proper || designation || `Star ${id}`;
  stars.push({
    id: `hyg-${id}`,
    name,
    ra: Number((raHours * 15).toFixed(6)),
    dec: Number(dec.toFixed(6)),
    magnitude: Number(magnitude.toFixed(2)),
    distanceLy: Number.isFinite(distancePc) && distancePc > 0 && distancePc < 100000
      ? Number((distancePc * 3.26156).toFixed(2)) : null,
    pmRa: Number(row[column.pmra]) || 0,
    pmDec: Number(row[column.pmdec]) || 0,
    constellation: (row[column.con] ?? '').trim() || null,
    colorIndex: Number(row[column.ci]) || null,
  });
}

stars.sort((a, b) => a.magnitude - b.magnitude || a.id.localeCompare(b.id));
const output = path.resolve('src/data/hyg-stars-v41.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(stars)}\n`);
console.log(`Wrote ${stars.length} stars to ${output}`);
