FROM node:20-bookworm-slim AS base
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm ci

FROM base AS development
COPY apps/web ./apps/web
ENV NODE_ENV=development
EXPOSE 5173
WORKDIR /app
CMD ["npm", "run", "dev", "-w", "@pulseBoard/web", "--", "--host"]

FROM base AS builder
ARG VITE_API_URL=
ARG VITE_WS_URL=
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
COPY apps/web ./apps/web
RUN npm run build -w @pulseBoard/web

FROM nginx:alpine AS production
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
