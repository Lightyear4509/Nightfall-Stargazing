# Contributing

Thanks for helping improve Nightfall Stargazing. The project is in early development; read [SOURCE_OF_TRUTH.md](SOURCE_OF_TRUTH.md) before changing product behavior.

## Project setup

Use Node.js 22.13 or newer and pnpm 11. From the repository root:

```sh
pnpm install
pnpm android
```

`pnpm android` builds and opens the native app on a connected Android device or emulator; a local Android SDK and Java are required. Expo Go does not include the project's custom GNSS module, so it cannot verify Android location following. For browser development, run `pnpm web`. To preview the offline-capable static export, run `pnpm export:web` and then `pnpm preview:web`. Keep coordinates, saved observations, and other user state on device.

## Project record

`SOURCE_OF_TRUTH.md` is append-only. Never remove or rewrite its existing words. Add a dated note for decisions, implementation milestones, corrections, and verified release status. A new decision supersedes an old one by recording the change and reason; preserve the historical record.

## Data and astronomy changes

Do not add astronomical catalogs or descriptions without recording their source, license, required attribution, units, coordinate epoch, and any known accuracy limits. Avoid network dependencies in core sky calculations. Accuracy claims need recorded comparisons against an authoritative reference for representative dates and observing locations.

## Pull requests

Keep changes focused, describe user-visible behavior and privacy implications, and include reproduction steps. Do not add analytics, ad, or telemetry packages.
