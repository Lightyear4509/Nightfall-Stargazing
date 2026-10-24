# Nightfall Stargazing

An offline-first, privacy-focused sky guide. The current first-release target is Android and web, with iPhone planned as a later release. The app computes a local sky view from optional foreground device location or manually entered coordinates and bundled astronomy data; it does not need an account or app-operated service. The internal Android application ID and URL scheme remain `app.stargazing.sky` and `stargazing`.

## Current development status

The **v0.1.0 preview** is published on GitHub with a sideloadable Android APK and an offline-capable web PWA ZIP. The web app is also hosted at [lightyear4509.github.io/Nightfall-Stargazing](https://lightyear4509.github.io/Nightfall-Stargazing/). Hosted CI passed the web export and offline-worker simulation, and built the Android APK after verifying its bundled JavaScript, foreground-only location permissions, lack of Internet/background-location permissions, and disabled Android backup. Five fixed-point comparisons against NASA/JPL Horizons (Mars, Moon, Sun, Venus, and Jupiter across four locations) pass within their recorded per-case tolerances; these checks do not validate all dates, catalog astrometry, or real device pointing. The hosted page renders in a browser, but real browser installation/offline use, physical-device installation, accessibility, and field accuracy still need user testing. This preview is not a Play Store or App Store release.

### Implemented in the current prototype

- Interactive 3D celestial globe with live local-sky positions, constellation connections, a rotating horizon ring, and drag-to-orbit controls; tap objects for details. The globe includes the complete bundled sky catalog and dims objects on its far side.
- Offline “Tonight’s best sights” planner that finds astronomical darkness and ranks bright targets by their peak altitude, with a one-tap jump to each recommended time.
- Sun, Moon, and five bright planets, calculated locally with Astronomy Engine; selected Moon/planet details include engine-computed visual magnitude and illuminated fraction.
- 5,050-star HYG v4.1 naked-eye catalog plus 20 curated stars, 338 brighter OpenNGC galaxies/nebulae/clusters, and six curated deep-sky objects.
- IAU stick-figure constellation lines bundled for offline use and mapped to the star catalog.
- Search, object details, saved targets, opt-in foreground location following or manual coordinates, beginner guide, and a red-light mode that recolors the globe as well as the surrounding interface.
- Screen-reader labels and control roles for core actions, coordinate/search inputs, catalog filters, save/remove actions, and selectable sky-chart markers; VoiceOver/TalkBack behavior still needs device verification.
- Bundled “Sources & licenses” panel with key catalog credits and license terms, plus a full dependency and data-processing record in `DATA_LICENSES.md`.
- Local persistence for coordinates, saved targets, and display preference.
- Branded Android launcher icon and matching PWA/iOS web-install icon sizes generated from one bundled vector mark.
- Android uses the device GNSS provider only while the app is open; it requests no background location and is configured without Internet permission. Static web export includes a service-worker precache for offline use after the first visit.

### Known limits before a general release

- Catalog stars use HYG v4.1 J2000 coordinates and proper motion with precession/nutation conversion. Imported catalog records have not yet been independently checked against another reference set; curated facts and the six curated deep-sky entries also need review.
- The 3D globe is an interactive unit-sphere visualization of sky directions, not a distance-scaled model of the Solar System or galaxy. Dragging rotates the globe and its horizon together; far-side objects are dimmed. A native Android build and device interaction walkthrough are needed to confirm gesture behavior and rendering performance on physical hardware.
- The sky chart uses IAU stick-figure connections for 86 named constellations; Serpens is split into head and tail sections, while the source provides no figure for Mensa or Microscopium. Two very faint HIP endpoints are outside the bundled magnitude-6 HYG subset, so their line sequences are split at those gaps. Constellation boundaries are not included.
- Selected-object details estimate the next rise or set within 48 hours. The Tonight planner samples the Sun’s altitude for astronomical darkness and ranks a limited set of bright objects at 30-minute intervals. Times use the device time zone, which can differ from a manually selected observing location. Neither feature models terrain, weather, light pollution, or local atmospheric conditions; civil/nautical twilight display and device compass sensors are not included.
- Native permission behavior, web offline operation, screen-reader/accessibility behavior, physical-device layout, and position accuracy need release-grade verification.
- The preview APK, GitHub release, and GitHub Pages website exist. No Play Store AAB/listing, iOS build, or App Store submission has been created.

## Local development

Requirements: Node.js 22.13+ and pnpm 11. From the project folder:

```sh
pnpm install
pnpm typecheck
pnpm check:sky
pnpm check:privacy
pnpm check:state
pnpm check:android-module
pnpm build:icon
pnpm start
```

For Android, run `pnpm android` with Android Studio, an Android SDK, and Java installed; Expo Go does not include this project's custom GNSS module. For a browser development session, run `pnpm web`. To create a static web export and service worker, run `pnpm export:web`, then preview the exported files locally with `pnpm preview:web` at `http://127.0.0.1:4173` (or set `STARGAZING_PREVIEW_PORT` if that port is occupied). EAS cloud builds require an Expo account and project configuration.

Device location is optional. **Use my location** first shows a privacy explanation; permission is requested only if the user chooses to continue. Following is foreground-only, updates while the app is open, and stops when the app backgrounds or the user stops following. Android reads the device GPS provider; web uses browser geolocation on a secure (HTTPS) origin. Only the latest observing coordinates are stored on device, and the user can stop following or clear saved coordinates. Nightfall has no account sync, location analytics, location server, or app feature that uploads coordinates; Android has no Internet permission and Auto Backup is disabled. Manual coordinates work without location permission. No app can guarantee that the operating system, browser, device manufacturer, or location provider will not independently process location, or protect local data on an unlocked or compromised device. Downloading the web app requires an ordinary request to its host (which may see network metadata such as an IP address); the app does not include coordinates in that request. For the strictest user-controlled privacy, deny location permission and use manual coordinates. The web version must be downloaded once while online before its service worker can cache it.

The static web export adds a Content Security Policy that restricts page-initiated network connections and loaded scripts/assets to the same origin. This is defense in depth for the web client; it does not control platform-level location-provider traffic or hosting metadata.

GitHub Actions type-checks the app, scans app-owned runtime source for direct network transports and telemetry SDK imports, checks sky positions for all 5,421 bundled objects across five dates and locations (including both poles), exports the web app, and builds a standalone Android preview APK from a clean generated project. The release variant bundles the JavaScript app; CI checks that bundle is present, confirms foreground fine location, rejects Internet, network-state, or background-location permissions, and checks that Android backup is disabled. It uses the generated development signing key and is not a Play Store signing/release setup. The web job simulates service-worker installation and offline page/asset requests against the exported files; this does not replace a real browser offline test. The successful v0.1.0 run uploaded 30-day artifacts and the tag-gated job published the permanent preview release. Review the [v0.1.0 release](https://github.com/Lightyear4509/Nightfall-Stargazing/releases/tag/v0.1.0) or [Actions history](https://github.com/Lightyear4509/Nightfall-Stargazing/actions). The repository now uses the requested app-name slug `Nightfall-Stargazing`.

## Project references

- [SOURCE_OF_TRUTH.md](SOURCE_OF_TRUTH.md) is the append-only product and work record. Never delete or rewrite its existing text; add dated entries.
- [RELEASING.md](RELEASING.md) explains current GitHub artifact downloads, Android preview installation, web hosting requirements, and remaining public-release gates.
- [DATA_LICENSES.md](DATA_LICENSES.md) records catalog sources, transformations, and attribution obligations.
- [PRIVACY.md](PRIVACY.md) is a draft notice that must be reconciled with signed release builds before publication.
- [CONTRIBUTING.md](CONTRIBUTING.md) explains development and data-source requirements.
- [LICENSE](LICENSE) covers project code; HYG and OpenNGC catalog subsets are separately licensed under CC BY-SA 4.0 as documented in [DATA_LICENSES.md](DATA_LICENSES.md).
