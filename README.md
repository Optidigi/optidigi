# Optidigi

Static Astro site for Optidigi, adapted from the local Positivus Astro theme.

## Commands

```bash
npm install
npm run check
npm run build
npm run preview
```

The production output is written to `dist/`.

## Docker

The image is built with Node 22 and served by unprivileged Nginx on port `8080`.

```bash
docker build -t optidigi .
docker run --rm -p 8080:8080 optidigi
```

## Image Publishing

GitHub Actions builds on pull requests and pushes an image to GHCR on pushes to `main` and version tags. Tags include:

- `latest` for the default branch
- the branch name
- `sha-<commit>`
- semantic version tags such as `v1.0.0`

For VPS deployment with Docker and Traefik, set values in an `.env` file next to `compose.yml`, for example:

```bash
OPTIDIGI_IMAGE=ghcr.io/owner/optidigi:latest
DOMAIN=optidigi.nl
TRAEFIK_NETWORK=proxy
TRAEFIK_ENTRYPOINT=websecure
TRAEFIK_CERT_RESOLVER=letsencrypt
```

Then run:

```bash
docker compose pull
docker compose up -d
```
