# babybuddy-pwa

A pwa with offline mode for babybuddy

## CORS

For the PWA to work with the cors on babybuddy we need to add this origin to the baby buddys env.

```ssh
environment:
  - CORS_ALLOWED_ORIGINS=https://jorblad.github.io
```

### Limitations

Babybuddy history is only updated when the pwa is open and can reach babybuddy.
