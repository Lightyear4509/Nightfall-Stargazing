import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const moduleConfigPath = path.join(root, 'modules', 'local-gnss', 'expo-module.config.json');
const manifestPath = path.join(root, 'modules', 'local-gnss', 'android', 'src', 'main', 'java', 'app', 'stargazing', 'gnss', 'LocalGnssModule.kt');
const moduleConfig = JSON.parse(fs.readFileSync(moduleConfigPath, 'utf8'));
const source = fs.readFileSync(manifestPath, 'utf8');

assert.ok(moduleConfig.platforms.includes('android'), 'local GNSS module must be registered for Android');
assert.ok(moduleConfig.android.modules.includes('app.stargazing.gnss.LocalGnssModule'), 'module class path must match Expo autolinking config');
assert.match(source, /class LocalGnssModule\s*:\s*Module\(\)/, 'Kotlin Expo module source must exist in the repository');
assert.match(source, /Name\("LocalGnss"\)/, 'native module name must match the TypeScript bridge');
assert.match(source, /LocationManager\.GPS_PROVIDER/, 'updates must use the device GPS provider');
assert.match(source, /requestLocationUpdates\(LocationManager\.GPS_PROVIDER/, 'native watcher must actually request GPS provider updates');
assert.match(source, /ACCESS_FINE_LOCATION/, 'native start must require foreground precise permission');
assert.match(source, /removeUpdates\(listener\)/, 'stop must detach the native location listener');
assert.match(source, /OnDestroy\s*\{\s*stopUpdates\(\)/, 'module destruction must stop location updates');
assert.doesNotMatch(source, /ACCESS_BACKGROUND_LOCATION|startForegroundService|HttpURLConnection|OkHttpClient/, 'module must not add background location or network transport');

console.log('Android GNSS module checks passed: autolinked source exists, foreground GPS only, stop cleanup, no network client.');
