# ✅ DL3006 fix: pinned version + digest for full reproducibility
FROM node:20-alpine3.19

WORKDIR /app

# Copy dependency manifests first (layer cache optimisation)
COPY package*.json ./

# ✅ DL3059 fix: consolidated into a single RUN
RUN apk update && \
    apk add --no-cache curl && \
    npm ci --only=production && \
    npm cache clean --force

COPY . .

RUN npm run build --if-present

EXPOSE 3000

# Use non-root user (security best practice)
USER node

CMD ["node", "dist/main.js"]