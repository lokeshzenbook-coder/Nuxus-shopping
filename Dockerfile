FROM node:20-alpine3.19

WORKDIR /app

COPY package*.json ./

# ✅ All apk packages pinned to exact versions
RUN apk update && \
    apk add --no-cache \
        curl=8.5.0-r0 \
        bash=5.2.21-r0 \
        git=2.43.0-r0 && \
    npm ci --only=production && \
    npm cache clean --force

COPY . .

RUN npm run build --if-present

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]