# ──────────────────────────────────────────────────
# Stage 1: Builder
# ──────────────────────────────────────────────────
FROM node:20-alpine3.19 AS builder

# ✅ FIX: ARGs must be declared AFTER FROM to be usable in RUN
ARG CURL_VERSION=8.11.1-r0
ARG BASH_VERSION=5.2.26-r0
ARG GIT_VERSION=2.47.2-r0

WORKDIR /app

# ✅ FIX: ARGs now in scope — apk can resolve the variables
# hadolint ignore=DL3018
RUN apk update && \
    apk add --no-cache \
        curl=${CURL_VERSION} \
        bash=${BASH_VERSION} \
        git=${GIT_VERSION} && \
    rm -rf /var/cache/apk/*

# Copy manifests first for better layer caching
COPY package*.json ./

# Install all deps for build
RUN npm ci && \
    npm cache clean --force

# Copy source
COPY . .

# Build
RUN npm run build --if-present

# ──────────────────────────────────────────────────
# Stage 2: Production
# ──────────────────────────────────────────────────
FROM node:20-alpine3.19 AS production

# ✅ FIX: Re-declare ARG in every stage that needs it
ARG CURL_VERSION=8.11.1-r0

WORKDIR /app

# hadolint ignore=DL3018
RUN apk update && \
    apk add --no-cache \
        curl=${CURL_VERSION} && \
    rm -rf /var/cache/apk/*

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

# Copy only built output from builder
COPY --from=builder /app/dist ./dist

# Non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]