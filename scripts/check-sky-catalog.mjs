import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modulesRoot = path.join(projectRoot, 'node_modules');
const outputDir = fs.mkdtempSync(path.join(modulesRoot, '.sky-check-'));
const resolvedOutput = path.resolve(outputDir);
const resolvedModules = path.resolve(modulesRoot);

try {
  assert.ok(resolvedOutput.startsWith(`${resolvedModules}${path.sep}`), 'temporary compiler output must stay inside node_modules');
  const tscPath = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  const compile = spawnSync(process.execPath, [
    tscPath,
    'src/sky.ts',
    '--outDir', outputDir,
    '--module', 'commonjs',
    '--moduleResolution', 'node',
    '--target', 'ES2022',
    '--resolveJsonModule',
    '--esModuleInterop',
    '--skipLibCheck',
    '--strict',
    '--noEmit', 'false',
    '--allowSyntheticDefaultImports',
  ], { cwd: projectRoot, stdio: 'inherit' });
  if (compile.error) throw compile.error;
  assert.equal(compile.status, 0, 'sky calculation sources should compile for the runtime check');

  const require = createRequire(import.meta.url);
  const { bestTonightTargets, calculateSky } = require(path.join(outputDir, 'sky.js'));
  const Astronomy = require('astronomy-engine');
  const cases = [
    ['New York', '2026-10-24T20:00:00Z', { latitude: 40.7128, longitude: -74.006 }],
    ['Equator', '2026-06-21T12:00:00Z', { latitude: 0, longitude: 0 }],
    ['North Pole', '2026-12-21T12:00:00Z', { latitude: 90, longitude: 0 }],
    ['South Pole', '2026-06-21T12:00:00Z', { latitude: -90, longitude: 0 }],
    ['Sydney', '2026-03-20T12:00:00Z', { latitude: -33.8688, longitude: 151.2093 }],
  ];

  let expectedCount;
  for (const [label, isoTime, observer] of cases) {
    const points = calculateSky(observer, new Date(isoTime));
    if (expectedCount === undefined) expectedCount = points.length;
    assert.equal(points.length, expectedCount, `${label}: object count should remain consistent`);
    assert.equal(points.length, 5421, `${label}: review this check if the shipped catalog intentionally changes`);

    const ids = new Set();
    for (const point of points) {
      assert.ok(point.id && !ids.has(point.id), `${label}: object IDs should be present and unique (${point.id})`);
      ids.add(point.id);
      assert.ok(Number.isFinite(point.altitude), `${label}: ${point.id} altitude should be finite`);
      assert.ok(point.altitude >= -90 && point.altitude <= 90, `${label}: ${point.id} altitude should be in [-90, 90]`);
      assert.ok(Number.isFinite(point.azimuth), `${label}: ${point.id} azimuth should be finite`);
      assert.ok(point.azimuth >= 0 && point.azimuth <= 360, `${label}: ${point.id} azimuth should be in [0, 360]`);
    }
    console.log(`${label}: ${points.length} unique objects; altitude and azimuth outputs are finite and in range.`);
  }

  // Independent fixed fixtures from NASA/JPL Horizons API observer quantity 4.
  // Compare airless values so atmospheric models do not affect ephemeris checks.
  const referenceCases = [
    ['Mars', Astronomy.Body.Mars, 'horizons-mars-ny-2026-10-25.json'],
    ['Moon', Astronomy.Body.Moon, 'horizons-moon-ny-2026-10-25.json'],
    ['Jupiter', Astronomy.Body.Jupiter, 'horizons-jupiter-sydney-2026-03-20.json'],
    ['Sun', Astronomy.Body.Sun, 'horizons-sun-equator-2026-06-21.json'],
    ['Venus', Astronomy.Body.Venus, 'horizons-venus-london-2026-10-25.json'],
  ];
  for (const [label, body, fixtureName] of referenceCases) {
    const horizons = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data', fixtureName), 'utf8'));
    const observer = new Astronomy.Observer(horizons.observer.latitude, horizons.observer.longitude, horizons.observer.heightMeters);
    const time = new Astronomy.AstroTime(new Date(horizons.utc));
    const equator = Astronomy.Equator(body, time, observer, true, true);
    const airless = Astronomy.Horizon(time, observer, equator.ra, equator.dec, null);
    const toleranceDegrees = horizons.toleranceArcseconds / 3600;
    assert.ok(Math.abs(airless.azimuth - horizons.azimuthDegrees) <= toleranceDegrees,
      `${label} azimuth should match independent JPL Horizons fixture within ${horizons.toleranceArcseconds} arcseconds`);
    assert.ok(Math.abs(airless.altitude - horizons.altitudeDegrees) <= toleranceDegrees,
      `${label} airless altitude should match independent JPL Horizons fixture within ${horizons.toleranceArcseconds} arcseconds`);
    console.log(`Independent ${label}/JPL Horizons comparison passed (azimuth ${airless.azimuth.toFixed(6)}°, airless altitude ${airless.altitude.toFixed(6)}°; tolerance ${horizons.toleranceArcseconds} arcseconds).`);
  }
  const newYorkTonight = bestTonightTargets(cases[0][2], new Date('2026-10-24T20:00:00Z'));
  assert.ok(newYorkTonight.length > 0, 'New York should receive a useful target list for a normal autumn night');
  assert.ok(newYorkTonight.length <= 5, 'Tonight planner should respect its five-target default');
  for (let index = 0; index < newYorkTonight.length; index += 1) {
    const target = newYorkTonight[index];
    assert.ok(target.bestAltitude >= 15 && target.bestAltitude <= 90, `${target.point.name}: best altitude should be useful and valid`);
    assert.ok(target.bestTime.getTime() >= Date.parse('2026-10-24T20:00:00Z'), `${target.point.name}: best time should not precede the plan`);
    if (index > 0) assert.ok(newYorkTonight[index - 1].bestAltitude >= target.bestAltitude, 'Tonight targets should be ranked by peak altitude');
  }
  const polarSummer = bestTonightTargets({ latitude:90, longitude:0 }, new Date('2026-06-21T12:00:00Z'));
  assert.equal(polarSummer.length, 0, 'North Pole midsummer should report no astronomical night targets');
  console.log(`Tonight planner checks passed: ${newYorkTonight.length} New York targets and no false polar-summer night.`);
  console.log(`Sky catalog checks passed for ${cases.length} date/location combinations.`);
} finally {
  if (resolvedOutput.startsWith(`${resolvedModules}${path.sep}`) && path.basename(resolvedOutput).startsWith('.sky-check-')) {
    fs.rmSync(resolvedOutput, { recursive: true, force: true });
  }
}
