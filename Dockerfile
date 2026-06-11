FROM node:20-alpine3.19

ARG CURL_VERSION=8.9.1-r2
ARG BASH_VERSION=5.2.26-r0
ARG GIT_VERSION=2.45.2-r0

WORKDIR /app

COPY package*.json ./

RUN apk update && \
    apk add --no-cache \
        curl=${CURL_VERSION} \
        bash=${BASH_VERSION} \
        git=${GIT_VERSION} && \
    npm ci --only=production && \
    npm cache clean --force

COPY . .

RUN npm run build --if-present

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]