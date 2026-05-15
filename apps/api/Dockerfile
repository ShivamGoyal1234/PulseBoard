
FROM node:20-bookworm-slim AS base
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm ci

FROM base AS development
COPY apps/api ./apps/api
COPY apps/web/package.json ./apps/web/package.json
ENV NODE_ENV=development
EXPOSE 3001
WORKDIR /app
CMD ["npm", "run", "dev", "-w", "@pulseBoard/api"]

FROM base AS builder
COPY apps/api ./apps/api
RUN npm run build -w @pulseBoard/api

FROM node:20-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY apps/api/drizzle ./apps/api/drizzle

CMD ["node", "apps/api/dist/index.js"]
