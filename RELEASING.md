# Release and downloads

## Current status

The source is published in the public repository [Lightyear4509/Space-App](https://github.com/Lightyear4509/Space-App). The app name is **Nightfall Stargazing**; changing the repository slug to `Nightfall-Stargazing` is still pending. GitHub Actions run #2 is building the web export and Android preview APK. Until the run succeeds and artifacts are available, there is no verified downloadable APK or web artifact. A local web PWA archive also exists at `release-assets/Nightfall-Stargazing-Web-v0.1.0.zip` with a matching SHA-256 file; it has not been published and is ignored by Git. See [SOURCE_OF_TRUTH.md](SOURCE_OF_TRUTH.md) for the durable project record.

## Android preview download

After the current **Build checks** workflow succeeds:

1. Open the successful workflow run in the repository's **Actions** tab.
2. Download the `stargazing-android-preview-apk` artifact and extract its ZIP file.
3. Install `app-release.apk` on an Android device. Android may ask the user to allow installs from the browser or file manager used to open it.

The preview APK contains the JavaScript app bundle and is checked for foreground fine-location permission, absence of Internet/network-state/background-location permissions, and disabled Android backup. It uses the generated development signing configuration. It is for testing and sideloading, not a production Play Store release. Workflow artifacts expire after 30 days and are not permanent GitHub Releases.

## Permanent GitHub preview release

After the current workflow succeeds and its artifacts are reviewed, a matching version tag such as `v0.1.0` can publish the configured GitHub **pre-release**. The `publish-preview` job runs only for `v*` tags, waits for both web and Android jobs to pass, verifies that the tag matches `app.json`, and publishes the Android APK, a root-ready web PWA ZIP, release notes, and `SHA256SUMS.txt`. The APK remains development-signed and is not for Play Store distribution. A tag push is a public release action; review the source, privacy notice, and attribution before tagging.

The workflow's repository `contents: write` permission is scoped only to the tag-gated publishing job. Build jobs retain read-only repository permissions; the publishing job has read access to workflow artifacts.

To request a build without a code change, open **Actions → Build checks → Run workflow**. A successful run uploads separate web and Android artifacts.

## Web app download

Download the `stargazing-web-pwa` artifact from a successful run and extract it. The files are a static web export; host the contents at the web origin root over HTTPS. The app uses root-relative paths and registers a root-scope service worker. A user must open the site once while online before the browser can precache it for later offline use. Browser geolocation is available only where the browser grants permission on a secure origin.

The web export uses a same-origin Content Security Policy for page-initiated connections and resources. The automated offline check exercises the generated worker with a Node-based simulation. A real browser installation/offline walkthrough is still required before calling the web release verified.

## Requirements for a public v1 release

- Connect the source to a public GitHub repository and confirm hosted CI succeeds.
- Run the preview APK on a physical Android device; verify location consent, permission denial, foreground-only updates, stopping, clearing saved location, offline launch, chart rendering, and accessibility.
- Review astronomical positions against an independent authoritative ephemeris/catalog for representative dates and locations.
- Create a production Android signing setup and Play Store AAB; do not use the development signing configuration for Play distribution.
- Publish permanent, versioned GitHub Release assets and choose/configure durable HTTPS hosting for the PWA. A GitHub Actions artifact is temporary.
- Reconcile the privacy notice and store disclosures with the final signed binaries and provide maintainer contact details.

iPhone support and App Store submission are planned for a later release, after the Android and web first release has been verified.
