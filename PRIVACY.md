# Privacy Notice — Nightfall Stargazing

**Draft for preview v0.1.0.** This notice is not a complete audit of signed binaries or platform providers. Reconcile it with final production builds and store disclosures before general release. Replace the contact placeholder.

## Data handling

Nightfall Stargazing has no account, app-operated server, ads, or analytics SDK. Sky calculations run on the device using bundled data. The app does not send coordinates, saved objects, or observing notes to an app service.

Coordinates, saved observing objects, and the night-mode preference are stored locally on the device. The user can enter coordinates manually or optionally enable **Use my location**. Location access requires foreground permission. Android uses the device's satellite GNSS provider, requests updates only while the app is active, and stops updates when the app backgrounds or the user turns following off. The app does not request background location or retain a location trail; it stores the current observing coordinates for the sky chart. On web, the browser's geolocation permission is used on secure (HTTPS) origins. Manual entry remains available on every platform.

The Android app is configured without the `INTERNET` permission, background-location permission, or Android Auto Backup (`allowBackup` is false), so Android cloud backup will not copy the locally stored coordinates. The final merged manifest and a signed package still need verification. Web requires an initial download from its host; its service worker is intended to cache the app for later offline use.

## Platform and provider boundary

Nightfall Stargazing does not transmit location to an app-operated or third-party location service. It cannot control the operating system, browser, device manufacturer, carrier, or satellite-location provider. Android or web platform components may have their own privacy practices or use assisted-location information outside the app. Grant location only if you are comfortable with your device's location settings; you can deny/revoke permission and use manual coordinates instead. Network access being blocked for the app does not prevent the operating system from independently using its own services.

## Network and offline use

Core catalog and astronomy calculations are bundled and do not need network access. Android's app manifest removes Internet permission. The static web export includes a Content Security Policy that restricts page-originated connections and loaded scripts/assets to the same origin. The web edition is configured for GitHub Pages at https://lightyear4509.github.io/Nightfall-Stargazing/; GitHub may receive ordinary request metadata such as an IP address to serve the site and its assets, but the app does not include coordinates in those requests or send observing location to GitHub. Web needs a network connection for the first download and for hosting/distribution. The web policy does not constrain browser, operating-system, or location-provider traffic. Offline behavior still requires browser-level verification. App stores, hosting providers, and operating-system services operate under their own privacy terms.

## Permissions and controls

Location is optional. Before requesting permission, Nightfall Stargazing explains its use and the separate role of operating-system and browser providers. Android requests foreground location only after the user chooses to continue from that explanation. No background location or location foreground service is enabled. The control can be switched off in the app, and permission can be revoked in system settings. Manual latitude/longitude entry avoids the location permission entirely. Users can clear the saved observing coordinates from the manual coordinates panel; this stops following and removes the saved coordinate from app storage, returning the chart to its example location.

## Changes and contact

Product and privacy changes are recorded in the append-only [source of truth](SOURCE_OF_TRUTH.md). Contact: **[maintainer contact to be added before release]**.
