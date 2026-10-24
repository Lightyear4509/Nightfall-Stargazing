# Release and downloads

## Current status

The source is published in the public repository [Lightyear4509/Nightfall-Stargazing](https://github.com/Lightyear4509/Nightfall-Stargazing), and the **Nightfall Stargazing v0.1.0 preview** is available on the [GitHub Releases page](https://github.com/Lightyear4509/Nightfall-Stargazing/releases/tag/v0.1.0). It includes the sideloadable Android APK, web PWA ZIP, release notes, and checksums. Release run [#5](https://github.com/Lightyear4509/Nightfall-Stargazing/actions/runs/40135387367) built and published the assets successfully. See [SOURCE_OF_TRUTH.md](SOURCE_OF_TRUTH.md) for the append-only project record.

## Android preview download

1. Download `Nightfall-Stargazing-Android-v0.1.0.apk` from the [v0.1.0 release](https://github.com/Lightyear4509/Nightfall-Stargazing/releases/tag/v0.1.0).
2. Install it on an Android device. Android may ask the user to allow installs from the browser or file manager used to open it.

The preview APK contains the JavaScript app bundle and passed checks for foreground fine-location permission, absence of Internet/network-state/background-location permissions, and disabled Android backup. It uses the generated development signing configuration. It is for testing and sideloading, not a production Play Store release. A separately downloadable Actions artifact expires after 30 days; the APK on the GitHub Release page is permanent.

## Permanent GitHub preview release

Version `v0.1.0` is the current GitHub **pre-release**. For a future version, the `publish-preview` job runs only for `v*` tags, waits for both web and Android jobs to pass, verifies that the tag matches `app.json`, and publishes the Android APK, a root-ready web PWA ZIP, release notes, and `SHA256SUMS.txt`. The APK remains development-signed and is not for Play Store distribution. A tag push is a public release action; review the source, privacy notice, and attribution before tagging.

The workflow's repository `contents: write` permission is scoped only to the tag-gated publishing job. Build jobs retain read-only repository permissions; the publishing job has read access to workflow artifacts.

To request a build without a code change, open **Actions → Build checks → Run workflow**. A successful run uploads separate web and Android artifacts.

## Web app download

Download `Nightfall-Stargazing-Web-v0.1.0.zip` from the [v0.1.0 release](https://github.com/Lightyear4509/Nightfall-Stargazing/releases/tag/v0.1.0) and extract it. The files are a static web export; host the contents at the web origin root over HTTPS. The app uses root-relative paths and registers a root-scope service worker. A user must open the site once while online before the browser can precache it for later offline use. Browser geolocation is available only where the browser grants permission on a secure origin.

The web export uses a same-origin Content Security Policy for page-initiated connections and resources. The automated offline check exercises the generated worker with a Node-based simulation. A real browser installation/offline walkthrough is still required before calling the web release verified.

## Requirements for a public v1 release

- Rename the public repository to `Nightfall-Stargazing` and confirm the hosted CI remains green.
- Run the preview APK on a physical Android device; verify location consent, permission denial, foreground-only updates, stopping, clearing saved location, offline launch, chart rendering, and accessibility.
- Review astronomical positions against an independent authoritative ephemeris/catalog for representative dates and locations.
- Create a production Android signing setup and Play Store AAB; do not use the development signing configuration for Play distribution.
- Configure durable HTTPS hosting for the PWA. The current GitHub Release contains the downloadable PWA ZIP, but is not a hosted website.
- Reconcile the privacy notice and store disclosures with the final signed binaries and provide maintainer contact details.

iPhone support and App Store submission are planned for a later release, after the Android and web first release has been verified.
