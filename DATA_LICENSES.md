# Astronomy data and licenses

## HYG star catalog

The bundled `src/data/hyg-stars-v41.json` is a derived subset of **HYG Database v4.1** by David Nash / Astronexus: [upstream archive](https://github.com/astronexus/HYG-Database), [catalog documentation and license](https://github.com/astronexus/HYG-Database/blob/main/hyg/README.md), [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).

Attribution: **HYG Database v4.1 by David Nash / Astronexus, used under CC BY-SA 4.0.** This catalog subset is also made available under CC BY-SA 4.0. The application source code remains under the separate MIT license in `LICENSE`.

The generated subset contains 5,050 stars selected at visual magnitude 6.0 or brighter. The 20 hand-curated stars in `src/catalog.ts` have separate descriptive text and are omitted from the generated subset by proper name. The build script retains catalog ID, proper/designation name, J2000 right ascension and declination (converted from RA hours to degrees), visual magnitude, proper motion (milliarcseconds/year), constellation abbreviation, color index, and usable distance (converted from parsecs to light years). Numeric output is rounded for compactness. No upstream file is fetched at app runtime.

**Proper-motion convention used by the sky calculation:** HYG documents `pmra` and `pmdec` in mas/year but does not explicitly state in its field list whether the RA component includes the cos(dec) factor. The calculation currently interprets it as tangent-plane μα* = μα cos(dec), consistent with the official Hipparcos definition for that component, and divides by cos(dec) when updating RA. HYG combines multiple source catalogs, so this convention remains an explicit assumption that needs a catalog-wide spot-check before making precision claims. The propagation is linear and does not model radial-velocity perspective effects.

To regenerate the file from an HYG v4.1 CSV downloaded from the upstream archive:

```sh
node scripts/build-hyg-catalog.mjs path/to/hygdata_v41.csv
```

The script writes `src/data/hyg-stars-v41.json`. Keep this attribution and license notice with redistributed copies or adapted versions of the catalog. The HYG README also notes that some proper names are unofficial secondary-star labels and that source catalog content is compiled from multiple named catalogs.

## IAU constellation stick figures

The original line sequences are stored at `data-sources/constellation_lines_iau.dat` and sourced from [dcf21/constellation-stick-figures](https://github.com/dcf21/constellation-stick-figures/blob/75d29c207bbd752023c447ddd1f9f4ff0eb47538/constellation_lines_iau.dat), pinned to commit `75d29c207bbd752023c447ddd1f9f4ff0eb47538` (source file blob `ecd471ed36babfa3ebd43c2c55540b79021c2dc1`). The repository README identifies the modern IAU figures as created by Alan MacRobert et al. with the IAU/Sky & Telescope and states that this IAU file is distributed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Dominic Ford provides the machine-readable transcription and source-file format.

Attribution: **IAU constellation stick figures by Alan MacRobert et al. (IAU/Sky & Telescope), machine-readable transcription by Dominic Ford, used under CC BY 4.0.** The app transforms HIP-numbered polylines into app star IDs by matching Hipparcos identifiers from HYG v4.1; proper-name duplicates map to the curated star IDs. `scripts/build-constellation-lines.mjs` regenerates `src/data/iau-constellation-lines-v1.json` from the source `.dat` and an HYG v4.1 CSV. The app performs no network fetch for constellation data.

The generated file contains 164 polylines across 86 named constellations; the source has no stick figures for Mensa or Microscopium and splits Serpens into head/tail sections. HIP 10826 and HIP 55203 are absent from the bundled magnitude-6 HYG subset, so the generator breaks the relevant paths at those two missing endpoints instead of drawing through unrepresented stars. The full HYG star dataset remains separately attributed and licensed under CC BY-SA 4.0 above. IAU constellation boundaries are not included.

## Other data

The bundled `src/data/openngc-bright-v1.json` is a derived subset of **OpenNGC** by Mattia Verga and contributors: [upstream repository](https://github.com/mattiaverga/OpenNGC), [README and data-source notes](https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/README.md), [CC BY-SA 4.0 license](https://creativecommons.org/licenses/by-sa/4.0/). Snapshot commit: `be3cd6c5498806a2fbb2f7e0452ef802dbb02be0`.

Attribution: **OpenNGC by Mattia Verga and contributors, used under CC BY-SA 4.0.** This derived subset is also made available under CC BY-SA 4.0. It contains 338 NGC/IC/addendum objects with a known V magnitude of 9.0 or brighter and supported galaxy, nebula, and cluster types. The transform parses semicolon-delimited source files, converts RA/Dec sexagesimal coordinates to decimal degrees, retains common names, catalog IDs, Messier aliases, constellation abbreviations, type, and V magnitude, and omits six hand-curated duplicates. No upstream file is fetched by the app.

To regenerate it from `NGC.csv` and `addendum.csv` at the pinned upstream commit:

```sh
node scripts/build-openngc-catalog.mjs path/to/NGC.csv path/to/addendum.csv
```

The six hand-curated descriptions remain in `src/catalog.ts` and have not been independently audited. The app bundles IAU stick-figure lines as documented above but does not include constellation boundary data.

## Astronomy calculations

Solar-system and coordinate calculations use Astronomy Engine 2.1.19, licensed under MIT: [source and documentation](https://github.com/cosinekitty/astronomy). The dependency is installed from npm; its license accompanies the package distribution.

## Direct runtime software dependencies

The first-release application bundle also uses the following direct runtime packages from `package.json`. Their resolved versions and SPDX-style license metadata were checked from the lockfile-installed package manifests in this workspace. All currently declare the MIT license; the original project license files are present in their respective package distributions when supplied upstream. The app itself remains under the separate project MIT license in `LICENSE`.

| Package | Locked version | License | Upstream |
| --- | --- | --- | --- |
| `@react-native-async-storage/async-storage` | 2.2.0 | MIT | [react-native-async-storage](https://github.com/react-native-async-storage/async-storage) |
| `expo` | 57.0.31 | MIT | [Expo](https://github.com/expo/expo) |
| `expo-location` | 57.0.22 | MIT | [Expo](https://github.com/expo/expo/tree/main/packages/expo-location) |
| `expo-modules-core` | 57.0.24 | MIT | [Expo](https://github.com/expo/expo/tree/main/packages/expo-modules-core) |
| `react` | 19.2.3 | MIT | [React](https://github.com/facebook/react) |
| `react-dom` | 19.2.3 | MIT | [React](https://github.com/facebook/react) |
| `react-native` | 0.86.3 | MIT | [React Native](https://github.com/facebook/react-native) |
| `react-native-svg` | 15.15.4 | MIT | [react-native-svg](https://github.com/software-mansion/react-native-svg) |
| `react-native-web` | 0.21.0 | MIT | [React Native Web](https://github.com/necolas/react-native-web) |

This list describes direct application dependencies, not every transitive build-time package. Catalog data retain their separate CC BY-SA 4.0 / CC BY 4.0 notices above; package code licenses do not change those data terms.
