# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Install only prod deps later → keep dev here for build
COPY package*.json ./
RUN npm ci

COPY . .

# Build your app (e.g. TypeScript → dist)
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev


# ---------- Stage 2: Minimal Runtime ----------
FROM gcr.io/distroless/nodejs18-debian11

WORKDIR /app

# Copy only minimal required files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

# Distroless uses node as entrypoint
CMD ["dist/index.js"]
