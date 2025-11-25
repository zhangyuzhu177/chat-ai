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
COPY projects/client/package.json projects/client/package.json

RUN pnpm install --filter client... --frozen-lockfile

FROM pnpm-base AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY projects/client ./projects/client
COPY --from=deps /root/.local/share/pnpm ${PNPM_HOME}
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/projects/client/node_modules ./projects/client/node_modules

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter client... run build

FROM node:${NODE_VERSION}-bookworm-slim AS runner

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY projects/client ./projects/client

RUN rm -rf projects/client/node_modules
RUN pnpm install --filter client... --prod --frozen-lockfile

COPY --from=builder /app/projects/client/.next ./projects/client/.next

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

WORKDIR /app/projects/client

CMD ["pnpm", "start"]
