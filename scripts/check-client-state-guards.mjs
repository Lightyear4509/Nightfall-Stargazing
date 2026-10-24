import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modulesRoot = path.join(projectRoot, 'node_modules');
const outputDir = fs.mkdtempSync(path.join(modulesRoot, '.state-guard-check-'));
const resolvedOutput = path.resolve(outputDir);
const resolvedModules = path.resolve(modulesRoot);

try {
  assert.ok(resolvedOutput.startsWith(`${resolvedModules}${path.sep}`), 'temporary compiler output must stay inside node_modules');
  const tscPath = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  const compile = spawnSync(process.execPath, [
    tscPath,
    'src/client-state-guards.ts',
    '--outDir', outputDir,
    '--module', 'commonjs',
    '--moduleResolution', 'node',
    '--target', 'ES2022',
    '--strict',
    '--skipLibCheck',
    '--noEmit', 'false',
  ], { cwd: projectRoot, stdio: 'inherit' });
  if (compile.error) throw compile.error;
  assert.equal(compile.status, 0, 'client-state guards should compile for the regression check');

  const require = createRequire(import.meta.url);
  const { LocationSessionGuard, PreferenceHydrationGuard } = require(path.join(outputDir, 'client-state-guards.js'));
  const preferenceKeys = ['saved', 'nightMode', 'location', 'followLocation'];
  const storedValues = { saved: ['old'], nightMode: true, location: 'old coordinates', followLocation: true };
  const userValues = { saved: ['new'], nightMode: false, location: 'manual coordinates', followLocation: false };
  const visibleValues = { ...userValues };
  const hydrationGuard = new PreferenceHydrationGuard();
  const pendingReads = preferenceKeys.map((key) => new Promise((resolve) => {
    setTimeout(() => resolve(storedValues[key]), 0);
  }).then((value) => {
    if (hydrationGuard.mayApplyStoredValue(key)) visibleValues[key] = value;
  }));

  for (const key of preferenceKeys) hydrationGuard.markEdited(key);
  await Promise.all(pendingReads);
  assert.deepEqual(visibleValues, userValues, 'late startup reads must not overwrite user-edited state');

  const untouchedHydration = new PreferenceHydrationGuard();
  assert.equal(untouchedHydration.mayApplyStoredValue('location'), true, 'stored state still hydrates when unedited');
  untouchedHydration.markEdited('location');
  assert.equal(untouchedHydration.mayApplyStoredValue('location'), false, 'edited state blocks late hydration');

  const sessions = new LocationSessionGuard();
  const oldWatcher = sessions.begin();
  assert.equal(sessions.isCurrent(oldWatcher), true, 'active watcher can deliver updates');
  sessions.invalidate();
  assert.equal(sessions.isCurrent(oldWatcher), false, 'stop invalidates callbacks immediately');
  const resumedWatcher = sessions.begin();
  assert.equal(sessions.isCurrent(oldWatcher), false, 'resuming does not revive callbacks from the old watcher');
  assert.equal(sessions.isCurrent(resumedWatcher), true, 'resumed watcher gets a fresh active session');
  sessions.invalidate();
  assert.equal(sessions.isCurrent(resumedWatcher), false, 'clear/manual selection invalidates the resumed watcher');

  console.log('Client-state guards passed: delayed preference hydration and stale location sessions are rejected.');
} finally {
  if (resolvedOutput.startsWith(`${resolvedModules}${path.sep}`) && path.basename(resolvedOutput).startsWith('.state-guard-check-')) {
    fs.rmSync(resolvedOutput, { recursive: true, force: true });
  }
}
