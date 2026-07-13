# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS production-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    BOOKING_DATABASE_PATH=/data/optidigi.sqlite
RUN mkdir -p /data/backups && chown -R node:node /data
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=production-dependencies /app/node_modules ./node_modules
COPY --chown=node:node package.json ./package.json
COPY --chown=node:node scripts ./scripts
USER node

EXPOSE 8080
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1

CMD ["node", "./dist/server/entry.mjs"]
