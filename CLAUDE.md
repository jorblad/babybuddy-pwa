# babybuddy-pwa

A static Progressive Web App (PWA) that gives offline-capable access to [Baby Buddy](https://github.com/babybuddy/babybuddy).

## Project shape

- **No build step, no `package.json`, no runtime dependencies.** The app is plain HTML/JS with a service worker.
- The repo is served statically as-is. The deployable files are `index.html`, `sw.js`, `manifest.json`, and the `icon-*.png` files.
- There is no test or lint tooling. Verify changes by serving the folder statically (e.g. `python3 -m http.server`) and testing in a browser. Note that PWAs require HTTPS — GitHub Pages provides this.
- `sw.js` owns caching and offline behavior. Be careful when editing cache logic; a broken service worker can leave users stuck on a stale cache.
- This is the `jorblad/babybuddy-pwa` repo. The PWA is reached at `https://jorblad.github.io`. The Baby Buddy server must allow that origin via `CORS_ALLOWED_ORIGINS=https://jorblad.github.io`.

## Release process (release-please)

Releases are automated — do not create tags, releases, or edit `CHANGELOG.md` manually.

- `.github/workflows/release-please.yml` runs the `googleapis/release-please-action` on every push to `main`.
- It uses the `RELEASE_PLEASE_TOKEN` secret (a PAT with `contents: write` and `pull-requests: write`).
- Configuration lives in `.release-please-config.json`; the current released version is tracked in `.release-please-manifest.json`.
- On each push, release-please opens/updates a single **Release PR** that bumps the version and rewrites `CHANGELOG.md`. Merging it publishes the GitHub Release and tag.

### Commit conventions (required)

Version bumps come from [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` → minor
- `fix:` → patch
- `feat!:` or a `BREAKING CHANGE:` footer → major
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` → no release, but still appear in the changelog where relevant

Always write commit messages in this format so the automation can version correctly.

### Dependencies (Renovate)

- `renovate.json` configures [Renovate](https://docs.renovatebot.com/). It is set to `semanticCommits: true` and uses `fix(deps):` / `feat(deps):` messages so dependency updates are automatically picked up by release-please and included in releases.
- Non-major dependency updates are grouped into a single PR (`all non-major dependencies`) to keep release noise low.
- GitHub Actions used in workflows are also kept up to date by Renovate.

## Background sync limitations

Baby Buddy history tries to stay up to date but is severely limited:

- **Android:** only updates reliably when installed from Chrome, and Android may rate-limit or stop background updates at any time.
- **iOS:** does not poll in the background at all.

When the app is in the foreground it should update properly.
