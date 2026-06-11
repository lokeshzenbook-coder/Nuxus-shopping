# ──────────────────────────────────────────────
# Stage 1: Builder
# ──────────────────────────────────────────────
FROM node:20-alpine3.19 AS builder

WORKDIR /app

# Re-declare ARGs AFTER FROM so they are available in RUN layers
ARG CURL_VERSION=8.9.1-r2
ARG BASH_VERSION=5.2.26-r0
ARG GIT_VERSION=2.45.2-r0

# Install system dependencies with pinned versions
# hadolint ignore=DL3018
RUN apk update && \
    apk add --no-cache \
        curl=${CURL_VERSION} \
        bash=${BASH_VERSION} \
        git=${GIT_VERSION} && \
    rm -rf /var/cache/apk/*

# Copy dependency files first (better layer caching)
COPY package*.json ./

# Install ALL dependencies for build
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build --if-present

# ──────────────────────────────────────────────
# Stage 2: Production
# ──────────────────────────────────────────────
FROM node:20-alpine3.19 AS production

WORKDIR /app

# Re-declare ARGs in this stage too
ARG CURL_VERSION=8.9.1-r2

# Install only runtime dependencies
# hadolint ignore=DL3018
RUN apk update && \
    apk add --no-cache \
        curl=${CURL_VERSION} && \
    rm -rf /var/cache/apk/*

# Copy only production node_modules and built output
COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Security: non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]