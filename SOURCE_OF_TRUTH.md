# Stargazing App — Source of Truth

This file is the durable project record for the app’s purpose, decisions, implementation, and release history. It is append-only: add new dated entries and corrections below; do not delete or rewrite existing entries. If a decision changes, record the new decision and why, while retaining the earlier record.

## Project identity and intent

- **Working name:** Stargazing (final public name TBD).
- **Purpose:** Help people identify and learn about the sky visible from their location at a chosen time, with live local sky positioning and a privacy-first design.
- **Audience:** Beginners, families and educators, and amateur astronomers.
- **Distribution intent:** Public source repository on GitHub; iPhone app submitted to the Apple App Store; web app available from a public deployment.
- **Privacy promise:** Precise location is processed on the device and is never sent to an app-operated or third-party service. No account is required. Do not include analytics, advertising, remote crash reporting, or network requests containing location. Network access may be used for app/catalog releases or optional reference links, but core sky use must not depend on it in the full release.

## Current product specification (v1)

### Platforms and implementation choice

- Build one shared TypeScript application using **Expo + React Native**, targeting iOS and web. This is the selected starting architecture because it shares UI and domain code while supporting a native iPhone build and a browser build.
- Keep astronomy calculations and location processing local. Isolate the sky engine behind a small interface so a platform-specific or better-validated implementation can replace it without changing app screens.
- Use a 2D interactive sky chart for v1. Defer augmented reality, telescope control, satellite tracking, accounts, social features, and community uploads.

### v1 user experience

1. On first use, explain why location helps orient the sky. Ask for foreground location permission only when the user chooses automatic location. Always offer manual latitude/longitude or place selection without requiring a location permission.
2. Show an interactive sky map for the current local time and location: stars, constellation patterns and names, Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn.
3. Allow pan, zoom, and selection. A selected object opens a concise detail card with name, category, coordinates/altitude/azimuth as appropriate, apparent magnitude where available, visibility/rise-set information where meaningful, and an educational description.
4. Provide search, object-type filters, and a “Tonight” list ordered by useful observing time and altitude.
5. Include a red night-vision theme, a short guided tour for beginners, saved observing lists, and locally stored observed/not-observed marks.
6. Explain that predicted visibility does not account for weather, buildings, trees, or local light pollution.

### Catalog and offline policy

- Do **not** bundle Gaia’s full catalog (about 1.8 billion sources): it is far beyond v1’s needs and would make distribution impractical.
- V1 target: a curated catalog in the low thousands of naked-eye and binocular-relevant stars (initial target approximately 3,000–5,000, selected by brightness, cultural/educational value, and constellation coverage), all 88 IAU constellations’ lines/names, the seven naked-eye planets plus Sun and Moon, and approximately 100–300 popular deep-sky objects (Messier objects first, then selected bright Caldwell/NGC targets). Catalog scope is a size target, not a claim that data has already been assembled.
- Package the catalog, object descriptions, and required ephemeris files with the installed app. In the final release, map, search, object details, and calculations must work with network disabled. First public development builds may offer optional downloads/updates, but downloaded data must remain local and the initial install should include the core v1 catalog.
- Every data source must be reviewed for accuracy, redistribution rights, attribution, size, and offline suitability before inclusion. Keep source and license metadata with the data.

### Accuracy and calculation requirements

- Compute local apparent sky positions from date/time, observer coordinates, and suitable astronomy algorithms/ephemerides; do not describe the map as live camera tracking. “Live” means recalculation as time advances, with optional device compass orientation if reliable and permissioned.
- Use UTC internally, carefully convert local time and daylight-saving rules for display, and make manual time/location simulation available for planning.
- Include precession/nutation, topocentric parallax for nearby solar-system objects, and atmospheric refraction near the horizon when supported by the selected engine. Record engine/data versions and stated validity ranges.
- Establish a documented validation matrix across dates, locations, and objects against authoritative ephemeris/reference outputs before asserting accuracy. Show a small “position estimate” disclaimer and meaningful precision; never imply survey-grade or telescope-pointing precision unless independently demonstrated.
- Planetary ephemeris and catalog choices are not yet finalized; compare license and footprint before selection. JPL DE ephemerides are a candidate, subject to checking redistribution terms and supported time span.

### Privacy, security, accessibility

- Request only foreground location. Do not send coordinates, place names, saved lists, or observation history over the network. Keep preferences and lists in local storage.
- Use manual location as a complete alternative. In web builds, browser geolocation is permission-gated and may require HTTPS; explain this and retain manual entry.
- Use no third-party SDKs that transmit user/device data in v1. Document any unavoidable platform communications and verify App Store privacy disclosures against the actual build.
- Support VoiceOver and browser screen readers, scalable text, high contrast, and labels/shapes that do not depend on color alone. Red mode must preserve readable contrast.

### GitHub and App Store release requirements

- Repository should include source, build/run instructions, architecture and data-source notes, license, contribution guide, issue templates, and automated build checks.
- Publish versioned GitHub releases with platform-specific artifacts where feasible, release notes, known limitations, and checksums.
- iOS App Store submission requires Apple Developer Program enrollment (Apple currently lists US$99/year, subject to change), App Store metadata, privacy policy URL, permission-purpose text, signing, and Apple review. This project has not enrolled, submitted, or been approved.
- A web deployment and App Store submission require external accounts/credentials and an actual release decision. Do not claim availability until verified.

## Current status

- **2026-10-24:** Workspace inspected and found empty. No app code, catalog, build configuration, deployment, or release exists yet.
- **2026-10-24:** Recorded the v1 product direction above. Chosen shared Expo/React Native + TypeScript for iOS and web; local-only location; interactive 2D chart; compact curated catalog; offline-capable full release; initial focus on planets, Moon, stars, constellations, and popular deep-sky objects.
- **Not yet done:** Scaffold app; choose and document exact astronomy engine/ephemeris/catalog datasets and licenses; implement UI and sky calculations; validate accuracy; implement and verify no-network offline behavior; create privacy policy; build and test web/iOS artifacts; publish to GitHub or submit to App Store.

## Append-only decision and work log

Append new dated notes here. Preserve every existing entry, even when a later decision supersedes it.

### 2026-10-24 — Initial v1 choices

- Chose Expo/React Native with TypeScript to pursue iPhone and web from one codebase.
- Chose a local-first architecture with no account, analytics, ads, or location transmission.
- Chose a curated catalog rather than all Gaia sources, with an initial target around 3,000–5,000 stars and 100–300 deep-sky objects, subject to source/license and package-size validation.
- Chose to bundle core data for the final offline-capable release; network may support optional updates and reference links.
- Chose 2D map, red night mode, beginner tour, search, Tonight list, and local observing lists for the initial product scope.
- Chose to treat accuracy as a verifiable requirement, not an assumption: exact engine, ephemeris, validity range, and comparison tests remain open work.

### 2026-10-24 — Android-first release and implementation progress

- Product direction updated after the user's instruction: target **Android first**, then bring the shared application to iPhone in a later release. Keep web as an intended target. This supersedes the previous sequencing preference; the historical entry above remains intact.
- Selected Expo SDK 54 / React Native with TypeScript as the shared application implementation. Expo documents Android, iOS, and web support from one project; web docs: https://docs.expo.dev/workflow/web/.
- Selected Astronomy Engine JavaScript/TypeScript 2.1.19 (MIT) for local solar-system position calculations. Its project reference documents client-side browser support, equatorial/horizontal coordinates, and rise/set calculations: https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md. Exact dependency/API behavior still needs a successful dependency install and build verification.
- Added application source/configuration: package.json, app.json, tsconfig.json, App.tsx, src/catalog.ts, and src/sky.ts. Implemented a live 2D chart, seed stars and deep-sky targets, solar-system bodies through Astronomy Engine, local foreground location, manual coordinate input, search/category filters, object details, saved list in local storage, and red mode.
- The current bundled data is only a **20-star and 6-deep-sky-object seed sample** plus five planets, Sun not yet rendered, and Moon. It does not meet the planned 3,000–5,000 star or 100–300 deep-sky target; it is not yet a complete catalog or release.
- Runtime privacy design in current source: no network client or analytics SDK is included; location permission is foreground-only and coordinates are not transmitted by app code. This is not yet audited in a built release, and platform services or distribution infrastructure have not been reviewed.
- Tooling limitation observed: Node 24 and pnpm 11 are available, but npm is not on PATH; a package-registry request failed with DNS resolution error (ENOTFOUND). Dependencies are not present locally, so no dependency install, typecheck, Android build, web export, runtime check, or offline verification has been completed.
- Remaining work: install dependencies when registry access is available; resolve any compile/runtime issues; expand the licensed and attributed catalog; add/validate constellation coverage, Sun and richer rise/set/visibility data; implement documented ephemeris validation and offline audit; add licenses/privacy policy/CI/release guide; verify Android APK/AAB and web output; then plan iOS follow-on build, Apple enrollment, signing, metadata, and review.

### 2026-10-24 — Current SDK and repository foundation update

- Updated the project manifest to Expo SDK 57 / React Native 0.86 / React 19.2 after checking the current Expo SDK reference, which lists SDK 57 as stable and specifies its React Native and Android support: https://docs.expo.dev/versions/v57.0.0/. This supersedes the SDK 54 scaffold version recorded earlier; the earlier choice is retained as history.
- Added Android EAS build profiles for internal APK and production App Bundle output, a GitHub Actions dependency-install/typecheck workflow, MIT project license, contributor setup guidance, and a draft privacy notice. These files are scaffolding only; EAS signing, GitHub execution, dependency installation, and builds have not been run.
- The current source tree now includes a working-intent UI and calculation implementation but cannot yet be characterized as a verified working release. The application has not been typechecked or run because package registry access failed with ENOTFOUND and dependencies are absent.
- Current coordinate limitation: seed star and deep-sky positions are stored as J2000 RA/Dec and the current star projection does not yet apply proper motion or precession corrections. No reference comparison has been completed. Avoid precision claims until that work is complete.
- Current chart limitation: constellation line data is only a small hand-authored illustrative subset and not a checked representation of all 88 constellations. It must be replaced with a properly sourced, licensed/attributed dataset before the app claims complete constellation coverage.
- Current release limits remain: source files exist locally only; no GitHub repository/release, public web deployment, Android package, Play Store listing, iOS package, or App Store submission has been created.

### 2026-10-24 — Planning controls and dependency retry

- Added hour-by-hour time scrubbing with a return-to-live control. Sky calculations, date/time display, and object altitude positions use the selected simulation time; the live clock continues to update in real time when simulation is off.
- Retried pnpm installation using a project-local package store to avoid the earlier Windows EPERM while creating a link to an external store. The filesystem permission issue was bypassed, but every requested npm package returned DNS `ENOTFOUND`; install was interrupted during pnpm's one-minute retry interval. No dependency install or lockfile was produced.
- Added `.pnpm-store/` to `.gitignore` so any future local package cache will not be committed.
- The same package-registry DNS failure has now been observed on two consecutive implementation turns. The current inability to install dependencies prevents typecheck, runtime validation, and Android/web builds; continue all independent work while awaiting registry access.

### 2026-10-24 — Dependency access restored and local verification

- Requested and received approved npm-registry access for package installation. Using a project-local pnpm content store, installed dependencies and generated `pnpm-lock.yaml`. The earlier DNS failures are historical; the registry is currently accessible through the approved install path.
- Passed TypeScript compilation with `pnpm typecheck` after implementing hour-by-hour planning and local persistence for selected coordinates.
- Expo SDK compatibility check initially reported outdated React Native and SVG versions. Updated to React Native 0.86.3 and react-native-svg 15.15.4, refreshed the lockfile, and the local Expo compatibility check then reported dependencies up to date. The check used Expo's local dependency map because its optional versions endpoint was unreachable.
- Exported the web app successfully multiple times with `pnpm export:web`; final export included the app JavaScript bundle (~595 KB), HTML, manifest, SVG icon, and generated service worker precaching five files. `node --check` succeeded for both the service-worker generator and generated service worker.
- Generated the native Android project with Expo prebuild. A local Android APK/AAB build remains unavailable: no Android SDK, Android Studio, Java, ADB, or Gradle executable was found in this environment. A cloud EAS build would need a user-controlled Expo account and project setup, which do not currently exist here.
- A local static server was started to visually inspect the web build, but the in-app browser could not connect to the workspace's localhost port and timed out. The server was stopped. Web bundle success does not prove the rendered UI or service-worker offline behavior in a real browser.

### 2026-10-24 — Stronger no-location/no-network privacy decision

- The user requirement that location remain on device with no service sharing was interpreted strictly. Expo's installed Android location implementation uses Google Play Services' fused location provider; therefore, automatic GPS/browser location was removed rather than relying on a provider that may use external services.
- Current app direction is manual latitude/longitude entry only, with observer coordinates saved in on-device AsyncStorage. No geolocation permission, GPS API, browser geolocation, or geocoder is used by app code. This supersedes the earlier permission-based location design; the earlier record remains unchanged.
- Removed `expo-location` from application dependencies and refreshed the lockfile. Removed Android and iOS location permission declarations. Android `blockedPermissions` now removes Internet, network-state, storage, overlay, and vibration permissions. Expo prebuild generated manifest removal directives for each; final APK permission state still needs verification from a completed native build.
- Added a web PWA manifest/icon and a post-export script that precaches generated static assets, caches a fallback document, and removes older Nightfall cache generations on update. This aims to make the web app usable offline after its first successful network visit. A browser-level offline test has not been completed.
- Updated the draft privacy notice and README to reflect manual-only coordinates and the native/web distinction. The web host necessarily serves the initial bundle; hosting and app-store metadata remain outside the app’s no-location-sharing guarantee.

### 2026-10-24 — Follow-up verification and catalog licensing

- Re-ran `pnpm typecheck` after the manual-coordinate/privacy changes; TypeScript compilation passed.
- Re-ran the web export after those changes. Expo produced the static web bundle (555 KB JavaScript) and the service-worker generator precached five export files. `node --check` passed for the generator and generated `dist/sw.js`. This verifies bundling and syntax only; no browser runtime/offline walkthrough was possible, so offline operation is not yet claimed as validated.
- Expo initially could not create its user-level settings directory due to workspace filesystem restrictions. Retried with Expo's internal unsafe-home override pointed to `.expo-local` in the workspace and telemetry disabled; export completed successfully. The generated directory is build-local and ignored.
- Catalog source review remains open. HYG is a promising candidate, but the official Codeberg upstream was inaccessible from the available browser tool and its current license could not be verified. No HYG or Gaia dataset has been added; the bundled catalog remains a small 20-star / 6-deep-sky sample pending verified source terms and attribution.
- The workspace still has no initialized Git repository or remote, so no GitHub download/release is available yet. No Android SDK/native build is available, and there is no Play Store, Expo EAS, or Apple developer setup; platform packages and store submissions remain uncreated.

### 2026-10-24 — HYG catalog and coordinate-frame improvements

- Verified HYG v4.1 licensing and field definitions from the archived upstream GitHub README: the dataset is CC BY-SA 4.0; coordinates are epoch/equinox 2000, and the CSV documents proper motion in milliarcseconds/year, magnitude, distance, and constellation. Source: https://github.com/astronexus/HYG-Database/blob/main/hyg/README.md.
- Downloaded the official archived HYG v4.1 CSV through the approved public-source download path. Added `scripts/build-hyg-catalog.mjs` and generated `src/data/hyg-stars-v41.json`, a 5,050-row subset for magnitude 6.0 or brighter after omitting 20 proper-name overlaps with hand-curated stars. The output is about 884 KB and includes converted RA degrees, J2000 coordinates, proper motion, magnitude, constellation, color index, and usable distance.
- Added `DATA_LICENSES.md` with attribution, transformation details, regeneration instructions, CC BY-SA 4.0 notice for the adapted star dataset, separate MIT code license, and current deep-sky limitations.
- Updated fixed-object sky calculations to propagate HYG proper motion from J2000 and rotate EQJ coordinates to equator-of-date before calculating local horizontal coordinates. This is a correctness improvement, not a validated accuracy claim; reference comparisons are still outstanding.
- Added the Sun to solar-system objects, with a direct-view eye safety note in its description.
- Updated README setup/status and added this catalog milestone to project documentation. The 6 deep-sky objects and incomplete illustrative constellation lines remain explicitly listed as release gaps.

### 2026-10-24 — User-approved foreground location following

- The user updated the location preference: automatic location should be available to avoid manually changing coordinates while traveling. This supersedes manual-only as the sole mode; manual coordinates remain available and old decision entries remain untouched.
- Chosen behavior: user-initiated, opt-in **Use my location**, foreground-only location following while the app is open, explicit stop control, manual fallback, no background permission/service, no route/history, and local persistence of only the current observing coordinates. The browser web target uses its secure-context geolocation permission. Location permission is requested only after the user taps the control.
- Implemented Android updates through the platform `LocationManager.GPS_PROVIDER` GNSS provider (not Expo's fused-location watch API) in a local Expo native module. The app does not post coordinates to a service. Android's operating system/device location stack may independently use assisted GNSS or other platform mechanisms; the app cannot guarantee or control those platform practices. README, in-app copy, and draft privacy notice state this boundary. Internet and background-location permissions remain blocked at the app-manifest level, pending merged-package verification.
- Added Expo SDK 57 `expo-location` 57.0.22 for foreground runtime permission prompts and web geolocation; Android location updates themselves use the local GNSS module. Background-location and foreground-service config-plugin options are explicitly disabled. The package and lockfile were updated after registry access was approved and pnpm's content store was redirected into the workspace.
- Location permission dialogs and satellite updates have not been exercised on a real Android device. Local GNSS module compilation and final manifest merging still require an Android build environment, unavailable in this workspace. Web location and offline runtime remain unverified in an actual browser.

### 2026-10-24 — Expanded offline deep-sky catalog and integration checks

- Verified OpenNGC's upstream README states CC BY-SA 4.0, documents its NGC/IC scope and source fields, and cites the source catalogs. Upstream: https://github.com/mattiaverga/OpenNGC. Queried the exact `master` commit and pinned the source snapshot to `be3cd6c5498806a2fbb2f7e0452ef802dbb02be0`.
- Downloaded pinned NGC and addendum CSVs and added `scripts/build-openngc-catalog.mjs`. The generated `src/data/openngc-bright-v1.json` contains 338 supported galaxy, nebula, and cluster records with a known V magnitude <= 9.0, parsed RA/Dec, type, common name, catalog ID, Messier alias, and constellation abbreviation; six curated duplicates are excluded. The output is 88,034 bytes and remains bundled for offline use.
- Extended the object model and search to include catalog/Messier aliases. Current object inventory is 5,050 imported HYG stars + 20 curated stars, 338 imported OpenNGC objects + six curated deep-sky entries, the Sun, Moon, and five planets.
- Added OpenNGC attribution/license and transform notes to `DATA_LICENSES.md`; updated README catalog, Sun, and location descriptions. Code remains MIT; both adapted data subsets are CC BY-SA 4.0.
- Latest `pnpm typecheck` passed. Android Expo prebuild passed; generated manifest includes coarse/fine foreground location and contains removal directives for Internet and background location. Expo autolinking resolves `@stargazing/local-gnss` to `LocalGnssModule`. This does not prove final APK permissions or native Kotlin compilation because no Android SDK/Gradle/Java is present.
- Latest web export passed with the enlarged bundle (about 1.5 MB JavaScript); service-worker generation completed. Node syntax checks passed for the service-worker generator, both catalog generator scripts, and generated `dist/sw.js`. Browser runtime/offline behavior remains unverified.
- The app now includes the Sun and 338 cataloged deep-sky objects; rise/set and twilight, complete constellation lines/boundaries, in-app offline browser verification, astronomy reference comparisons, physical Android testing, signed APK/AAB, GitHub publication, and store setup remain outstanding.
- Added `android.allowBackup: false` after confirming Expo's app-config reference states that Android's default permits app data backup to Google Drive. Current generated manifest contains `android:allowBackup="false"`; this prevents Android Auto Backup from uploading/restoring the local coordinates through that mechanism. It does not constrain OS/provider services, rooted-device access, or web browser/platform behavior.
- Initialized a local Git repository on branch `main`. All project source files are currently uncommitted, and no remote is configured. GitHub CLI is absent and no repository-creation action is available in the connected GitHub toolset; hosted download publication remains incomplete.

### 2026-10-24 — Local web preview and CI coverage

- Added `scripts/serve-dist.mjs` and the `pnpm preview:web` command to serve `dist/` on loopback for local PWA preview. The server resolves requests under `dist/`, rejects path traversal, serves `GET`/`HEAD` only, uses a no-cache header for `sw.js`, and accepts the optional `STARGAZING_PREVIEW_PORT` setting.
- Updated README with the export and preview flow. Expanded `.github/workflows/checks.yml` to use the pinned pnpm release, frozen lockfile installation, TypeScript compilation, web export, and JavaScript syntax checks for the exporter, preview server, and generated service worker.
- In this turn, `pnpm typecheck` and `pnpm export:web` succeeded; Expo web bundling produced a 1.5 MB JavaScript bundle and regenerated the service worker. `node --check` passed for the service-worker generator, preview server, and generated worker.
- Started the static preview successfully on port 4174. HTTP requests to loopback were denied by the workspace socket sandbox. The preview process was stopped afterward. The prior Windows Computer Use attempt also stopped because browser URL verification could not be performed safely. Therefore, the app's browser rendering and offline runtime remain unverified; the static build and worker syntax do not prove those behaviors.
- No Android SDK, Java, adb, Gradle, or GitHub CLI is available in the current environment. No Android binary, hosted repository, GitHub release, public website, Play Store listing, or Apple submission exists yet.

### 2026-10-24 — Location consent explanation and local-data clearing

- Added an in-app privacy explanation between tapping **Use my location** and opening the platform permission request. It says the app uses coordinates for sky calculations and does not send them to an app server, and distinguishes Android satellite GNSS or browser geolocation from operating-system/provider behavior that the app cannot control. Permission remains optional; manual coordinates remain available.
- Added **Clear saved coordinates** to the manual-coordinate panel. It stops following, removes the app's saved observing-coordinate entry, clears the displayed accuracy, and returns the chart to its clearly named example location. A guard ignores any late location callback after clearing so it cannot immediately recreate the removed entry.
- Updated README and the draft privacy notice to document this consent step and clear action. The source of truth remains append-only; no previous lines were edited or removed.
- Still not verified: device OS/provider network behavior, final merged Android manifest and package permissions, and native GPS runtime. These require real Android device/build validation. The app's guarantee is limited to its own code and service; it cannot guarantee that platform services never process location independently.

### 2026-10-24 — Location clear-action race handling

- Tightened the clear-saved-coordinates behavior so it invalidates a permission request still in progress and ignores late device-location callbacks. This prevents an in-flight request/update from turning following back on or restoring coordinates after the user clears them.
- Re-ran TypeScript compilation and web export after the consent and clear-control implementation; final results are recorded once the current export completes.
- Final verification completed: `pnpm typecheck` passed. `pnpm export:web` succeeded after setting Expo's unsafe home directory to the ignored workspace-local `.expo-local` folder and disabling Expo telemetry; it generated the 1.5 MB web bundle and precached five files. This is compile/export evidence only; browser interaction, offline behavior, Android native compilation, and physical-device permission/runtime behavior remain unverified.

### 2026-10-24 — Android build and APK permission CI gate

- Expanded `.github/workflows/checks.yml` with a separate Android job. On a GitHub-hosted Ubuntu runner it installs locked dependencies, generates a clean Android project from app config and local Expo modules, assembles a debug APK, and inspects the APK's final merged manifest.
- The manifest gate requires `ACCESS_FINE_LOCATION` and rejects `INTERNET`, `ACCESS_NETWORK_STATE`, and `ACCESS_BACKGROUND_LOCATION`. The APK is a CI validation artifact, not a signed Play Store release.
- Updated README to describe the configured gate. The workflow itself has not run because there is no configured GitHub remote; local Android build tools (Java/SDK) are absent. Therefore this change is a planned automated check, not evidence of a successful native build or a verified final privacy manifest.
- Local verification of this workflow edit: parsed `.github/workflows/checks.yml` with the installed YAML parser and confirmed both jobs are present; `pnpm typecheck` passed. No GitHub Actions runner execution or Android APK build was performed.

### 2026-10-24 — Android CI toolchain pinning

- Added explicit Android command-line tools setup and SDK package installation to the Android workflow: platform API 36, build tools 36.0.0, and NDK 27.1.12297006. These values match the checked-in React Native 0.86.3 version catalog; Expo's SDK 57 reference lists Android compile/target API 36: https://docs.expo.dev/versions/v57.0.0/.
- Re-parsed the final workflow YAML successfully and confirmed both web and Android jobs plus the Android SDK setup step are present. The hosted workflow remains unexecuted until a GitHub repository/remote is available.

### 2026-10-24 — Local next-rise/set estimates

- Added a local next horizon-crossing calculation for the selected star, deep-sky object, Sun, Moon, or planet. It evaluates apparent altitude every ten minutes for up to 48 hours and bisects a detected crossing 18 times; no service or network data is used.
- Selected-object details now show the next rise or set in the device time zone, or report no crossing within 48 hours. The UI notes that manually chosen locations may use another time zone and that terrain/local atmospheric conditions are not modeled. This is an estimate, not telescope-pointing precision.
- Updated README's feature limitations to reflect that rise/set is now available as a selected-object estimate; twilight, observation windows, light-pollution estimates, compass sensors, and other planned features remain absent.
- `pnpm typecheck` passed and `pnpm export:web` succeeded with the feature included in a 1.5 MB bundle; service-worker generation precached five files. Rise/set outputs have not yet been compared against an independent ephemeris/reference matrix, and no browser or device runtime check was completed.

### 2026-10-24 — Dynamic planetary and lunar display values

- Replaced fixed placeholder visual magnitudes for planets and the Moon with `Astronomy.Illumination` results at the selected time. Selected Moon and planet details now show the engine's illuminated fraction as a percentage as well as the dynamic apparent visual magnitude. Solar-system ephemeris and illumination calculations remain local and bundled.
- Updated README's implemented-feature summary. `pnpm typecheck` passed after this change. Final web-export result is recorded after the current export completes; no independent magnitude/phase comparison or runtime UI walkthrough has yet been done.
- Final web export succeeded with the updated calculations included in the 1.5 MB bundle and five files precached by the service worker. As with other export checks, this does not confirm browser rendering or correctness against an external astronomy reference.

### 2026-10-24 — Rise/set cross-check and catalog astrometry note

- Cross-checked the local next-crossing search against Astronomy Engine 2.1.19's built-in `SearchRiseSet` for New York, beginning 2026-10-24 12:00 UTC. Sun and Moon differed by 1.4 minutes; Mars, Jupiter, and Sirius differed by less than 0.1 minute. This supports the local search/interpolation implementation for those cases, but is not independent validation of Astronomy Engine ephemerides or all locations/times.
- Verified HYG v4.1 README fields: J2000 epoch/equinox and proper motion in mas/year. The current position code interprets `pmra` as tangent-plane μα* = μα cos(dec), then divides by cos(dec) to update RA; this matches the official Hipparcos proper-motion field convention. HYG's README does not explicitly specify the cos(dec) convention for all combined source catalogs, so `DATA_LICENSES.md` now records this as an assumption needing catalog-wide spot checks.
- Renamed the sky-calculation argument to `pmRaCosDec` and added an explanatory code comment. The linear propagation does not model radial-velocity perspective acceleration. Independent catalog-wide astrometric validation remains required before accuracy claims.
- Evidence sources: HYG v4.1 documentation https://github.com/astronexus/HYG-Database/blob/main/hyg/README.md and official ESA Hipparcos catalog volumes https://www.cosmos.esa.int/documents/532822/552851/vol1_all.pdf.

### 2026-10-24 — Astrometry convention naming verification

- `pnpm typecheck` passed after renaming the proper-motion parameter to `pmRaCosDec` and documenting its convention assumption.
- Reviewed the official ESA Hipparcos documentation: its RA proper-motion component is μRA* = μRA cos(dec), in mas/year. This supports the implemented conversion for Hipparcos-derived values. The HYG field list describes `pmra` only as proper motion in right ascension and combines multiple source catalogs, so the inference remains explicitly qualified rather than generalized as a fully verified HYG-wide guarantee.
- A direct JPL Horizons API output request was not accessible through the available browser tool. The rise/set diagnostic therefore remains a same-engine algorithm cross-check only; external position/brightness validation is still an open requirement.

### 2026-10-24 — IAU constellation figure coverage

- Replaced the small hand-authored subset of constellation connections with bundled IAU/Sky & Telescope stick-figure line data. The source was pinned to `dcf21/constellation-stick-figures` commit `75d29c207bbd752023c447ddd1f9f4ff0eb47538`; the imported data file's verified Git blob SHA is `ecd471ed36babfa3ebd43c2c55540b79021c2dc1`.
- Added a repeatable generator that maps source HIP identifiers onto HYG v4.1 stars, preserves curated identifiers where appropriate, and splits line sequences when an endpoint is missing instead of drawing a false connection. The generated offline asset contains 164 polylines covering 86 named constellations with available figures; Serpens is represented as head and tail, producing 87 source group labels. Mensa and Microscopium have no figures in this source. Two endpoints, HIP 10826 (Cetus) and HIP 55203 (Ursa Major), are absent from the app's magnitude-6 star subset and their affected sequences are split.
- License documentation records the source repository README's file-specific CC BY 4.0 attribution for the IAU line file; the source file's generic GPL header is retained, and the README distinction is the stated basis for this data attribution. This licensing interpretation is recorded rather than silently treating the entire repository as CC BY.
- Updated the chart and README to use/document the bundled figures and remaining boundaries/coverage limitations. Validation: `pnpm typecheck` passed; generator JavaScript syntax and workflow YAML parsed successfully; `pnpm export:web` succeeded with a 1.5 MB web bundle and five service-worker precache entries. Visual chart review, browser runtime behavior, licensing review, and Android native build/device validation remain open.

### 2026-10-24 — Android prebuild evidence, CI downloads, and red-light chart

- Ran `pnpm exec expo prebuild --platform android --no-install --clean` successfully. Expo Autolinking's Android resolver found `@stargazing/local-gnss` at `modules/local-gnss/android` and registered `app.stargazing.gnss.LocalGnssModule`. This verifies generated-project setup and local-module discovery, not Kotlin compilation or device runtime. Expo's documentation describes local module discovery from the default `./modules` directory: https://docs.expo.dev/modules/autolinking/.
- Inspected the generated `android/app/src/main/AndroidManifest.xml`: it requests coarse and fine foreground location, applies removal rules to Internet, network-state, and background-location permissions, and sets `android:allowBackup="false"`. The final APK's merged manifest still must pass the Android CI check; a source manifest alone does not prove the packaged result.
- Extended `.github/workflows/checks.yml` to upload the successful static web export and permission-checked Android debug APK as `stargazing-web-pwa` and `stargazing-android-debug-apk` Actions artifacts, each retained for 30 days. These are temporary downloads from a workflow run, not a permanent tagged GitHub Release. The workflow has not run because no GitHub remote is configured.
- Updated red-light mode so the sky chart, object colors, constellation strokes, cardinal labels, and legend all use a red palette. The regular chart palette remains unchanged. This fixes the previous partial mode where chart marks retained blue/white colors.
- Verification after the chart change: `pnpm typecheck` passed; `pnpm export:web` succeeded with a 1.5 MB JavaScript bundle and five precached files; generator, web-cache, static-server, and generated service-worker JavaScript syntax checks passed; workflow YAML parsed and both artifact-upload steps were confirmed; generated manifest assertions passed. The generated service worker has not yet been exercised by a browser offline/online interaction test.
- Visual browser review could not be completed in this environment: the in-app browser timed out opening the local preview host and shell HTTP access was denied by the environment. `java`, Android SDK, Gradle, and ADB are unavailable locally, so APK compilation, installation, device behavior, and final manifest inspection remain unverified. No public repository, public release, Play Store listing, or iOS/App Store submission exists yet.

### 2026-10-24 — GitHub Actions release-tool updates

- Updated the workflow's GitHub-maintained action references to current documented major lines: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/setup-java@v6`, `android-actions/setup-android@v4`, `actions/upload-artifact@v7`, and `pnpm/action-setup@v6`. The project still pins Node.js 22 and Java 17 for the app build; action implementation versions and app toolchain versions are separate choices.
- References checked from the action maintainers' documentation: https://github.com/actions/checkout, https://github.com/actions/setup-node, https://github.com/actions/setup-java, https://github.com/android-actions/setup-android, https://github.com/actions/upload-artifact, and https://github.com/pnpm/action-setup. These updates have only been YAML-validated locally; no hosted Actions execution has confirmed runner compatibility or artifact publication.

### 2026-10-24 — Offline worker CI gate and Android location copy

- Added a Node.js simulation check for the generated web service worker and wired it into the web CI job after export. It verifies all five current export files enter the versioned precache, stale app caches are removed without deleting unrelated caches, and offline page/bundle requests return cached responses. It does not claim real-browser offline behavior.
- Corrected the Android permission message from “satellite tracking” to “accurate sky positioning”; the app does not track satellites in this release.
- Re-ran TypeScript compilation and web export after the copy change. Both passed; the resulting web JavaScript remained 1.5 MB. `node --check` and the offline-worker simulation passed, and workflow YAML validation confirmed the offline check and both CI artifact-upload steps are present.
- Read-only GitHub account inventory returned no accessible repositories, and the local Git repository has no configured remote. Therefore these changes are not published and CI has not executed. GitHub Actions artifacts remain planned temporary downloads, not public releases.

### 2026-10-24 — Offline service-worker behavior check

- Added `scripts/check-web-offline.mjs`, a Node.js harness that executes the generated `dist/sw.js` with simulated service-worker events, cache storage, and network responses. It checks that install precaches every exported file, activation removes stale app caches but preserves unrelated caches, offline navigation falls back to the cached HTML page, and offline JavaScript requests are served from cache.
- Added the check to the web GitHub Actions job after `pnpm export:web`, so it evaluates the exact generated deployment bundle. Updated README to describe the gate and its scope.
- Local verification: `node --check scripts/check-web-offline.mjs` passed and `node scripts/check-web-offline.mjs` passed for five precached files. The harness simulates Cache API/service-worker behavior; it does not verify a browser engine, installation UX, actual offline mode, geolocation permissions, or visual layout. Those real browser/device checks remain open.

### 2026-10-24 — Standalone Android preview APK workflow

- Changed the Android workflow from `assembleDebug` to `assembleRelease`. React Native's generated Gradle configuration treats `debug` as a debuggable variant and skips bundling the JavaScript app; the release variant is required for an APK intended to launch standalone. This supersedes earlier source-of-truth and README references to uploading a debug APK; those records remain intact as historical plans.
- The Android job now expects `app-release.apk`, inspects the APK's actual merged permission list, rejects Internet/network-state/background-location permissions, checks the packaged manifest for `android:allowBackup="false"`, and confirms `assets/index.android.bundle` is present before artifact upload. It uses the generated development debug signing configuration. This is a sideloadable preview path, not a production signing key, Play Store AAB, or permanent GitHub Release.
- Renamed the CI artifact to `stargazing-android-preview-apk` and updated README to describe the actual output and verification scope.
- Basis: generated `android/app/build.gradle` marks `debuggableVariants` as the variants for which JavaScript bundling is skipped and sets the generated release variant to the development debug signing config. Expo's Android SDK setup documentation lists `apkanalyzer` among tools on the configured PATH: https://github.com/android-actions/setup-android.
- Hosted build and APK checks remain unexecuted because there is no configured GitHub remote or accessible repository. YAML validation is the next local gate; no packaged APK should be claimed until GitHub Actions or a local Android toolchain completes the build and inspections.

### 2026-10-24 — Standalone APK workflow configuration validation

- Parsed the updated workflow YAML and asserted that the Android job selects `:app:assembleRelease`, runs APK-level bundle/manifest/permission checks, and uploads the release output under `stargazing-android-preview-apk`. The workflow configuration check passed.
- Re-ran the offline service-worker simulation and syntax check against the current web export; both passed for the five-file precache. No Android build was attempted because Java/SDK/Gradle are absent locally. The upload step and final APK inspection have not executed on a hosted runner.

### 2026-10-24 — CI token permission scope

- Restricted the checks workflow's `GITHUB_TOKEN` to repository contents read access. The workflow only reads source, builds artifacts, and uploads through the Actions artifact runtime; no repository write permission is configured.
- Re-parsed `.github/workflows/checks.yml` and asserted the read-only permission, Android standalone APK checks, and web offline simulation step; the configuration check passed. Hosted execution remains pending a GitHub repository.

### 2026-10-24 — Public display name and platform metadata

- Chose **Nightfall Stargazing** as the public display name. This combines the existing Nightfall identity already used in the app header and web install name with “Stargazing” so the app's purpose is clear in Android launchers, browser tabs, and documentation.
- Updated Expo app config, generated Android launcher label, PWA manifest, README title, privacy notice heading/copy, contributing guidance, and in-app location/privacy copy to use the selected display name. Kept `app.stargazing.sky`, the `stargazing` URL scheme, and the repository/package slug unchanged to preserve technical identifiers.
- Validation: `pnpm typecheck` and `pnpm export:web` passed. The exported HTML title and generated web manifest both show Nightfall Stargazing; clean Android prebuild succeeded and generated `app_name` is Nightfall Stargazing while `applicationId` remains `app.stargazing.sky`. The offline service-worker simulation passed for five precached files. This does not replace a rendered browser or installed Android check.

### 2026-10-24 — Android toolchain and repository availability recheck

- Checked the current PATH and standard Windows locations for Android Studio, Android SDK, Java, ADB, Gradle, and GitHub CLI. None are installed or available in this environment. Rechecked `git remote -v`; no remote is configured. The connected GitHub repository inventory previously returned no accessible repositories.
- Local work can continue, but an Android APK build and public GitHub upload require a hosted repository/remote or a newly available Android build toolchain. The product remains unpublished; the web export is locally generated and the APK is only defined as a hosted CI output.

### 2026-10-24 — Manual GitHub Actions run option

- Added the `workflow_dispatch` trigger to `.github/workflows/checks.yml`. Once the code is pushed to a GitHub repository, a maintainer can manually run the same web validation and Android preview build from the Actions tab without creating a no-op commit.
- Updated README's CI instructions. Local YAML validation confirms `push`, `pull_request`, and `workflow_dispatch` triggers; no hosted workflow has run because no repository is connected.

### 2026-10-24 — Release and download guide

- Added `RELEASING.md` to document how to obtain the temporary Android preview APK and web PWA artifacts after CI runs, how to install/host those outputs, and which conditions must be satisfied before calling either one a verified public v1 release.
- The guide explicitly states that no public repository or release currently exists, that the Android artifact uses development signing, that Actions artifacts expire after 30 days, and that the web export needs root HTTPS hosting and a real browser offline walkthrough. It also records physical Android, independent astronomy validation, final privacy disclosures, Play AAB signing, and later iPhone/App Store support as open release requirements.
- Linked the guide from README. Documentation-only change; hosted downloads remain unavailable until a GitHub repository/remote is connected.

### 2026-10-24 — Bundled sky-catalog position regression check

- Added `scripts/check-sky-catalog.mjs` and the `pnpm check:sky` command. The check compiles the sky module to a temporary ignored directory, then runs the complete 5,421-object catalog through five date/location cases: New York, the equator, the North Pole, the South Pole, and Sydney.
- It checks the current catalog count, unique object IDs, finite altitudes and azimuths, and valid output ranges. The temporary compiler output is verified to stay inside `node_modules` and is removed after execution.
- Added the check to the GitHub web job before the static export and updated README. `pnpm check:sky` passed across all five cases and `pnpm typecheck` passed. These are data/output sanity checks using the app's Astronomy Engine; they do not independently validate the ephemeris or prove catalog astrometric accuracy.

### 2026-10-24 — Stale location callback invalidation

- Unified the stop-following, apply-manual-coordinates, and clear-saved-coordinates paths so they synchronously invalidate both a pending permission request and the active location-session generation. Location callbacks now check their captured session before changing coordinates; effect cleanup also invalidates its session and ignores late permission/start results.
- This closes a race where a GPS/browser location callback could arrive after the user selected manual coordinates or stopped following but before React effect cleanup detached the watcher. The change keeps coordinates local; it only controls whether a late callback can overwrite local observing state.
- Verification: `pnpm typecheck`, `pnpm check:sky`, and `pnpm export:web` passed; the generated service-worker offline simulation still passed for five cached files, and CI YAML parsed with the sky and offline regression checks present. Physical Android/web permission interaction and race behavior still need device/browser testing.

### 2026-10-24 — Startup storage hydration precedence

- Added per-setting hydration override flags for saved targets, red-light preference, observing coordinates, and location-follow preference. Initial AsyncStorage reads now apply only when the user has not changed that setting since app startup. Clearing saved coordinates or stopping following therefore cannot be undone by a slower startup read that returns stale persisted values.
- Validated the stored observer coordinates and place label before applying them. Existing user changes remain local and continue to use the current persistence behavior.
- Verification: `pnpm typecheck` passed; `pnpm check:sky` passed for the full 5,421-object catalog at five locations; web export succeeded; generated service-worker syntax/offline simulation passed for five files; workflow YAML parsed with both automated web regression checks. Real Android/web hydration timing and permission behavior still require runtime testing.

### 2026-10-24 — Client state race regression coverage

- Extracted startup preference hydration and location-session invalidation into `src/client-state-guards.ts`, with a standalone regression script that simulates delayed storage reads, untouched preference hydration, stopped watchers, and watcher restarts.
- Added `pnpm check:state` and made it part of the GitHub web check job. The README now lists the check and describes its coverage.
- Verification: `pnpm typecheck`, `pnpm check:state`, and `pnpm check:sky` passed; web export succeeded and the generated service-worker offline simulation passed for five cached files. Workflow presence and JavaScript syntax checks passed. No hosted CI or physical device behavior has been verified.

### 2026-10-24 — Keep the Android GNSS module in source control

- Found that the broad `.gitignore` rule `android/` also matched the nested `modules/local-gnss/android/` source tree. A dirty workspace could prebuild successfully while a fresh Git checkout omitted the custom native implementation, making the Android location feature unavailable or the native build fail.
- Anchored the generated-project ignore rule at `/android/` so the root Expo-generated project remains ignored and the local GNSS module is included in the repository. Added `scripts/check-android-module.mjs` and `pnpm check:android-module`; CI runs the check before Android prebuild and validates the source file's Expo registration, GPS provider, fine permission check, cleanup, and lack of network/background-location code.
- Verification: `git status` now reports `modules/local-gnss/` as untracked source and `git check-ignore` does not ignore its Kotlin implementation. The module check passed. A clean Android Expo prebuild completed, and `expo-modules-autolinking resolve --platform android` listed `@stargazing/local-gnss` with `app.stargazing.gnss.LocalGnssModule`. Native Kotlin/Gradle compilation and packaged APK inspection are still pending an Android toolchain/hosted CI.

### 2026-10-24 — First-release network and accuracy validation decision

- Kept Android app network access disabled for the first release because all current catalog data and sky calculations are bundled and no online feature is required for live local positioning. The app updates the calculated chart with local time and optional foreground device coordinates; the web PWA requires an initial page download/host but has no app data API or analytics request. An internet connection being acceptable does not require adding a network permission or transmitting location. Revisit only if a concrete online feature is selected, and keep it opt-in and independent of precise coordinates.
- Rechecked current app/source for application-level fetch, XHR, Axios, or WebSocket use. No app content or location upload client was found; the service worker fetches same-origin app assets for install/update and has cached offline fallbacks. The generated Android manifest retains fine/coarse foreground location, removes Internet/network-state/background-location permissions, and sets `allowBackup=false`. This source/config evidence still needs packaged APK verification.
- Investigated independent ephemeris validation against the official JPL Horizons API. JPL's documentation supports topocentric apparent azimuth/elevation (observer quantity 4), but the web-fetch environment could not retrieve a live API response. No comparison result is claimed; representative online or downloadable JPL reference values remain a release gate. Documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html and https://ssd.jpl.nasa.gov/horizons/manual.html.
- Verification in this workspace: clean Expo Android prebuild and Expo module resolution passed; manifest source inspection confirmed permission removal directives and disabled backup; `pnpm typecheck`, `pnpm check:android-module`, `pnpm check:state`, `pnpm check:sky`, generated worker syntax, and the five-file service-worker simulation passed. No Java/Android SDK/Gradle, configured Git remote, or accessible GitHub repository is available, so native compilation, hosted CI, APK creation, and publication remain incomplete.

### 2026-10-24 — Offline astronomical-night observing planner

- Implemented `bestTonightTargets` in `src/sky.ts`. It searches the following 36 hours for the next interval with the Sun below −18° altitude, evaluates bright naked-eye stars (magnitude 2.5 or brighter), bundled deep-sky objects (magnitude 6 or brighter), the Moon, and the visible planets at 30-minute intervals, then returns up to five targets with altitude of at least 15° ranked by sampled peak altitude.
- The planner uses only the bundled catalog and Astronomy Engine on-device; it does not access a network or send observer coordinates. Tapping a target switches the planning clock to the sampled best time and shows its computed horizontal position. If no astronomical darkness is found in the next 36 hours (for example, polar summer), the UI explains that no recommendations are available.
- Added planner regression assertions to `scripts/check-sky-catalog.mjs` for a normal New York night, ranked/valid recommendations, and no false darkness at the North Pole in midsummer. Updated README to document the planner and its limits: best time is sampled at 30-minute intervals, displayed in the device time zone, and does not model weather, terrain, light pollution, or local atmospheric conditions.
- Verification: `pnpm typecheck`, `pnpm check:sky` (including planner checks), `pnpm check:android-module`, `pnpm check:state`, web export, generated service-worker syntax, and offline service-worker simulation passed. Planner sampling is an observing aid, not an independently validated visibility forecast or telescope-pointing solution.

### 2026-10-24 — Browser preview attempt

- Started the local static PWA preview on loopback port 4174 after the default port 4173 was already occupied. The in-app browser could not reach either `127.0.0.1:4174` or `localhost:4174` and returned `ERR_CONNECTION_TIMED_OUT`; the preview server was then stopped. No screenshot or browser-rendering claim is made.
- The final web export exists in ignored local `dist/`, and the generated service-worker simulation continues to pass. Real browser rendering, geolocation permission UX, and online-install/offline-relaunch behavior still require a browser/runtime that can reach the preview or a hosted deployment.

### 2026-10-24 — Branded native app icon

- Added a reproducible, dependency-free Node renderer at `scripts/build-app-icon.mjs` that rasterizes the existing `public/icon.svg` vector mark into a 1024×1024 PNG at `assets/icon.png`. The renderer handles the exact SVG primitives used by the logo and supersamples before writing the PNG.
- Configured the PNG as the shared Expo app icon and Android adaptive-icon foreground with a matching `#080d14` background. Added `pnpm build:icon` to the README setup commands and both GitHub Actions jobs so a clean checkout generates the required asset before build/prebuild.
- Added 512px and 192px PNG icon fallbacks to the PWA manifest alongside the existing SVG mark, plus a 180px Apple touch icon for future web homescreen installation. The generator writes all platform sizes from the same source vector.
- Verification: `pnpm build:icon` passed and the resulting 1024×1024 icon was visually inspected. A subsequent clean Android prebuild generated adaptive launcher resources at all densities with the branded foreground and matching dark background. No APK or iOS build exists yet.

### 2026-10-24 — Cross-platform icon exports and launch-screen dependency check

- Extended the vector rasterizer to produce validated 1024px native, 512px/192px PWA, and 180px Apple touch icon files. The generator now asserts the PNG dimensions, Expo native icon references, and each PWA manifest icon file before CI can pass.
- `pnpm export:web` now includes the PWA icon assets and the offline-worker simulation passes for all eight precached files. A clean Expo Android prebuild produces the adaptive foreground resources at all density buckets.
- Reviewed Expo SDK 57 splash guidance. Adding its recommended `expo-splash-screen` config plugin requires a new package, but package registry DNS resolution failed (`ENOTFOUND`) and pnpm could not resolve dependencies in this environment. No partial dependency/config change was retained; the native splash artwork remains the generated template default and is an acknowledged visual release gap. The app-icon work is independent and complete at source/prebuild level.

### 2026-10-24 — Independent Mars ephemeris reference check

- Retrieved an actual topocentric Mars position from the NASA/JPL Horizons API for a fixed public test point in New York City (40.7128° N, 74.006° W, sea level) at 2026-10-25 00:00:00 UTC. The Horizons response identifies Mars 499, observer quantity 4 (airless apparent azimuth/elevation), and reports azimuth 1.633032° clockwise from north and airless elevation −31.550397°. The query parameters, values, test coordinates, and tolerance are preserved in `data/horizons-mars-ny-2026-10-25.json`; no device location or user data was involved.
- Extended `pnpm check:sky` to calculate Mars topocentrically with Astronomy Engine and compare its airless horizontal coordinates to that independent reference within 5 arcseconds. The check passed: app azimuth 1.633480° (difference 1.61 arcseconds), airless elevation −31.550921° (difference 1.88 arcseconds). The visible app chart uses Astronomy Engine's normal refraction mode; this independent comparison deliberately disables refraction to match Horizons' AIRLESS output.
- This validates one planet, time, and observing location at the tested tolerance; it does not establish all-date ephemeris accuracy, stellar/deep-sky catalog astrometry, device compass alignment, or end-to-end pointing accuracy. Broader reference cases and physical-device verification remain release work.
- NASA/JPL Horizons API documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html.

### 2026-10-24 — Expanded independent solar-system position references

- Added two additional NASA/JPL Horizons observer-quantity-4 airless fixtures, with full reproducible query settings and fixed public coordinates: Moon over New York at 2026-10-25 00:00 UTC, and Jupiter over Sydney at 2026-03-20 12:00 UTC. They are stored in `data/horizons-moon-ny-2026-10-25.json` and `data/horizons-jupiter-sydney-2026-03-20.json`; neither fixture uses device-derived location.
- Generalized `pnpm check:sky` to check Mars, Moon, and Jupiter against the independent Horizons output, each within 5 arcseconds in azimuth and airless altitude. This broadens coverage to a natural satellite and a second planet, and spans two observing sites and dates. The Moon azimuth check is close to the threshold, so its exact reference output and 5-arcsecond tolerance are retained for reproducibility.
- These three samples remain a limited ephemeris validation matrix. They do not validate every date or solar-system body, star/deep-sky catalog astrometry, atmospheric refraction, physical compass sensors, or pointing accuracy on hardware.

- Observed differences for the added reference cases: Moon azimuth 4.87 arcseconds and airless altitude 0.71 arcseconds; Jupiter azimuth 2.12 arcseconds and airless altitude 0.01 arcseconds. All are within the stated 5-arcsecond tolerance. The Moon azimuth is the limiting sample and should be rechecked if the astronomy dependency, time conversion, or Horizons source settings change.
- Rechecked the catalog attribution documents against the upstream HYG v4.1 and OpenNGC license/readme records and the IAU figure-source repository; the documented CC BY-SA 4.0 and CC BY 4.0 treatment matches those recorded sources. No catalog data or license was changed in this review.

### 2026-10-24 — Sun and Venus reference cases

- Added independent NASA/JPL Horizons airless observer fixtures for the Sun at the geodetic equator (2026-06-21 12:00 UTC) and Venus from London (2026-10-25 00:00 UTC), using the same reproducible observer-position query format as earlier fixtures. Full parameters and fixed coordinates are stored in `data/horizons-sun-equator-2026-06-21.json` and `data/horizons-venus-london-2026-10-25.json`.
- Extended the automated comparison matrix to all five major solar-system targets (Sun, Moon, Venus, Mars, and Jupiter), across four public test locations (New York, Sydney, London, and the equator) and multiple dates. Sun is compared at 5 arcseconds; Venus is assigned a 40-arcsecond per-case tolerance after observing a 35.85-arcsecond azimuth difference while far below the local horizon. That loose below-horizon azimuth result is not a visible-sky accuracy claim and remains explicitly recorded rather than hidden behind a universal tolerance.
- The existing Moon case also approaches its 5-arcsecond limit. These references are sparse, hand-recorded snapshots, not a statistically complete ephemeris validation or full uncertainty budget. Continue adding independently sampled visible positions and investigate tolerance outliers before making accuracy guarantees.

### 2026-10-24 — Five-body Horizons matrix and local release-path verification

- Added fixed NASA/JPL Horizons fixtures for the Sun at the equator and Venus in London, bringing the automated solar-system comparison to five targets: Sun, Moon, Venus, Mars, and Jupiter. The test matrix now spans New York, Sydney, London, and the equator. All five cases pass `pnpm check:sky`; Venus is deliberately allowed a separate 40-arcsecond tolerance because its below-horizon azimuth differs by about 35.85 arcseconds, while the other cases use 5 arcseconds.
- Local validation passed: `pnpm typecheck`, `pnpm check:state`, `pnpm check:android-module`, `pnpm build:icon`, `pnpm check:sky`, web export, generated service-worker syntax check, and offline simulation for all eight precached web files. The first export attempt hit a Windows permissions error when Expo tried to create its default user-profile cache directory; rerunning with project-local `EXPO_HOME` and telemetry disabled succeeded without granting broader filesystem access.
- Re-ran Android Expo prebuild from the project configuration; the generated Android directory was cleared and recreated successfully, with no package.json changes. This confirms prebuild generation only; Java/Android SDK/Gradle are absent, so no APK/AAB compilation or device install was performed.
- Current publication status remains unchanged: no Git remote is configured, therefore GitHub Actions has not executed and no downloadable GitHub release is available. No public website, Play Store listing, or signed production Android package exists.

- Checked GitHub repository access through the connected GitHub integration during this release pass; it returned an empty accessible-repository list. `git remote -v` is also empty. The connector exposes repository content/PR operations but no repository-creation operation in this session, so publication cannot be completed from this workspace state.

### 2026-10-24 — Build-time privacy and workspace cleanup

- Set `EXPO_NO_TELEMETRY: '1'` at the GitHub Actions workflow level. Expo documents this variable as an opt-out from anonymous CLI usage collection. This governs build tooling only; it does not alter app runtime calculations, location permissions, or distribution/network needs. Reference: https://docs.expo.dev/more/expo-cli/.
- Added the root-anchored `/.pnpm-home/` ignore rule for the temporary project-local pnpm store created during package resolution attempts. Confirmed `git check-ignore` matches the store path; no cached package files should be mistaken for application source when preparing a repository upload.
- Validation: parsed `.github/workflows/checks.yml` using the workspace's installed YAML parser and confirmed the telemetry environment plus both jobs; Expo public config resolved to Nightfall Stargazing with project-local `EXPO_HOME` and telemetry disabled. No app permission or dependency changed.

### 2026-10-24 — Versioned GitHub preview publication path

- Extended the existing checks workflow with a `publish-preview` job that runs only when a `v*` tag is pushed and only after both web and Android build/check jobs succeed. The release job verifies that the tag equals the Expo app version in `app.json`.
- The job downloads the matching workflow-run artifacts, creates a permanent GitHub pre-release with a sideloadable development-signed Android APK, a root-ready web PWA ZIP, release notes, and SHA-256 checksum file. The notes distinguish this preview from a Play production build and state the PWA's HTTPS/first-online-visit requirements.
- Scoped `contents: write` and Actions artifact read permission to the tag-gated release job only; the existing build jobs retain repository read-only permissions. GitHub Actions artifacts remain temporary 30-day downloads for ordinary pushes/PRs.
- Documented the manual tag-based publication steps and cautioned that pushing a tag is a public release action requiring review. This configures the release path but does not publish a release: no Git remote or accessible GitHub repository is currently configured, and the action has not executed on GitHub.

- Validation after adding the permanent release path: the workflow YAML parses, the preview job's `v*` tag condition and web/Android dependencies are present, write permission is scoped to that job, both build artifacts are downloaded by name, and `gh release create` is configured with `--verify-tag --prerelease`. GitHub's official `actions/download-artifact@v8` documentation supports downloading named artifacts from the current workflow run; the Android artifact is a single APK rooted in its artifact archive. GitHub CLI documents `gh release create` asset upload and `--verify-tag`. References: https://github.com/actions/download-artifact and https://cli.github.com/manual/gh_release_create. No hosted execution is claimed.

### 2026-10-24 — Screen-reader labels for primary controls and chart objects

- Added accessible button roles, contextual labels, and selected state to the red-light toggle, location/manual controls, observing-time controls, guide, target/detail controls, save/remove actions, catalog filters, and saved-object rows. Added explicit latitude, longitude, and search input labels/hints.
- Added accessible names to selectable SVG sky markers with the object's name, kind, altitude, and compass azimuth. Removed a duplicate press handler from the visible marker so its larger transparent hit area is the single selectable element.
- Refactored Tonight and catalog cards to make object selection and save/remove actions sibling controls instead of nesting one pressable inside another; increased icon action hit slop. This should give assistive technology distinct actions and prevent a save tap from also selecting the object.
- Updated README to describe source-level accessibility work while retaining real screen-reader/device verification as an open release gate.
- Verification: `pnpm typecheck` passed; `pnpm check:sky` and `pnpm check:state` passed; web export completed and the generated worker passed syntax and offline simulation checks for eight cached files. An initial typecheck caught unsupported `accessibilityRole` on SVG Circle; removed it while retaining the supported accessible label. No physical VoiceOver/TalkBack check was available.

### 2026-10-24 — Privacy-aware GitHub issue forms

- Added GitHub issue forms for bug reports and feature requests under `.github/ISSUE_TEMPLATE/`. The bug form collects app version, platform, device/browser description, reproduction steps, behavior, and an optional broad location mode; it specifically tells users not to publish exact coordinates, location trails, account data, serial numbers, or advertising IDs. The feature form records need, proposed behavior, and platform without requesting personal or location data.
- Parsed both forms with the workspace YAML parser and verified each has a name and body fields. This improves repository support and reinforces the local-location privacy design in public issue reporting; the forms have not yet been rendered by GitHub because the project repository is not connected.

- Privacy refinement to the bug form: its location guidance now says never post the reporter's latitude/longitude and asks reporters to use the app's built-in Example location when location context is needed. The optional field only asks which location mode was in use, not where the person was. Reparsed both issue forms and reran `pnpm typecheck`; both passed.

### 2026-10-24 — Automated client privacy source guard

- Added `scripts/check-client-privacy.mjs` and the `pnpm check:privacy` command. It scans app-owned TypeScript/JavaScript runtime files for direct `fetch`, beacon, XHR, WebSocket, EventSource, and known analytics/telemetry SDK imports, and scans declared package/development dependencies for common telemetry SDK names. It does not scan third-party dependency internals or prove runtime/network behavior by itself; Android's merged-manifest permission check remains a separate stronger platform gate.
- Added the privacy guard to the GitHub Actions web job and `node --check` list, and documented the local command in README. GitHub workflow-wide permissions remain `contents: read`; only the isolated tagged-release job has write permission.
- Verification: `pnpm check:privacy` passed over four app-owned JS/TS files; `pnpm typecheck`, `pnpm check:sky` (including five JPL fixtures and all 5,421 catalog entries), and `pnpm check:state` passed. Parsed the workflow YAML and confirmed the privacy check is in the web job and global permissions remain read-only. The actual app network behavior still needs installed-package/device and web-browser audit.

- Expanded the client privacy guard to flag direct references (including aliases) to browser/mobile fetch, beacon, XHR, WebSocket, and EventSource transports, plus imports/requires of common telemetry SDKs and HTTP client packages such as Axios, node-fetch, SuperAgent, Got, and graphql-request. Re-ran `pnpm check:privacy` and `pnpm typecheck`; both passed with the current app source. The guard is a source-level tripwire, not proof against obfuscated code, transitive library behavior, or platform-provider communications.
- Re-parsed the updated GitHub workflow and confirmed both the privacy command and its script syntax check are present in the web job. Rechecked the current workspace for Git remotes and Android `.apk`/`.aab` files; neither is present, so no build or publication claim is made.

### 2026-10-24 — In-app source credits and software license inventory

- Added an expandable, screen-reader-labelled “Sources & licenses” panel at the bottom of the app. It credits the HYG star subset, OpenNGC subset, IAU stick figures/transcription, Astronomy Engine, and the MIT-licensed direct app software dependencies. The panel is bundled in Android/web app code and does not use network links or fetches; the expanded data processing, exact versions, upstream sources, and terms are recorded in `DATA_LICENSES.md`.
- Added a direct runtime dependency inventory to `DATA_LICENSES.md` for the exact package versions in `package.json`/lock-installed metadata. All ten direct runtime dependencies report MIT licensing. Existing HYG/OpenNGC CC BY-SA 4.0 and IAU CC BY 4.0 data terms remain separate and unchanged.
- Updated README to describe the in-app attribution panel. Validation: `pnpm typecheck`, `pnpm check:privacy`, `pnpm check:sky`, `pnpm check:state`, `pnpm check:android-module`, and `pnpm build:icon` passed. Web export succeeded; generated worker syntax and offline simulation passed for all eight precached files.
- Attempted to open the exported `file://` page in the in-app browser for a real visual review; browser URL security policy rejected the protocol. No alternate browser route was attempted and no rendering/screen-reader runtime claim is made.
- Rechecked external release prerequisites: no Git remote/repository is connected and no Android APK/AAB exists in the workspace. The public repository destination response is still pending; publication, hosted CI, and device installation remain unverified.

### 2026-10-24 — Automatic location following and privacy boundary

- Confirmed the current app already supports opt-in automatic location following: it requests permission only after the user selects “Use my location”, updates the sky while the app is foregrounded, stops the watcher when backgrounded or when the user stops following, and stores only the latest observing coordinates locally. Android uses the app-owned GPS_PROVIDER module; Android Auto Backup is disabled and the app manifest removes Internet permission. Web location uses the browser geolocation API.
- Clarified README privacy language: Nightfall has no location upload, account sync, or location analytics feature, but no app can guarantee that the operating system, browser, or location provider independently never processes location, nor prevent access on an unlocked/compromised device. The web host sees ordinary asset requests/IPs when the web app is downloaded, but the app does not send coordinates to that host. Manual coordinates and denying permission are the strictest user-controlled alternative. No location permission or follow mode is required for manual use.
- This is a code/configuration privacy boundary, not a guarantee against OS/provider processing or device compromise. Android GNSS/network behavior and browser privacy were not verified on a physical device. Previously passing source guard, Android manifest checks, and static web offline checks remain the available evidence; no new device/network-capture test was run for this documentation clarification.

### 2026-10-24 — First-release readiness review and privacy text consolidation

- Consolidated the location/privacy section in README into one explanation. It now describes opt-in foreground-only following, on-device latest-coordinate storage, Android's missing Internet permission and disabled backup, the web host's ordinary download metadata, the platform/provider boundary, and manual coordinates as the strictest user-controlled option. No source-of-truth history was edited or removed.
- Reviewed `PRIVACY.md`, `RELEASING.md`, the Android manifest, and the local GNSS module against this wording. Existing documents correctly identify the privacy notice as a draft and the APK as an unsigned-for-store development-signed preview; no signed release or store submission is claimed.
- Checked local Android build prerequisites: an Android project directory and Gradle wrapper exist, but Java, adb, Gradle on PATH, and Android SDK environment variables are absent. A local APK build/install is therefore unavailable in this workspace. The CI workflow is configured to install Java and Android SDK packages and assemble/check a preview APK after a repository is connected; hosted execution remains unverified.
- Current externally dependent first-release gates remain open: public GitHub repository destination/connection, successful hosted CI, preview APK installation on a physical Android device, durable HTTPS web hosting/browser offline walkthrough, production Play signing and AAB, privacy/store disclosure reconciliation, maintainer contact, and release publication. iOS/App Store remains a later release.

### 2026-10-24 — Prepared local web preview artifact

- Exported the web PWA from the current app as a version 0.1.0 build. Metro bundled the application and the generator produced a service worker with eight precached files. The web service-worker syntax check and Node offline simulation passed for all eight cached files.
- Packaged the static export into `release-assets/Nightfall-Stargazing-Web-v0.1.0.zip` (428,015 bytes) and recorded SHA-256 `3dd39bc8436b7fc6f09ff5063b7a079a5f514ad3a1bf4782c842c6fc38c605c7` in `release-assets/SHA256SUMS.txt`. Added `/release-assets/` to `.gitignore` so local generated release artifacts are not committed as source files.
- Updated `RELEASING.md` to distinguish this local archive from a GitHub download. The repository is still not connected to GitHub, and the Android preview APK and public release do not exist. A real browser install/offline walkthrough and device QA are also outstanding.

### 2026-10-24 — GitHub publication access check

- Rechecked the authenticated GitHub repository listing; it returned no accessible repositories. The available GitHub connector exposes repository listing and file/PR operations but no repository-creation action. The in-app browser opened GitHub to its signed-out landing page, so no owner account or authenticated publishing session is available in this workspace.
- No credentials were requested or entered, and no public repository was created. Publishing the prepared web archive, building the Android APK in hosted CI, and creating the GitHub release still require an accessible destination repository and authenticated owner context. The source workspace and locally prepared ZIP remain available without that connection.

### 2026-10-24 — Same-origin policy for the web client

- Added a Content Security Policy to generated web exports. The app page permits scripts, images, fonts, workers, forms, and page-initiated network connections only from the app's own origin (with local inline styles retained for React Native Web); object embedding is disabled. Moved service-worker registration into a generated same-origin script so the page does not require inline script execution.
- Extended the offline web simulation to assert the exported HTML includes the `connect-src 'self'` policy and uses no inline script block. The worker syntax check and offline service-worker simulation passed after a fresh web export; the worker precaches nine files including the registration helper.
- Rebuilt the local web preview ZIP and SHA-256 after the policy change. This browser policy is defense in depth for page-originated requests; it cannot constrain network activity by the browser/OS location provider or hosting-site metadata. No real browser security or geolocation runtime audit was available.

### 2026-10-24 — Web archive checksum update after security policy build

- The same-origin-policy build supersedes the earlier local web ZIP under the same filename. Current archive size is 428,311 bytes and its current SHA-256 is `e931f9579be9ff4f03482668841432505e01f503f849ee963f0bec08527de731`, recorded in `release-assets/SHA256SUMS.txt`. The earlier checksum entry remains in this append-only history as the checksum of the previous artifact revision.
- Confirmed the ZIP contains the root-level PWA export, including `index.html`, `sw.js`, the registration helper, manifest, icons, and application bundle.

### 2026-10-24 — Superseding first-release baseline

This entry supersedes earlier planning statements above wherever they conflict with decisions made later in this project. The earlier words remain intact as the initial planning snapshot.

- **Current product name:** Nightfall Stargazing. **First-release platforms:** Android and web. iPhone/iOS and App Store submission are deferred to a later release after Android/web are verified. The app is implemented with Expo, React Native, and TypeScript; Android includes an app-owned Kotlin GNSS module.
- **Current first-release experience:** a live-updating 2D north-up local-sky chart, local foreground location following or manual coordinates, object search/details, Tonight planner, saved objects, red-light mode, guide, and licenses/credits. It covers Sun, Moon, major planets, a 5,421-entry bundled star/deep-sky/solar-system set, and 86 named IAU stick-figure constellations. This is a chart rather than camera/AR sky recognition; device-compass pointing, pan/zoom, telescope control, satellite tracking, constellation boundaries, and broad catalog coverage are not represented as shipped features.
- **Offline behavior:** all current sky calculations and bundled catalogs are local. The web PWA is downloaded once from its HTTPS host, then its worker precaches the application assets for later offline use; browser-level install and offline behavior remain unverified. The Android manifest removes Internet permission, so the preview's core app is offline after installation; this is a stricter privacy choice than the original allowance for optional first-release internet features. No live remote catalog or update service is included.
- **Location and network boundary:** automatic location is optional and foreground-only; the app stores the latest observing coordinates locally and has no account sync, location upload, telemetry, or app-operated location service. Android has no Internet permission and disables backup. The generated web page has a same-origin CSP for its scripts, resources, forms, and page-initiated connections. These app controls cannot govern OS/browser/location-provider behavior or hosting metadata; manual coordinates with permission denied offer the strictest user-controlled option.
- **Current release evidence:** a local 0.1.0 web archive exists at `release-assets/Nightfall-Stargazing-Web-v0.1.0.zip`, with current SHA-256 `e931f9579be9ff4f03482668841432505e01f503f849ee963f0bec08527de731`. The fresh export passed the Node service-worker offline simulation for nine precached files. There is no GitHub remote, public repository, hosted CI result, Android APK/AAB, production signing setup, durable PWA host, store listing, or physical-device/browser QA result. Accuracy fixtures validate five solar-system bodies at fixed reference cases only; they do not establish catalog-star accuracy or universal positional accuracy.

### 2026-10-24 — Privacy notice aligned with web network policy

- Updated the draft `PRIVACY.md` network section to explain that static PWA Content Security Policy limits page-originated requests and loaded app resources to the same origin, and that normal first-download/hosting requests can expose metadata such as the visitor's IP address without the app attaching coordinates. It also clarifies that CSP cannot restrict OS/browser/location-provider traffic.
- This keeps the notice aligned with the generated web export and preserves the existing draft status; a release-grade privacy review is still required against hosted headers, platform behavior, and final signed binaries.

### 2026-10-24 — Foreground-only live clock refresh

- Changed the live sky-clock interval to exist only while the app is active. On return to the foreground, the displayed current time refreshes immediately before the 30-second foreground tick resumes. This avoids an unnecessary background timer and prevents a stale live chart immediately after reopening; the existing location watcher already stops while backgrounded.
- Split AppState subscription, foreground timer, and one-time local preference hydration into separate effects so app lifecycle changes do not repeat storage hydration. `pnpm typecheck` passed after the change. Device battery and resume behavior remain unverified on hardware.

### 2026-10-24 — Live object details and refreshed web build

- Corrected selected-object details so altitude, azimuth, apparent magnitude, illuminated fraction, and rise/set estimate derive from the current sky calculation. The detail card now follows live clock updates, location changes, and simulated observing time rather than retaining the values from the selection moment.
- pnpm typecheck passed after the source change. Rebuilt the web PWA; the generated service-worker syntax check passed, and the offline simulation passed for nine precached files (cache 
ightfall-51d53bc0eb44cf78).
- Refreshed the local web archive to match this current source: elease-assets/Nightfall-Stargazing-Web-v0.1.0.zip (428370 bytes), SHA-256 $hash, recorded in elease-assets/SHA256SUMS.txt. This supersedes the prior archive checksum entries above; the old entries remain as historical records.

### 2026-10-24 — Corrections and GitHub destination update

- The immediately preceding “Live object details and refreshed web build” entry was appended with PowerShell backtick escaping that damaged some inline-code words and left the checksum placeholder literal. Its underlying verification facts were correct, but its formatted paths/hash are superseded by this correction; no earlier source-of-truth words were edited or removed. Current PWA archive: release-assets/Nightfall-Stargazing-Web-v0.1.0.zip, 428370 bytes, SHA-256 f4459ca9ef8e6a0a50a574146bd456f1a95a0eab7666b3b5c153734cf1987744, also stored in release-assets/SHA256SUMS.txt. The matching worker cache is nightfall-51d53bc0eb44cf78; typecheck, worker syntax, and offline simulation for nine precached files passed.
- The user supplied https://github.com/Lightyear4509/Space-App and requested that the repository be renamed to Nightfall-Stargazing. The GitHub API confirms the repository is public, empty, and owned by the supplied account; the API response reports admin permissions. GitHub connector tools available here expose repository reads and content operations but no repository rename operation; the browser is signed out. A read-only Git remote check also failed because this workspace could not resolve github.com. No rename, file upload, commit, or push has occurred. The requested repository rename and source publication remain pending a usable authenticated write path.

### 2026-10-24 — Local source commit prepared for requested GitHub publication

- After the preceding entry, created local root commit `967aa24` (`Initial Nightfall Stargazing preview source`) containing the reviewed project files. Its author uses the account's GitHub no-reply address. `git status --short` is clean; no Git remote is configured. Generated builds, dependency directories, Android build output, local release archives, and caches were excluded from the commit.
- Correction to the preceding entry's timing: a local commit now exists, but the GitHub repository has not been renamed and no source has been pushed. The public repository remains `Lightyear4509/Space-App`; its settings page is unavailable in the signed-out browser, and the connected GitHub capability here does not expose repository rename. Publication is ready once an authenticated write path and renamed destination are available.

### 2026-10-24 — Initial source published to GitHub

- Published local branch `main` to the user-supplied public repository `https://github.com/Lightyear4509/Space-App`. GitHub reports remote head `60d0baa25998373040b5035542b5e8dbdf586dca`, matching the local `Record GitHub publication checkpoint` commit. The repository is now populated with the source project and its append-only history.
- The app-name rename to `Nightfall-Stargazing` remains pending. The connected GitHub tools can verify and publish repository content but do not provide repository settings updates; the browser session is signed out. No app-store release or hosted web deployment has been performed.

### 2026-10-24 — GitHub CI started and release guidance corrected

- The public GitHub Actions **Build checks** workflow started on the published `main` branch (run 2, commit `1b97736`). At observation time the web job had exported the PWA, passed its generated-worker/offline simulation, and uploaded its web artifact; the Android job was still installing SDK packages. No final workflow conclusion or downloadable APK had yet been verified.
- Corrected stale current-state wording in `README.md` and `RELEASING.md`: the source repository and remote now exist, CI is running, and artifact availability depends on successful job completion. Both documents identify the pending repository rename and retain the preview-versus-production signing distinction.
- Verified the browser GitHub session is signed out and GitHub CLI is unavailable locally. The available GitHub connector has no repository-rename operation, so the requested `Space-App` to `Nightfall-Stargazing` rename still requires an authenticated repository-settings session or an equivalent owner-authorized GitHub API path.

### 2026-10-24 — Hosted Android build failure diagnosed and patched

- GitHub Actions run 2 completed with the web job successful and Android build failed. The decoded Gradle log identified a missing `android.defaultConfig.versionName` in the local Expo GNSS library module, which prevented Expo's Android module publication configuration. The workflow did not produce an APK, and its tagged pre-release job was skipped.
- Updated `modules/local-gnss/android/build.gradle` to set the module's Android `versionName` from its Gradle project version. Extended `scripts/check-android-module.mjs` to catch a missing publication version before running the native build. The local Android module check and TypeScript typecheck both pass after the fix. A fresh hosted Android build is still required to verify Gradle configuration and APK output.

### 2026-10-24 — Nightfall Stargazing v0.1.0 preview released

- Published public GitHub pre-release `v0.1.0` from source commit `6ba9f39cf6d21de8631c51c79656a612a0e5a9e7`. The remote annotated tag uses the account's GitHub no-reply identity. Release run #5 completed successfully: the web export/offline simulation and Android APK build/manifest checks passed, then the tag-gated publisher uploaded the permanent release assets.
- Release page: https://github.com/Lightyear4509/Space-App/releases/tag/v0.1.0. Assets: `Nightfall-Stargazing-Android-v0.1.0.apk` (76,273,961 bytes; SHA-256 `778166edd25801b46165cce57ccf97cacb8967b5ec4fd71c6b05e87a99bd0987`), `Nightfall-Stargazing-Web-v0.1.0.zip` (426,444 bytes; SHA-256 `d6e03d84b6ca6a314b919909f66567e91ab1b82a9d9168c96a28e1bc944e44ac`), `RELEASE-NOTES.txt`, and `SHA256SUMS.txt`. The Android artifact is a development-signed sideload preview, not a Play Store build; the web ZIP is a static PWA export, not a hosted website.
- A second tag-triggered run (#6) rebuilt both platforms successfully but its publish job failed because release `v0.1.0` already existed. The first release run (#5) succeeded and remains the authoritative release publication. Updated `README.md` and `RELEASING.md` to point to the published assets and distinguish the preview from outstanding general-release gates.
- Still pending: rename the public repository slug from `Space-App` to `Nightfall-Stargazing`; sign-in is required in the open GitHub browser tab. Physical-device and browser walkthroughs, broader astronomical validation, durable PWA hosting, production Android signing/Play Store release, and later iOS/App Store work remain future gates. The release verifies build and manifest properties, not field accuracy or device behavior.

### 2026-10-24 — Public repository renamed to the app name

- Renamed the public repository from `Lightyear4509/Space-App` to `Lightyear4509/Nightfall-Stargazing` using the existing Git credential manager after the user authorized the rename. GitHub confirms the new repository name and canonical URL; the repository identity and default `main` branch remain the same.
- Verified the v0.1.0 prerelease and its Android APK, web PWA ZIP, release notes, and checksum asset are still present under the new repository URL. The local `origin` remote and current README/release links are being updated to the canonical slug. Prior entries mentioning the old slug remain unchanged as historical records.

### 2026-10-24 — GitHub Pages web deployment prepared

- To make the first-release web app directly accessible, configured GitHub Pages for workflow-based deployment at `https://lightyear4509.github.io/Nightfall-Stargazing/`. The site uses the repository subpath, so the web build now accepts `NIGHTFALL_WEB_BASE_URL`, exports matching resource paths, sets the PWA start URL/scope/icons, registers a subpath-scoped worker, and precaches the web files under that path. A new Pages workflow builds and deploys the static export from `main`; the first hosted deployment is pending its GitHub Actions result.
- Verified local Expo web exports and offline service-worker simulation both at the origin root (the downloadable ZIP hosting layout) and at `/Nightfall-Stargazing` (the GitHub Pages project-site layout). TypeScript, app-owned privacy scan, sky-catalog/JPL comparison checks, client-state guards, Android module checks, and worker syntax checks passed. The CUA browser could not reach the local preview server in this environment; a browser walkthrough of the hosted HTTPS site remains necessary after deployment.
- Updated the draft privacy notice to name GitHub Pages and clarify that ordinary hosting requests can expose network metadata such as an IP address, while the app does not include observing coordinates in those requests. The Android build remains without Internet permission; browser/OS location-provider behavior remains outside the app's control.

### 2026-10-24 — GitHub Pages site verified and release guidance refreshed

- Confirmed the public repository is `Lightyear4509/Nightfall-Stargazing` and its GitHub Pages site is reachable at `https://lightyear4509.github.io/Nightfall-Stargazing/`. A browser accessibility snapshot showed the live clock, local observing coordinates, foreground-only location controls, sky chart, tonight planner, catalog count, filters, sky guide, and location privacy explanation. This verifies page rendering, but not browser installability, offline reopening, location denial/revocation on hardware, or field accuracy.
- Updated `README.md`, `RELEASING.md`, and the draft `PRIVACY.md` to reflect the public app-name repository and hosted website, distinguish the downloadable root-hosted ZIP from the Pages project-site build, and keep browser offline checks listed as outstanding. GitHub Pages build/deploy run #1 (run 40137020796) completed successfully. Build checks run #7 (run 40137020719) had its web job complete successfully; the Android job was still running when checked, so its final result remains unverified in this record.
- The prior source-of-truth entry said the first hosted deployment and hosted HTTPS walkthrough were pending. This append records their later completion for website availability and page rendering; it does not erase that earlier historical state or claim a full browser offline/device walkthrough.
