import fs from 'node:fs';
import path from 'node:path';

// IAU line source: dcf21/constellation-stick-figures commit 75d29c207bbd752023c447ddd1f9f4ff0eb47538.

const [lineFile, hygFile] = process.argv.slice(2);
if (!lineFile || !hygFile) {
  throw new Error('Usage: node scripts/build-constellation-lines.mjs <constellation_lines_iau.dat> <hygdata_v41.csv>');
}

function parseCsvRow(line) {
  const fields = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      fields.push(value); value = '';
    } else value += char;
  }
  fields.push(value);
  return fields;
}

const curatedIdsByName = new Map([
  ['sirius', 'sirius'], ['canopus', 'canopus'], ['arcturus', 'arcturus'], ['vega', 'vega'],
  ['capella', 'capella'], ['rigel', 'rigel'], ['procyon', 'procyon'], ['betelgeuse', 'betelgeuse'],
  ['altair', 'altair'], ['aldebaran', 'aldebaran'], ['spica', 'spica'], ['antares', 'antares'],
  ['pollux', 'pollux'], ['fomalhaut', 'fomalhaut'], ['deneb', 'deneb'], ['regulus', 'regulus'],
  ['castor', 'castor'], ['polaris', 'polaris'], ['mizar', 'mizar'], ['algol', 'algol'],
]);

const csvLines = fs.readFileSync(hygFile, 'utf8').split(/\r?\n/);
const headers = parseCsvRow(csvLines.shift());
const column = Object.fromEntries(headers.map((name, index) => [name, index]));
const hipToAppId = new Map();
for (const line of csvLines) {
  if (!line) continue;
  const row = parseCsvRow(line);
  const magnitude = Number(row[column.mag]);
  const id = Number(row[column.id]);
  const hip = Number(row[column.hip]);
  if (!Number.isFinite(magnitude) || magnitude > 6 || !Number.isFinite(id) || id === 0) continue;
  if (!Number.isInteger(hip) || hip <= 0) continue;
  const proper = (row[column.proper] ?? '').trim().toLocaleLowerCase('en');
  const appId = curatedIdsByName.get(proper) ?? `hyg-${id}`;
  const previous = hipToAppId.get(hip);
  if (!previous || curatedIdsByName.has(proper)) hipToAppId.set(hip, appId);
}

const lines = [];
let constellation = null;
const missingHipReferences = [];
const source = fs.readFileSync(lineFile, 'utf8');
for (const rawLine of source.split(/\r?\n/)) {
  const headerMatch = rawLine.match(/^\*\s+(.+)$/);
  if (headerMatch) {
    constellation = headerMatch[1].trim();
    continue;
  }
  if (!constellation || !rawLine.trim().startsWith('[')) continue;
  const hipSequence = JSON.parse(rawLine).map((value) => String(value).replace(/\D/g, '')).filter(Boolean);
  let mappedRun = [];
  const flush = () => {
    if (mappedRun.length > 1) lines.push({ constellation, stars: mappedRun });
    mappedRun = [];
  };
  for (const hipText of hipSequence) {
    const appId = hipToAppId.get(Number(hipText));
    if (appId) mappedRun.push(appId);
    else { missingHipReferences.push({ constellation, hip: hipText }); flush(); }
  }
  flush();
}

const uniqueConstellations = new Set(lines.map((line) => line.constellation));
const output = path.resolve('src/data/iau-constellation-lines-v1.json');
fs.writeFileSync(output, `${JSON.stringify({ lines })}\n`);
console.log(`Wrote ${lines.length} polylines across ${uniqueConstellations.size} constellations to ${output}; split at ${missingHipReferences.length} unavailable HIP references.`);
if (missingHipReferences.length) console.log('Unavailable HIP references:', missingHipReferences);
