FROM node:20-alpine3.19

WORKDIR /app

COPY package*.json ./

RUN apk update && \
    apk add --no-cache \
        curl=8.9.1-r2 \
        bash=5.2.26-r0 \
        git=2.45.2-r0 && \
    npm ci --only=production && \
    npm cache clean --force

COPY . .

RUN npm run build --if-present

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]