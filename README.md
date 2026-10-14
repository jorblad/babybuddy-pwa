# babybuddy-pwa

A pwa with offline mode for babybuddy

## CORS

For the PWA to work with the cors on babybuddy we need to add this origin to the baby buddys env.

```ssh
environment:
  - CORS_ALLOWED_ORIGINS=https://jorblad.github.io
```

## Releases

Releases are fully automated with [release-please](https://github.com/googleapis/release-please-action) (see `.github/workflows/release-please.yml`).

- Every push to `main` triggers release-please. It opens (and keeps up to date) a single **Release PR** that updates `CHANGELOG.md` and the version in `.release-please-manifest.json`.
- Merging the Release PR creates a Git tag and a GitHub Release automatically. Do **not** create tags, releases, or edit `CHANGELOG.md` by hand.

### Commit messages

release-please derives the version from [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Result |
| --- | --- |
| `feat:` | Minor release |
| `fix:` | Patch release |
| `feat!:` / `BREAKING CHANGE:` | Major release |
| `chore:`, `docs:`, `style:`, `refactor:`, `test:` | No release |

### Dependency updates

[Renovate](https://docs.renovatebot.com/) keeps dependencies up to date (config in `renovate.json`). It is configured to use semantic commit messages (`fix(deps):`, `feat(deps):`) so dependency bumps are picked up by release-please and included in the changelog and release.

### Limitations

Babybuddy history is trying to keep up to date but that is severly limited. On Android it only works when installed from Chrome and Android can decide to ratelimit or stop updating anytime. On iOS it does not poll in the background at all.
When the app is in the foreground however it should update properly.
