# ──────────────────────────────────────────────────────────
# Stage 1 — Build
# ──────────────────────────────────────────────────────────
FROM node:25-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./

RUN npm ci

# Copy application source
COPY . .

# Build production SPA
RUN npm run build


# ──────────────────────────────────────────────────────────
# Stage 2 — Production
# ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default Nginx configuration and static files
RUN rm -rf /usr/share/nginx/html/* \
           /etc/nginx/conf.d/*

# Copy production SPA assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy hardened Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create required directories and non-root user
RUN addgroup -S nginxapp \
    && adduser -S -D -H -G nginxapp nginxapp \
    && mkdir -p /var/cache/nginx \
               /var/run \
               /var/log/nginx \
    && chown -R nginxapp:nginxapp \
               /usr/share/nginx/html \
               /var/cache/nginx \
               /var/run \
               /var/log/nginx \
               /etc/nginx

# Nginx listens on an unprivileged port
EXPOSE 8080

# Container health check
HEALTHCHECK --interval=30s \
            --timeout=5s \
            --start-period=10s \
            --retries=3 \
            CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

# Run Nginx as non-root
USER nginxapp

# Keep Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
