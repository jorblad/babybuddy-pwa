# babybuddy-pwa

A pwa with offline mode for babybuddy

## CORS

For the PWA to work with the cors on babybuddy we need to add this origin to the baby buddys env.

```ssh
environment:
  - CORS_ALLOWED_ORIGINS=https://jorblad.github.io
```

### Limitations

Babybuddy history is trying to keep up to date but that is severly limited. On Android it only works when installed from Chrome and Android can decide to ratelimit or stop updating anytime. On iOS it does not poll in the background at all.
When the app is in the foreground however it should update properly.
