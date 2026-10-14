# Changelog

## [0.2.0](https://github.com/jorblad/babybuddy-pwa/compare/v0.1.0...v0.2.0) (2026-10-14)


### Features

* add retroactive (after-the-fact) event logging for sleep, diaper, and feeding ([e0e2d1b](https://github.com/jorblad/babybuddy-pwa/commit/e0e2d1b21cc19764a47738c0f8df8701da125460))
* add retroactive (after-the-fact) logging for sleep, diaper, and feeding ([c973ac1](https://github.com/jorblad/babybuddy-pwa/commit/c973ac101c6e4b3dc3eda1d783fec7fe795c5d55))
* automate releases with release-please and add Renovate + guidelines ([db9151c](https://github.com/jorblad/babybuddy-pwa/commit/db9151c0e364e45302dfa05698263ee54a832294))
* automate releases with release-please and add Renovate + project guidelines ([96275b2](https://github.com/jorblad/babybuddy-pwa/commit/96275b27d8e68114ce4f0172df836f5779d4dc9a))
* show why connection is offline ([e38cb5f](https://github.com/jorblad/babybuddy-pwa/commit/e38cb5f828f913d1afeee244f6ee16f681da7213))


### Bug Fixes

* add timeout and safe fallback to app-shell fetch handler ([d010c0d](https://github.com/jorblad/babybuddy-pwa/commit/d010c0d5102455a6a9f1f7769348090e110808b7))
* fail fast on unreachable status checks ([fd4fe5e](https://github.com/jorblad/babybuddy-pwa/commit/fd4fe5e6c8b3a9e105501a486bd2c01c8793a64a))
* guard past sleep toggle when form is missing ([e0f9c9a](https://github.com/jorblad/babybuddy-pwa/commit/e0f9c9ad6d41e2228fe04bc92e0e0192abeb0f22))
* honor no-store probe and persist sw cache writes ([56cf009](https://github.com/jorblad/babybuddy-pwa/commit/56cf009ce3b12a21ce7038614e12270584f04de2))
* make Renovate dependency updates releasable by release-please ([3e66515](https://github.com/jorblad/babybuddy-pwa/commit/3e66515d5e4999352c8ac7db695fbc8952c710cc))
* make Renovate dependency updates releasable by release-please ([28a09c7](https://github.com/jorblad/babybuddy-pwa/commit/28a09c7a6a7a2795931b0e936bc33c9f6d887ca9))
* remove aggressive timeout from shell fetch handler and simplify cache write ([a6333c6](https://github.com/jorblad/babybuddy-pwa/commit/a6333c64ae9b3e04b0301014ce1a18ea0e8c81ad))
* suppress unhandled rejection from fire-and-forget cache.put ([a843e33](https://github.com/jorblad/babybuddy-pwa/commit/a843e33e642257b43600f37fdaec87095c14c2d0))
* throw on API GET cache miss instead of returning synthetic 503 ([154e493](https://github.com/jorblad/babybuddy-pwa/commit/154e493aa9b20c30b67d5166002010d889015422))
