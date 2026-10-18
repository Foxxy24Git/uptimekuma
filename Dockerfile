# syntax=docker/dockerfile:1.7

FROM node:26-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    UPTIME_KUMA_IS_CONTAINER=1 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends dumb-init ca-certificates curl iputils-ping \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY . .

RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 3001
VOLUME ["/app/data"]
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD curl -fsS http://127.0.0.1:3001/ || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "--import=tsx", "server/server.js"]
