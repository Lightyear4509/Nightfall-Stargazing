# Nightfall feature roadmap

Nightfall uses Stellarium Mobile's published feature descriptions as a product-parity reference. This document plans similar categories of capability with independently written code, a Nightfall interface, and data assets that Nightfall can license and ship. It is not a source-code or visual-design copy of Stellarium.

## Current direction

Nightfall should make the answer to “what can I see, where is it, and when should I look?” immediate, while keeping observing coordinates local, making offline behavior understandable, and explaining the limits of every forecast. The first platform target remains Android and web; iOS follows after the shared experience and hardware features are ready.

## Feature map

| Capability | Nightfall today | Nightfall approach |
|---|---|---|
| Live local sky, search, object details, time changes | Available offline | Keep the globe discoverable, legible, and easy to return to real time. |
| Star, planet, Moon, and deep-sky catalogs | 5,421 bundled objects | Expand in licensed, documented offline packs; keep a useful base catalog small enough to ship. |
| Constellation figures and stories | IAU stick figures | Add optional figures, boundaries, and narrated/text tours only from sources with compatible licenses and cultural context. |
| Guided tours | A three-stop interactive beginner guide is in the current working source | Expand to accessible themed tours with object jumps, progress, and locally bundled content. |
| Object favorites and tonight planner | Available offline | Add a visibility chart and a reusable observing-session plan. |
| Altitude path, rise/set, transit | Rise/set estimate exists; path chart is being added | Label time zone, horizon assumptions, sample interval, and forecast confidence. |
| Device orientation / point-to-sky | Not yet available | Add an opt-in sensor mode with calibration, manual fallback, and a clear “sensor unavailable” state. Keep the direction calculation local. |
| Camera AR overlay | Not yet available | Later optional camera mode. Ask only for camera permission when opened; keep frames on-device and provide a non-camera sky map. |
| Satellites and passes | Not yet available | Bundle dated orbital elements for offline prediction, with an optional user-triggered refresh. Show the data epoch because pass accuracy declines as elements age. |
| Comets and asteroids | Not yet available | Add local ephemerides and a curated magnitude-limited first set, then expand through versioned data packs. |
| Astronomical event calendar | Not yet available | Calculate predictable events offline where practical; mark events that need refreshed satellite/minor-body elements. |
| Surface views and sky imagery | Not yet available | Add optional, attributed offline texture/imagery packs, with size shown before installation. |
| Ocular / field-of-view preview | Not yet available | Let users enter telescope, eyepiece, and sensor measurements locally; project the resulting field over the map. |
| Telescope control | Not yet available | Later, opt-in local-network or Bluetooth control, with a connection preview and explicit controls before any mount motion. |
| Offline use | Core catalog and calculations work offline; web app needs one online install visit | Preserve an offline-first baseline, and make every optional download identifiable, attributable, and user initiated. |

## Delivery sequence

1. **Field experience (current iteration):** make the shared Android/web screen easier to navigate; add a selected-object sky path; sharpen object visibility and timing information.
2. **Observing tools:** plan sessions, improve rise/transit/set estimates, add twilight and an event calendar, and export/share a plan without transmitting location.
3. **Pointing and learning:** optional device-sensor pointing, richer constellation controls, accessible tours, and a camera overlay after device-specific privacy and accuracy work.
4. **Expanded sky:** licensed offline catalog packs, dated satellite/minor-body data, and optional attributed sky/surface imagery.
5. **Optics and instruments:** field-of-view/eyepiece preview and carefully scoped local telescope control.
6. **iOS:** bring the shared application to iPhone after the Android and web interaction model is stable; verify platform permission, sensor, camera, and App Store requirements separately.

## Privacy and accuracy principles

- The sky calculation uses coordinates on-device. Never put latitude, longitude, or location-derived identifiers in telemetry, crash reports, analytics, search requests, or catalog requests.
- Location is optional and foreground-only. Sensor and camera features must also be optional and requested only when used.
- Make the offline catalog and calculations the dependable baseline. Any online catalog refresh must be explicit; the app should be usable if the user never refreshes.
- A website host necessarily receives normal connection metadata when a person visits or downloads the PWA. Nightfall must not send their observing coordinates with those requests.
- Display the source, epoch, and limitations of moving-object data. Satellite orbital elements and weather are time-sensitive; an offline prediction must disclose the age of its inputs.
- Keep source attribution, license compatibility, transformations, and validation evidence alongside every new data set.

## Public reference material

- [Stellarium Mobile and Mobile Plus features](https://www.stellarium-labs.com/stellarium-mobile-plus/)
- [Stellarium Mobile 1.8.0: favorites, visibility paths, time controls, sensor mode, and 3D-view improvements](https://stellarium-labs.com/blog/update-1-8-0/)
- [Stellarium Mobile Tours](https://stellarium-labs.com/blog/tours/)
- [Stellarium Mobile Plus telescope control](https://www.stellarium-labs.com/telescope-control-in-stellarium-mobile-plus/)
