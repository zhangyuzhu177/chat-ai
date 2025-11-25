# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22
ARG PNPM_VERSION=10.12.4

FROM node:${NODE_VERSION}-bookworm AS pnpm-base

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM pnpm-base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY projects/server/package.json projects/server/package.json

RUN pnpm install --filter server... --frozen-lockfile

FROM pnpm-base AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY projects/server ./projects/server
COPY --from=deps /root/.local/share/pnpm ${PNPM_HOME}
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/projects/server/node_modules ./projects/server/node_modules

RUN pnpm --filter server... run build

FROM node:${NODE_VERSION}-bookworm-slim AS runner

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY projects/server ./projects/server

RUN rm -rf projects/server/node_modules
RUN pnpm install --filter server... --prod --frozen-lockfile

COPY --from=builder /app/projects/server/dist ./projects/server/dist

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

WORKDIR /app/projects/server

CMD ["node", "dist/main.js"]
