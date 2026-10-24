import fs from 'node:fs';
import path from 'node:path';

const inputs = process.argv.slice(2);
if (inputs.length === 0) throw new Error('Usage: node scripts/build-openngc-catalog.mjs <NGC.csv> [addendum.csv]');

function parseRow(line) {
  const fields = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ';' && !quoted) {
      fields.push(value); value = '';
    } else value += char;
  }
  fields.push(value);
  return fields;
}

function sexagesimal(value, rightAscension) {
  const parts = value.trim().split(':');
  if (parts.length !== 3) return NaN;
  const sign = parts[0].startsWith('-') ? -1 : 1;
  const first = Math.abs(Number(parts[0]));
  const minutes = Number(parts[1]);
  const seconds = Number(parts[2]);
  if (![first, minutes, seconds].every(Number.isFinite)) return NaN;
  const degreesOrHours = sign * (first + minutes / 60 + seconds / 3600);
  return rightAscension ? degreesOrHours * 15 : degreesOrHours;
}

const allowedTypes = new Set(['G', 'GPair', 'GTrpl', 'GGroup', 'GCl', 'OCl', 'Cl+N', '*Ass', 'PN', 'Neb', 'HII', 'EmN', 'RfN', 'SNR']);
const typeLabels = {
  G: 'Galaxy', GPair: 'Galaxy pair', GTrpl: 'Galaxy group', GGroup: 'Galaxy group',
  GCl: 'Globular cluster', OCl: 'Open cluster', 'Cl+N': 'Star cluster with nebula',
  '*Ass': 'Star association', PN: 'Planetary nebula', Neb: 'Nebula', HII: 'Emission nebula',
  EmN: 'Emission nebula', RfN: 'Reflection nebula', SNR: 'Supernova remnant',
};
const curatedMessier = new Set(['31', '42', '45', '13', '8', '44']);
const curatedNames = new Set(['andromeda galaxy', 'orion nebula', 'pleiades', 'hercules cluster', 'lagoon nebula', 'beehive cluster']);
const objects = new Map();

for (const input of inputs) {
  const lines = fs.readFileSync(input, 'utf8').split(/\r?\n/);
  const headers = parseRow(lines.shift());
  const column = Object.fromEntries(headers.map((header, index) => [header, index]));
  for (const line of lines) {
    if (!line) continue;
    const row = parseRow(line);
    const type = (row[column.Type] ?? '').trim();
    const rawMagnitude = (row[column['V-Mag']] ?? '').trim();
    const magnitude = Number(rawMagnitude);
    if (!allowedTypes.has(type) || !rawMagnitude || !Number.isFinite(magnitude) || magnitude > 9) continue;
    const ra = sexagesimal(row[column.RA] ?? '', true);
    const dec = sexagesimal(row[column.Dec] ?? '', false);
    if (!Number.isFinite(ra) || !Number.isFinite(dec)) continue;

    const catalogName = (row[column.Name] ?? '').trim();
    const messier = (row[column.M] ?? '').trim().replace(/^0+/, '');
    const commonName = (row[column['Common names']] ?? '').split('|')[0].trim();
    if ((messier && curatedMessier.has(messier)) || curatedNames.has(commonName.toLocaleLowerCase('en'))) continue;
    const label = commonName || (messier ? `M ${messier}` : catalogName.replace(/^(NGC|IC)/, '$1 '));
    const kind = typeLabels[type];
    const color = type === 'G' || type.startsWith('G') ? '#d4c5ff'
      : type === 'OCl' || type === '*Ass' ? '#b8d6ff'
      : type === 'GCl' ? '#d4bbff' : '#a6e5df';
    const object = {
      id: `opengc-${catalogName.toLowerCase()}`,
      name: label,
      aliases: [catalogName, ...(messier ? [`M ${messier}`] : [])],
      kind: 'Deep sky',
      constellation: (row[column.Const] ?? '').trim() || undefined,
      ra: Number(ra.toFixed(6)),
      dec: Number(dec.toFixed(6)),
      magnitude: Number(magnitude.toFixed(2)),
      color,
      description: `${kind} from the OpenNGC catalog (${catalogName}), visual magnitude ${magnitude.toFixed(2)}.`,
    };
    if (!objects.has(object.id)) objects.set(object.id, object);
  }
}

const output = path.resolve('src/data/openngc-bright-v1.json');
const ordered = [...objects.values()].sort((a, b) => a.magnitude - b.magnitude || a.id.localeCompare(b.id));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(ordered)}\n`);
console.log(`Wrote ${ordered.length} OpenNGC objects to ${output}`);
